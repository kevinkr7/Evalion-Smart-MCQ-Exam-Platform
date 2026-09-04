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
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-slate-400 mb-2">
          Upload a CSV file to add questions. Required columns:
        </p>
        <div className="flex flex-wrap gap-2 mb-4 text-xs font-mono">
          <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-300">question</span>
          <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-300">wrong1</span>
          <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-300">wrong2</span>
          <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-300">wrong3</span>
          <span className="px-2 py-1 rounded bg-indigo-500/20 border border-indigo-500/30 text-indigo-300">correct</span>
        </div>
      </div>

      <div className="space-y-5 p-5 bg-white/[0.02] border border-white/[0.05] rounded-xl">
        {/* Step 1: File Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">1. Select CSV File</label>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 transition-colors w-full sm:w-auto justify-center">
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => handleFile(e.target.files ? e.target.files[0] : null)}
                className="hidden"
              />
              <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none">
                <path d="M12 4v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 8l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="3" y="12" width="18" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              <span className="text-sm font-medium">{fileRows.length > 0 ? `${fileRows.length} rows loaded` : "Choose CSV File"}</span>
            </label>
            
            {fileRows.length > 0 && (
              <button
                onClick={() => { setFileRows([]); setPreview([]); setLastReport(null); }}
                className="px-3 py-2.5 text-sm rounded-xl text-slate-400 hover:text-white transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <hr className="border-white/10" />

        {/* Step 2: Target Set */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">2. Select Target Set</label>
          <div className="grid grid-cols-1 gap-4">
            <select
              value={selectedSetId}
              onChange={(e) => setSelectedSetId(e.target.value as any)}
              className="w-full bg-white/5 text-slate-100 px-4 py-2.5 rounded-xl border border-white/10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
            >
              <option value="new" className="bg-[#111116]">+ Create new set (recommended)</option>
              {sets.map(s => <option key={s.id} value={s.id} className="bg-[#111116]">{s.name}</option>)}
            </select>

            {selectedSetId === "new" && (
              <div className="bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/20">
                <label className="block text-xs font-medium text-indigo-300 mb-2">New Set Name</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    value={newSetName}
                    onChange={(e) => setNewSetName(e.target.value)}
                    placeholder="e.g. August Assessment"
                    className="flex-1 bg-white/5 text-slate-100 px-3 py-2 rounded-lg border border-white/10 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-600"
                  />
                  <button
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
                    className="px-4 py-2 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                  >
                    Create
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <hr className="border-white/10" />

        {/* Step 3: Upload */}
        <div>
          <button
            onClick={upload}
            disabled={uploading || fileRows.length === 0}
            className="w-full py-3 px-4 rounded-xl text-sm font-bold tracking-wide transition-all bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Uploading..." : "Upload Questions"}
          </button>
          
          {progressText && <div className="text-xs font-mono text-indigo-400 mt-2 text-center">{progressText}</div>}
          {lastReport && <div className="text-xs text-slate-400 mt-2 text-center p-2 bg-white/5 rounded-lg">{lastReport}</div>}
        </div>
      </div>

      {preview.length > 0 && (
        <div className="mt-2">
          <h4 className="text-sm font-medium text-slate-300 mb-2">Preview (first {preview.length} rows)</h4>
          <div className="overflow-auto max-h-56 border border-white/10 rounded-xl bg-white/[0.02] custom-scrollbar">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/10 text-slate-400">
                  <th className="px-3 py-2 font-medium">Question</th>
                  <th className="px-3 py-2 font-medium">Wrong 1</th>
                  <th className="px-3 py-2 font-medium">Wrong 2</th>
                  <th className="px-3 py-2 font-medium">Wrong 3</th>
                  <th className="px-3 py-2 font-medium text-indigo-300">Correct</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {preview.map((r, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="px-3 py-2 text-slate-200">{r.question}</td>
                    <td className="px-3 py-2 text-slate-400">{r.w1}</td>
                    <td className="px-3 py-2 text-slate-400">{r.w2}</td>
                    <td className="px-3 py-2 text-slate-400">{r.w3}</td>
                    <td className="px-3 py-2 text-indigo-300 font-medium">{r.correct}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
