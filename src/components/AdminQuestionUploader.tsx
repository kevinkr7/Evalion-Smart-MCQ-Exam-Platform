// src/components/AdminQuestionUploader.tsx
import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { Button } from "@/components/ui/button";

/**
 * AdminQuestionUploader
 *
 * Behavior:
 * - Each upload can create a new question set document (questionSets/{setId})
 *   and then upload each CSV row as a document inside
 *   questionSets/{setId}/questions (subcollection).
 * - Uses addDoc per question so writes are visible immediately in Firestore console.
 * - Minimal validation: needs at least 5 columns per row:
 *     question, wrong1, wrong2, wrong3, correct
 */

type PreviewRow = {
  question: string;
  w1: string;
  w2: string;
  w3: string;
  correct: string;
};

export default function AdminQuestionUploader() {
  const [fileRows, setFileRows] = useState<string[][]>([]);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [sets, setSets] = useState<{ id: string; name: string }[]>([]);
  const [selectedSetId, setSelectedSetId] = useState<string | "new">("new");
  const [newSetName, setNewSetName] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [progressText, setProgressText] = useState<string>("");
  const [lastReport, setLastReport] = useState<string | null>(null);

  // load existing sets
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const q = query(collection(db, "questionSets"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        if (!mounted) return;
        const rows = snap.docs.map(d => ({ id: d.id, name: (d.data() as any).name ?? d.id }));
        setSets(rows);
      } catch (err) {
        console.warn("Failed to load sets:", err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // CSV parsing (robust)
  const handleFile = (file: File | null) => {
    if (!file) return;
    setLastReport(null);
    Papa.parse(file, {
      skipEmptyLines: true,
      transformHeader: (h) => (h ?? "").toString().trim(),
      complete: (results) => {
        // normalize rows to arrays
        const raw = (results.data as any[]).map(row => {
          if (Array.isArray(row)) return row.map(c => (c ?? "").toString());
          if (typeof row === "object" && row !== null) return Object.values(row).map(v => (v ?? "").toString());
          return [String(row)];
        });

        // trim and filter empty rows
        const rows = raw
          .map(r => r.map((c: any) => (c ?? "").toString().trim()))
          .filter(r => r.some((c: string) => c.length > 0));

        setFileRows(rows);

        // build preview
        const p = rows.slice(0, 50).map((r) => {
          const [question, w1, w2, w3, correct] = r;
          return {
            question: question ?? "",
            w1: w1 ?? "",
            w2: w2 ?? "",
            w3: w3 ?? "",
            correct: correct ?? "",
          };
        });
        setPreview(p);
      },
      error: (err) => {
        console.error("CSV parse error:", err);
        alert("CSV parse error: " + err.message);
      },
    });
  };

  // Build a question payload from CSV row; returns null if invalid
  function buildPayloadFromRow(row: string[]) {
    // Expect at least 5 columns
    const [questionRaw, w1Raw, w2Raw, w3Raw, correctRaw] = row;
    const question = (questionRaw ?? "").toString().trim();
    const w1 = (w1Raw ?? "").toString().trim();
    const w2 = (w2Raw ?? "").toString().trim();
    const w3 = (w3Raw ?? "").toString().trim();
    const correct = (correctRaw ?? "").toString().trim();

    if (!question) return null;
    if (!correct) return null; // require correct text
    // Note: accept missing wrong answers (still uploadable), but we prefer 4 choices.
    const choicesArr = [w1, w2, w3, correct].map(s => s ?? "");
    // create choices labeled A-D in the order provided (no shuffle)
    const choices = { A: choicesArr[0] || "", B: choicesArr[1] || "", C: choicesArr[2] || "", D: choicesArr[3] || "" };
    // find correct label by matching value (if duplicate values exist, picks first)
    const correctLabel = (Object.keys(choices) as (keyof typeof choices)[]).find(k => choices[k] === correct) ?? "D";

    return {
      text: question,
      choices,
      correctOption: correctLabel,
      active: true,
      createdAt: serverTimestamp(),
    };
  }

  // create a new set doc and return its id
  async function createSet(name: string) {
    const col = collection(db, "questionSets");
    const docRef = await addDoc(col, { name: name || `set-${new Date().toISOString()}`, createdAt: serverTimestamp() });
    return docRef.id;
  }

  // Upload rows: create set (if new) then addDoc per question into subcollection
  async function upload() {
    setLastReport(null);
    if (!fileRows || fileRows.length === 0) {
      alert("No CSV loaded. Choose a CSV file first.");
      return;
    }

    setUploading(true);
    setProgressText(`0 / ${fileRows.length}`);

    try {
      // determine set
      let targetSetId = selectedSetId === "new" ? null : selectedSetId;
      if (!targetSetId) {
        // create new set now
        const nameToUse = newSetName?.trim() || `set-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}`;
        targetSetId = await createSet(nameToUse);
        // refresh sets list quickly
        const q = query(collection(db, "questionSets"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setSets(snap.docs.map(d => ({ id: d.id, name: (d.data() as any).name ?? d.id })));
        // select created set for UI
        setSelectedSetId(targetSetId);
      }

      if (!targetSetId) {
        throw new Error("No target set id available");
      }

      // upload rows (per-row addDoc to subcollection questionSets/{setId}/questions)
      let succeeded = 0;
      let failed = 0;

      for (let i = 0; i < fileRows.length; i++) {
        const row = fileRows[i];
        setProgressText(`${i + 1} / ${fileRows.length} (s:${succeeded} f:${failed})`);
        const payload = buildPayloadFromRow(row);
        if (!payload) {
          console.warn("Skipping invalid row", i, row);
          failed++;
          continue;
        }
        try {
          const qcol = collection(db, "questionSets", targetSetId, "questions");
          const qdoc = await addDoc(qcol, payload);
          console.log(`Uploaded question ${i} -> id=${qdoc.id}`);
          succeeded++;
        } catch (err) {
          console.error("Error writing question row", i, err);
          failed++;
        }
      }

      const report = `Upload finished. succeeded: ${succeeded}, failed: ${failed}.`;
      setLastReport(report);
      alert(report + (failed ? " — check console for row-level errors." : ""));
      // clear UI rows & preview
      setFileRows([]);
      setPreview([]);
      setProgressText("");
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed: " + (err as any)?.message ?? String(err));
    } finally {
      setUploading(false);
    }
  }

  // mark selected set active in settings
  async function markActive() {
    if (!selectedSetId || selectedSetId === "new") return alert("Select or create a set first");
    try {
      await setDoc(doc(db, "settings", "questions"), { activeSetId: selectedSetId }, { merge: true });
      alert("Marked set active");
    } catch (err) {
      console.error("Failed to mark active:", err);
      alert("Failed to mark active: " + (err as any)?.message ?? String(err));
    }
  }

  return (
    <div className="p-4 bg-[rgba(7,10,23,0.6)] border border-slate-800 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-1">Upload Questions (CSV)</h3>
      <p className="text-sm text-slate-300 mb-3">
        CSV columns: <strong className="text-white">question, wrong1, wrong2, wrong3, correct</strong>.
      </p>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3">
          {/* Row 1: File picker */}
          <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded bg-[rgba(255,255,255,0.03)] border border-slate-700 text-slate-200 hover:bg-[rgba(255,255,255,0.05)] w-fit">
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => handleFile(e.target.files ? e.target.files[0] : null)}
              className="hidden"
            />
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M12 4v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 8l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="3" y="12" width="18" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <span className="text-sm">Choose CSV</span>
          </label>

          {/* Row 2: Clear + Upload */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => { setFileRows([]); setPreview([]); setLastReport(null); }}
              variant="muted"
              className="flex-1 text-slate-200 border border-slate-700 hover:bg-slate-800"
            >
              Clear
            </Button>

            <Button
              onClick={upload}
              disabled={uploading || fileRows.length === 0}
              className="flex-1 bg-gradient-to-r from-[#6366f1] to-[#7c3aed] text-white"
            >
              {uploading ? "Uploading..." : "Upload (create set & questions)"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
  <div>
    <label className="block text-xs text-slate-300 mb-1">Upload target</label>
    <select
      value={selectedSetId}
      onChange={(e) => setSelectedSetId(e.target.value as any)}
      className="w-full bg-[#071022] text-slate-100 px-3 py-2 rounded border border-slate-700"
    >
      <option value="new">Create new set (recommended)</option>
      {sets.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
    </select>
  </div>

  <div className="overflow-hidden">
    <label className="block text-xs text-slate-300 mb-1">If creating new set, give it a name (optional)</label>
    <input
      value={newSetName}
      onChange={(e) => setNewSetName(e.target.value)}
      placeholder="My August set (optional)"
      className="w-full bg-[#071022] text-slate-100 px-3 py-2 rounded border border-slate-700"
    />

    {/* Responsive button group: stacked on small screens, row on larger screens */}
    <div className="mt-2 flex flex-col sm:flex-row gap-2">
      <Button
        onClick={() => {
          if (!newSetName.trim()) return alert("Enter a set name");
          createSet(newSetName.trim())
            .then(id => {
              setSelectedSetId(id);
              alert("Set created: " + id);
            })
            .catch(err => {
              console.error(err);
              alert("Create failed");
            });
        }}
        className="w-full sm:w-auto flex-1"
      >
        Create set now
      </Button>
    </div>
  </div>
</div>


        {progressText && <div className="text-sm text-slate-300 mt-1">Progress: {progressText}</div>}
        {lastReport && <div className="text-sm text-slate-300 mt-1">Report: {lastReport}</div>}

        {preview.length > 0 && (
          <div>
            <h4 className="font-medium text-white">Preview (first {preview.length} rows)</h4>
            <div className="overflow-auto max-h-56 border border-slate-800 rounded mt-2 p-2 bg-[rgba(10,15,25,0.35)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-300">
                    <th className="p-2 text-left">Q</th>
                    <th className="p-2 text-left">wrong1</th>
                    <th className="p-2 text-left">wrong2</th>
                    <th className="p-2 text-left">wrong3</th>
                    <th className="p-2 text-left">correct</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((r, idx) => (
                    <tr key={idx} className="border-t border-slate-800">
                      <td className="p-2 text-slate-100">{r.question}</td>
                      <td className="p-2 text-slate-300">{r.w1}</td>
                      <td className="p-2 text-slate-300">{r.w2}</td>
                      <td className="p-2 text-slate-300">{r.w3}</td>
                      <td className="p-2 text-slate-300">{r.correct}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
