import React from 'react';

export function LandingContent() {
  return (
    <>
      <div>
        <section className="hr-section hr-lifecycle" id="hr-lifecycle">
          <span className="hr-eyebrow">
            <svg viewBox="0 0 10 12" fill="#2563EB"><polygon score="0,0 10,6 0,12" /></svg>
            End to End
          </span>
          <h2>The complete assessment lifecycle.</h2>
          <p className="hr-section__desc">Build your assessment.</p>
          <div className="hr-lifecycle__track" id="hr-lifecycle-track">
            <div className="hr-lifecycle__line" aria-hidden="true"><span className="hr-lifecycle__line-fill" /></div>
            <div className="hr-lifecycle__node">
              <div className="hr-lifecycle__dot"><i className="ph ph-user-plus" /></div>
              <span className="hr-lifecycle__label">01 — Create</span>
            </div>
            <div className="hr-lifecycle__node">
              <div className="hr-lifecycle__dot"><i className="ph ph-rocket-launch" /></div>
              <span className="hr-lifecycle__label">02 — Configure</span>
              <span style={{ fontSize: 12, opacity: 0.7, fontWeight: 400 }}>Set time limits, scoring, attempts, and assessment rules.</span>
            </div>
            <div className="hr-lifecycle__node">
              <div className="hr-lifecycle__dot"><i className="ph ph-graduation-cap" /></div>
              <span className="hr-lifecycle__label">03 — Assess</span>
              <span style={{ fontSize: 12, opacity: 0.7, fontWeight: 400 }}>Participants complete secure evaluations.</span>
            </div>
            <div className="hr-lifecycle__node">
              <div className="hr-lifecycle__dot"><i className="ph ph-medal" /></div>
              <span className="hr-lifecycle__label">04 — Evaluate</span>
              <span style={{ fontSize: 12, opacity: 0.7, fontWeight: 400 }}>Automated scoring and result processing.</span>
            </div>
            <div className="hr-lifecycle__node">
              <div className="hr-lifecycle__dot"><i className="ph ph-hand-waving" /></div>
              <span className="hr-lifecycle__label">05 — Analyze</span>
              <span style={{ fontSize: 12, opacity: 0.7, fontWeight: 400 }}>Review performance and identify knowledge gaps.</span>
            </div>
          </div>
        </section>
        {/* ═══════════════════════════════════════════════
     3. JOB POSTINGS
     ═══════════════════════════════════════════════ */}
        <section className="hr-section" style={{ paddingTop: 60 }}>
          <span className="hr-eyebrow">
            <svg viewBox="0 0 10 12" fill="#2563EB"><polygon score="0,0 10,6 0,12" /></svg>
            Live Assessments
          </span>
          <h2>Launch assessments and measure performance.</h2>
          <p className="hr-section__desc">Publish assessments with defined time limits, scoring rules, and attempt policies. Every submission is captured automatically for evaluation and review.</p>
          <div className="hr-vacancies" id="hr-vacancies" style={{ opacity: 0, transform: 'translateY(40px)', transition: 'opacity 0.7s, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)' }}>
            <div className="hr-vac-window" style={{ position: 'relative', maxWidth: 820, margin: '0 auto' }}>
              <div className="hr-vac-window__bar">
                <div className="sk-dots"><i /><i /><i /></div>
                <span className="sk-filename">Live Assessments · Acme Corp</span>
              </div>
              <div className="hr-vac-window__body">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                      <th style={{ padding: '14px 16px', fontWeight: 500, fontSize: 10, color: 'var(--hr-gris-400)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Assessment</th>
                      <th style={{ padding: '14px 16px', fontWeight: 500, fontSize: 10, color: 'var(--hr-gris-400)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Category</th>
                      <th style={{ padding: '14px 16px', fontWeight: 500, fontSize: 10, color: 'var(--hr-gris-400)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Duration</th>
                      <th style={{ padding: '14px 16px', fontWeight: 500, fontSize: 10, color: 'var(--hr-gris-400)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Status</th>
                      <th style={{ padding: '14px 16px', fontWeight: 500, fontSize: 10, color: 'var(--hr-gris-400)', textTransform: 'uppercase', letterSpacing: '0.6px', textAlign: 'center' }}>Attempts</th>
                      <th style={{ padding: '14px 16px', fontWeight: 500, fontSize: 10, color: 'var(--hr-gris-400)', textTransform: 'uppercase', letterSpacing: '0.6px', textAlign: 'right' }}>Published</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                      <td style={{ padding: '10px 16px' }}><div style={{ fontWeight: 500, color: 'var(--c-negro)', lineHeight: '1.3' }}>Java Fundamentals</div><div style={{ fontSize: 11, color: 'var(--hr-gris-400)', fontFamily: '"Geist Mono",monospace' }}>VAC-8A3F</div></td>
                      <td style={{ padding: '10px 16px', color: 'var(--hr-gris-600)' }}><div>Technical</div><div style={{ fontSize: 11, color: 'var(--hr-gris-400)' }}>Remote</div></td>
                      <td style={{ padding: '10px 16px', color: 'var(--hr-gris-600)' }}>25 min</td>
                      <td style={{ padding: '10px 16px' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '2px 10px', borderRadius: 100, background: 'rgba(2,162,112,0.08)', color: '#02A270', fontWeight: 500 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#02A270' }} />Open</span></td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 500, color: 'var(--c-negro)' }}>1 / 2</td>
                      <td style={{ padding: '10px 16px', color: 'var(--hr-gris-400)', textAlign: 'right', fontSize: 12 }}>Jun 19, 2026</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                      <td style={{ padding: '10px 16px' }}><div style={{ fontWeight: 500, color: 'var(--c-negro)', lineHeight: '1.3' }}>Python Assessment</div><div style={{ fontSize: 11, color: 'var(--hr-gris-400)', fontFamily: '"Geist Mono",monospace' }}>VAC-1D7B</div></td>
                      <td style={{ padding: '10px 16px', color: 'var(--hr-gris-600)' }}><div>Technical</div><div style={{ fontSize: 11, color: 'var(--hr-gris-400)' }}>Hybrid</div></td>
                      <td style={{ padding: '10px 16px', color: 'var(--hr-gris-600)' }}>30 min</td>
                      <td style={{ padding: '10px 16px' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '2px 10px', borderRadius: 100, background: 'rgba(2,162,112,0.08)', color: '#02A270', fontWeight: 500 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#02A270' }} />Open</span></td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 500, color: 'var(--c-negro)' }}>0 / 2</td>
                      <td style={{ padding: '10px 16px', color: 'var(--hr-gris-400)', textAlign: 'right', fontSize: 12 }}>Jun 21, 2026</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                      <td style={{ padding: '10px 16px' }}><div style={{ fontWeight: 500, color: 'var(--c-negro)', lineHeight: '1.3' }}>Database Concepts</div><div style={{ fontSize: 11, color: 'var(--hr-gris-400)', fontFamily: '"Geist Mono",monospace' }}>VAC-4E2C</div></td>
                      <td style={{ padding: '10px 16px', color: 'var(--hr-gris-600)' }}><div>Technical</div><div style={{ fontSize: 11, color: 'var(--hr-gris-400)' }}>Remote</div></td>
                      <td style={{ padding: '10px 16px', color: 'var(--hr-gris-600)' }}>20 min</td>
                      <td style={{ padding: '10px 16px' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '2px 10px', borderRadius: 100, background: 'rgba(2,162,112,0.08)', color: '#02A270', fontWeight: 500 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#02A270' }} />Open</span></td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 500, color: 'var(--c-negro)' }}>0 / 2</td>
                      <td style={{ padding: '10px 16px', color: 'var(--hr-gris-400)', textAlign: 'right', fontSize: 12 }}>Jun 23, 2026</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                      <td style={{ padding: '10px 16px' }}><div style={{ fontWeight: 500, color: 'var(--c-negro)', lineHeight: '1.3' }}>Web Development</div><div style={{ fontSize: 11, color: 'var(--hr-gris-400)', fontFamily: '"Geist Mono",monospace' }}>VAC-7F91</div></td>
                      <td style={{ padding: '10px 16px', color: 'var(--hr-gris-600)' }}><div>Technical</div><div style={{ fontSize: 11, color: 'var(--hr-gris-400)' }}>On-site</div></td>
                      <td style={{ padding: '10px 16px', color: 'var(--hr-gris-600)' }}>25 min</td>
                      <td style={{ padding: '10px 16px' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '2px 10px', borderRadius: 100, background: 'rgba(253,191,0,0.1)', color: '#D97706', fontWeight: 500 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FDBF00' }} />Draft</span></td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 500, color: 'var(--c-negro)' }}>2 / 2</td>
                      <td style={{ padding: '10px 16px', color: 'var(--hr-gris-400)', textAlign: 'right', fontSize: 12 }}>—</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                      <td style={{ padding: '10px 16px' }}><div style={{ fontWeight: 500, color: 'var(--c-negro)', lineHeight: '1.3' }}>Data Structures</div><div style={{ fontSize: 11, color: 'var(--hr-gris-400)', fontFamily: '"Geist Mono",monospace' }}>VAC-2B5E</div></td>
                      <td style={{ padding: '10px 16px', color: 'var(--hr-gris-600)' }}><div>Computer Science</div><div style={{ fontSize: 11, color: 'var(--hr-gris-400)' }}>Remote</div></td>
                      <td style={{ padding: '10px 16px', color: 'var(--hr-gris-600)' }}>25 min</td>
                      <td style={{ padding: '10px 16px' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '2px 10px', borderRadius: 100, background: 'rgba(2,162,112,0.08)', color: '#02A270', fontWeight: 500 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#02A270' }} />Open</span></td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 500, color: 'var(--c-negro)' }}>0 / 2</td>
                      <td style={{ padding: '10px 16px', color: 'var(--hr-gris-400)', textAlign: 'right', fontSize: 12 }}>Jun 10, 2026</td>
                    </tr>
                  </tbody>
                </table>
                <div className="hr-vac-cards">
                  <div className="hr-vac-card">
                    <div className="hr-vac-card__head">
                      <div><div className="hr-vac-card__title">Java Fundamentals</div><span className="hr-vac-card__code">VAC-8A3F</span></div>
                      <span className="hr-vac-card__badge hr-vac-card__badge--open"><span />Open</span>
                    </div>
                    <div className="hr-vac-card__meta">
                      <span>Technical</span>
                      <span>25 min</span>
                      <span>1 / 2 attempts</span>
                    </div>
                  </div>
                  <div className="hr-vac-card">
                    <div className="hr-vac-card__head">
                      <div><div className="hr-vac-card__title">Python Assessment</div><span className="hr-vac-card__code">VAC-1D7B</span></div>
                      <span className="hr-vac-card__badge hr-vac-card__badge--open"><span />Open</span>
                    </div>
                    <div className="hr-vac-card__meta">
                      <span>Technical</span>
                      <span>30 min</span>
                      <span>0 / 2 attempts</span>
                    </div>
                  </div>
                  <div className="hr-vac-card">
                    <div className="hr-vac-card__head">
                      <div><div className="hr-vac-card__title">Database Concepts</div><span className="hr-vac-card__code">VAC-4E2C</span></div>
                      <span className="hr-vac-card__badge hr-vac-card__badge--open"><span />Open</span>
                    </div>
                    <div className="hr-vac-card__meta">
                      <span>Technical</span>
                      <span>20 min</span>
                      <span>0 / 2 attempts</span>
                    </div>
                  </div>
                  <div className="hr-vac-card">
                    <div className="hr-vac-card__head">
                      <div><div className="hr-vac-card__title">Web Development</div><span className="hr-vac-card__code">VAC-7F91</span></div>
                      <span className="hr-vac-card__badge hr-vac-card__badge--draft"><span />Draft</span>
                    </div>
                    <div className="hr-vac-card__meta">
                      <span>Technical</span>
                      <span>25 min</span>
                      <span>2 / 2 attempts</span>
                    </div>
                  </div>
                  <div className="hr-vac-card">
                    <div className="hr-vac-card__head">
                      <div><div className="hr-vac-card__title">Data Structures</div><span className="hr-vac-card__code">VAC-2B5E</span></div>
                      <span className="hr-vac-card__badge hr-vac-card__badge--open"><span />Open</span>
                    </div>
                    <div className="hr-vac-card__meta">
                      <span>Computer Science</span>
                      <span>25 min</span>
                      <span>0 / 2 attempts</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rpt-dash-fade" />
            </div>
          </div>
        </section>
        {/* ═══════════════════════════════════════════════
     4. ASSESSMENTS & QUIZZES
     ═══════════════════════════════════════════════ */}
        <section className="hr-section" style={{ paddingTop: 60, paddingBottom: 0 }}>
          <span className="hr-eyebrow">
            <svg viewBox="0 0 10 12" fill="#2563EB"><polygon score="0,0 10,6 0,12" /></svg>
            Assessments
          </span>
          <h2>Evaluate every attempt with automated scoring.</h2>
          <p className="hr-section__desc">Create structured assessments with configurable scoring, time limits, attempt policies, and automatic evaluation. Every response is recorded for accurate result tracking.</p>
          <div className="rpt-dash-wrap">
            <div className="hr-eval-dash" id="hr-eval">
              {/* Paper background */}
              <div className="hr-paper">
                <div className="hr-paper__pattern" />
              </div>
              {/* Quiz components floating on top */}
              <div className="hr-quiz__layer">
                <div className="hr-quiz__header" style={{ opacity: 0, transform: 'translateY(40px)', willChange: 'opacity, transform' }}>
                  <span className="hr-quiz__title">Computer Science 101</span>
                  <span className="hr-quiz__counter">Question 4 of 10</span>
                </div>
                <div className="hr-quiz__progress" style={{ opacity: 0, transform: 'translateY(40px)', willChange: 'opacity, transform' }}>
                  <div className="hr-quiz__progress-steps">
                    <span className="hr-quiz__step hr-quiz__step--done" />
                    <span className="hr-quiz__step hr-quiz__step--done" />
                    <span className="hr-quiz__step hr-quiz__step--done" />
                    <span className="hr-quiz__step hr-quiz__step--active" />
                    <span className="hr-quiz__step" />
                    <span className="hr-quiz__step" />
                    <span className="hr-quiz__step" />
                    <span className="hr-quiz__step" />
                    <span className="hr-quiz__step" />
                    <span className="hr-quiz__step" />
                  </div>
                  <div className="hr-quiz__progress-meta">
                    <span className="hr-quiz__progress-count"><i className="ph ph-timer" /> 08:32</span>
                    <span className="hr-quiz__progress-count">Attempt 1 of 3</span>
                  </div>
                </div>
                <div className="hr-quiz__question" style={{ opacity: 0, transform: 'translateY(40px)', willChange: 'opacity, transform' }}>
                  What is the worst-case time complexity of searching for an element in a balanced Binary Search Tree (BST)?
                </div>
                <div className="hr-quiz__options">
                  <div className="hr-quiz__option" style={{ opacity: 0, transform: 'translateY(40px)', willChange: 'opacity, transform' }}>
                    <span className="hr-quiz__option-letter">A</span>
                    <span className="hr-quiz__option-text">O(1)</span>
                  </div>
                  <div className="hr-quiz__option" style={{ opacity: 0, transform: 'translateY(40px)', willChange: 'opacity, transform' }}>
                    <span className="hr-quiz__option-letter">B</span>
                    <span className="hr-quiz__option-text">O(n)</span>
                  </div>
                  <div className="hr-quiz__option hr-quiz__option--selected" style={{ opacity: 0, transform: 'translateY(40px)', willChange: 'opacity, transform' }}>
                    <span className="hr-quiz__option-letter">C</span>
                    <span className="hr-quiz__option-text">O(log n)</span>
                  </div>
                  <div className="hr-quiz__option" style={{ opacity: 0, transform: 'translateY(40px)', willChange: 'opacity, transform' }}>
                    <span className="hr-quiz__option-letter">D</span>
                    <span className="hr-quiz__option-text">O(n log n)</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="rpt-dash-fade" />
          </div>
        </section>
        {/* ═══════════════════════════════════════════════
     GAMIFICATION TAKEOVER — SCROLL HIJACK (SPACE)
     ═══════════════════════════════════════════════ */}
        <div className="hr-cert-wrapper" id="hr-cert-wrapper">
          <div className="hr-cert-stage" id="hr-cert-stage">
            <div className="hr-cert-stars" id="hr-cert-stars"><div className="hr-cert-star" style={{ left: '43.3994%', top: '1.27527%', width: '2.22447px', height: '2.22447px', '--dur': '2.339526035461996s', animationDelay: '4.17332s' }} /><div className="hr-cert-star" style={{ left: '47.6271%', top: '2.20216%', width: '2.82099px', height: '2.82099px', '--dur': '3.9386942222396852s', animationDelay: '0.195314s' }} /><div className="hr-cert-star" style={{ left: '70.7683%', top: '81.7769%', width: '3.27296px', height: '3.27296px', '--dur': '4.839776044549282s', animationDelay: '2.73634s' }} /><div className="hr-cert-star" style={{ left: '20.756%', top: '44.5945%', width: '2.56285px', height: '2.56285px', '--dur': '5.186421444437073s', animationDelay: '4.50901s' }} /><div className="hr-cert-star" style={{ left: '47.3147%', top: '19.9446%', width: '2.64285px', height: '2.64285px', '--dur': '5.198358239921031s', animationDelay: '1.0861s' }} /><div className="hr-cert-star" style={{ left: '28.2308%', top: '46.1664%', width: '2.33341px', height: '2.33341px', '--dur': '2.6969478596331684s', animationDelay: '2.20966s' }} /><div className="hr-cert-star" style={{ left: '68.752%', top: '71.338%', width: '3.19402px', height: '3.19402px', '--dur': '4.380673038024785s', animationDelay: '4.38339s' }} /><div className="hr-cert-star" style={{ left: '42.486%', top: '32.8388%', width: '1.39105px', height: '1.39105px', '--dur': '3.624487086126251s', animationDelay: '4.0564s' }} /><div className="hr-cert-star" style={{ left: '37.0683%', top: '93.3023%', width: '2.06915px', height: '2.06915px', '--dur': '4.045138659076624s', animationDelay: '2.64084s' }} /><div className="hr-cert-star" style={{ left: '16.5047%', top: '51.6153%', width: '1.27674px', height: '1.27674px', '--dur': '3.266986032081656s', animationDelay: '1.79531s' }} /><div className="hr-cert-star" style={{ left: '35.6041%', top: '56.6554%', width: '3.24572px', height: '3.24572px', '--dur': '2.6258407543830184s', animationDelay: '1.41649s' }} /><div className="hr-cert-star" style={{ left: '97.3765%', top: '77.3697%', width: '1.89374px', height: '1.89374px', '--dur': '4.765352065164995s', animationDelay: '2.18831s' }} /><div className="hr-cert-star" style={{ left: '37.7211%', top: '17.3215%', width: '2.03119px', height: '2.03119px', '--dur': '4.368616765036621s', animationDelay: '4.67405s' }} /><div className="hr-cert-star" style={{ left: '72.703%', top: '36.0958%', width: '3.39054px', height: '3.39054px', '--dur': '2.621005187167279s', animationDelay: '4.98417s' }} /><div className="hr-cert-star" style={{ left: '70.0494%', top: '31.7745%', width: '1.89524px', height: '1.89524px', '--dur': '5.02884882235921s', animationDelay: '3.79887s' }} /><div className="hr-cert-star" style={{ left: '82.1597%', top: '82.3904%', width: '3.16729px', height: '3.16729px', '--dur': '5.940572228305067s', animationDelay: '4.80026s' }} /><div className="hr-cert-star" style={{ left: '17.7436%', top: '55.6854%', width: '2.57006px', height: '2.57006px', '--dur': '3.2789140255535196s', animationDelay: '0.720894s' }} /><div className="hr-cert-star" style={{ left: '20.8919%', top: '95.2934%', width: '2.00952px', height: '2.00952px', '--dur': '2.643539520373036s', animationDelay: '0.217973s' }} /><div className="hr-cert-star" style={{ left: '29.4041%', top: '19.877%', width: '2.98697px', height: '2.98697px', '--dur': '5.194059656910161s', animationDelay: '3.26909s' }} /><div className="hr-cert-star" style={{ left: '97.9181%', top: '74.0346%', width: '1.73803px', height: '1.73803px', '--dur': '4.9117384561877255s', animationDelay: '3.90311s' }} /><div className="hr-cert-star" style={{ left: '96.7674%', top: '65.6573%', width: '2.00907px', height: '2.00907px', '--dur': '5.750881829262525s', animationDelay: '1.1744s' }} /><div className="hr-cert-star" style={{ left: '70.6602%', top: '16.2459%', width: '3.47273px', height: '3.47273px', '--dur': '5.270606320214057s', animationDelay: '2.85067s' }} /><div className="hr-cert-star" style={{ left: '53.1589%', top: '57.1661%', width: '2.71154px', height: '2.71154px', '--dur': '5.1856710509381845s', animationDelay: '1.17094s' }} /><div className="hr-cert-star" style={{ left: '94.1616%', top: '86.8138%', width: '3.24851px', height: '3.24851px', '--dur': '5.32885898507554s', animationDelay: '3.97481s' }} /><div className="hr-cert-star" style={{ left: '23.0258%', top: '92.0403%', width: '1.29531px', height: '1.29531px', '--dur': '4.528762167011957s', animationDelay: '4.54722s' }} /><div className="hr-cert-star" style={{ left: '7.24729%', top: '95.724%', width: '1.29772px', height: '1.29772px', '--dur': '4.5350703118719125s', animationDelay: '2.8832s' }} /><div className="hr-cert-star" style={{ left: '10.7567%', top: '81.5224%', width: '2.98027px', height: '2.98027px', '--dur': '2.9287646542752848s', animationDelay: '2.4954s' }} /><div className="hr-cert-star" style={{ left: '93.4315%', top: '1.49875%', width: '2.3109px', height: '2.3109px', '--dur': '2.3634877658752766s', animationDelay: '2.01201s' }} /><div className="hr-cert-star" style={{ left: '63.3931%', top: '11.4893%', width: '3.23084px', height: '3.23084px', '--dur': '3.9645848518933704s', animationDelay: '1.45082s' }} /><div className="hr-cert-star" style={{ left: '35.9472%', top: '79.6997%', width: '2.51295px', height: '2.51295px', '--dur': '5.652723461200619s', animationDelay: '2.19337s' }} /><div className="hr-cert-star" style={{ left: '47.9432%', top: '59.5864%', width: '2.46739px', height: '2.46739px', '--dur': '5.492288540079278s', animationDelay: '2.65972s' }} /><div className="hr-cert-star" style={{ left: '59.8749%', top: '70.7169%', width: '2.514px', height: '2.514px', '--dur': '4.024908438238917s', animationDelay: '0.127271s' }} /><div className="hr-cert-star" style={{ left: '70.3903%', top: '17.1468%', width: '3.06389px', height: '3.06389px', '--dur': '3.222596430843172s', animationDelay: '3.66669s' }} /><div className="hr-cert-star" style={{ left: '47.0682%', top: '77.9412%', width: '1.02214px', height: '1.02214px', '--dur': '5.684352779106961s', animationDelay: '2.10851s' }} /><div className="hr-cert-star" style={{ left: '35.8194%', top: '90.3539%', width: '1.96569px', height: '1.96569px', '--dur': '2.635835401659636s', animationDelay: '2.07968s' }} /><div className="hr-cert-star" style={{ left: '40.2937%', top: '33.5746%', width: '2.7894px', height: '2.7894px', '--dur': '3.4071548849842634s', animationDelay: '2.5117s' }} /><div className="hr-cert-star" style={{ left: '92.4593%', top: '66.1441%', width: '2.38925px', height: '2.38925px', '--dur': '5.828486651056215s', animationDelay: '2.48361s' }} /><div className="hr-cert-star" style={{ left: '39.6501%', top: '85.1063%', width: '3.361px', height: '3.361px', '--dur': '5.385567879904458s', animationDelay: '4.25173s' }} /><div className="hr-cert-star" style={{ left: '29.0417%', top: '17.7341%', width: '2.09453px', height: '2.09453px', '--dur': '5.867542241207586s', animationDelay: '4.67178s' }} /><div className="hr-cert-star" style={{ left: '75.9807%', top: '68.6804%', width: '1.56259px', height: '1.56259px', '--dur': '3.061186943647011s', animationDelay: '2.46322s' }} /><div className="hr-cert-star" style={{ left: '32.1447%', top: '71.1178%', width: '2.89273px', height: '2.89273px', '--dur': '5.577200831174908s', animationDelay: '1.42949s' }} /><div className="hr-cert-star" style={{ left: '64.7669%', top: '20.3663%', width: '1.3828px', height: '1.3828px', '--dur': '2.084264957082976s', animationDelay: '2.82841s' }} /><div className="hr-cert-star" style={{ left: '74.2847%', top: '86.1189%', width: '2.69441px', height: '2.69441px', '--dur': '3.569973305310409s', animationDelay: '4.18846s' }} /><div className="hr-cert-star" style={{ left: '40.2232%', top: '30.4162%', width: '2.85545px', height: '2.85545px', '--dur': '3.952157035458785s', animationDelay: '1.00011s' }} /><div className="hr-cert-star" style={{ left: '17.0902%', top: '98.5532%', width: '2.5085px', height: '2.5085px', '--dur': '5.717048123470404s', animationDelay: '0.959639s' }} /><div className="hr-cert-star" style={{ left: '80.0842%', top: '61.0175%', width: '1.87049px', height: '1.87049px', '--dur': '4.649904776562272s', animationDelay: '1.30184s' }} /><div className="hr-cert-star" style={{ left: '65.9732%', top: '27.0265%', width: '2.76557px', height: '2.76557px', '--dur': '4.193279096420225s', animationDelay: '4.98777s' }} /><div className="hr-cert-star" style={{ left: '41.1498%', top: '9.37419%', width: '2.90222px', height: '2.90222px', '--dur': '2.180052326816779s', animationDelay: '1.37214s' }} /><div className="hr-cert-star" style={{ left: '70.3232%', top: '23.1928%', width: '2.22339px', height: '2.22339px', '--dur': '3.1309781066641684s', animationDelay: '4.87106s' }} /><div className="hr-cert-star" style={{ left: '18.5098%', top: '58.1141%', width: '1.78376px', height: '1.78376px', '--dur': '2.0469400441452446s', animationDelay: '1.74199s' }} /><div className="hr-cert-star" style={{ left: '56.6883%', top: '51.939%', width: '1.54854px', height: '1.54854px', '--dur': '4.426771621336963s', animationDelay: '1.28533s' }} /><div className="hr-cert-star" style={{ left: '40.9848%', top: '25.621%', width: '1.53341px', height: '1.53341px', '--dur': '2.561349160235709s', animationDelay: '3.37181s' }} /><div className="hr-cert-star" style={{ left: '31.1567%', top: '36.4112%', width: '3.42808px', height: '3.42808px', '--dur': '4.68332226746167s', animationDelay: '3.62833s' }} /><div className="hr-cert-star" style={{ left: '77.4436%', top: '90.5046%', width: '2.92306px', height: '2.92306px', '--dur': '5.196768438032078s', animationDelay: '0.207634s' }} /><div className="hr-cert-star" style={{ left: '96.6613%', top: '90.7985%', width: '1.6151px', height: '1.6151px', '--dur': '5.012380407986656s', animationDelay: '4.55457s' }} /><div className="hr-cert-star" style={{ left: '20.8092%', top: '82.6209%', width: '1.70559px', height: '1.70559px', '--dur': '5.969411914897061s', animationDelay: '4.29215s' }} /><div className="hr-cert-star" style={{ left: '96.8376%', top: '37.6732%', width: '3.08212px', height: '3.08212px', '--dur': '3.5265247636620733s', animationDelay: '4.67472s' }} /><div className="hr-cert-star" style={{ left: '23.9819%', top: '70.4479%', width: '1.45313px', height: '1.45313px', '--dur': '2.507922884744249s', animationDelay: '0.175954s' }} /><div className="hr-cert-star" style={{ left: '39.3623%', top: '81.941%', width: '3.1352px', height: '3.1352px', '--dur': '3.1023603559559536s', animationDelay: '2.13693s' }} /><div className="hr-cert-star" style={{ left: '50.4183%', top: '33.2653%', width: '2.61328px', height: '2.61328px', '--dur': '3.0083320601470325s', animationDelay: '0.749064s' }} /><div className="hr-cert-star" style={{ left: '92.6605%', top: '27.4626%', width: '2.67643px', height: '2.67643px', '--dur': '5.9701240069970165s', animationDelay: '1.54894s' }} /><div className="hr-cert-star" style={{ left: '10.2386%', top: '10.6774%', width: '2.36345px', height: '2.36345px', '--dur': '3.5696212457160494s', animationDelay: '0.424289s' }} /><div className="hr-cert-star" style={{ left: '93.7699%', top: '5.25032%', width: '3.32579px', height: '3.32579px', '--dur': '2.3891124431320345s', animationDelay: '3.1896s' }} /><div className="hr-cert-star" style={{ left: '64.1282%', top: '2.96654%', width: '1.02781px', height: '1.02781px', '--dur': '5.095154212533492s', animationDelay: '2.0217s' }} /><div className="hr-cert-star" style={{ left: '30.9697%', top: '34.9854%', width: '1.51778px', height: '1.51778px', '--dur': '3.4621217412711274s', animationDelay: '2.13571s' }} /><div className="hr-cert-star" style={{ left: '33.5548%', top: '28.7604%', width: '2.68332px', height: '2.68332px', '--dur': '3.294551531289789s', animationDelay: '1.26611s' }} /><div className="hr-cert-star" style={{ left: '85.5497%', top: '2.18797%', width: '3.0604px', height: '3.0604px', '--dur': '3.655974017016991s', animationDelay: '4.85736s' }} /><div className="hr-cert-star" style={{ left: '76.1391%', top: '13.6099%', width: '1.54684px', height: '1.54684px', '--dur': '5.655637896382206s', animationDelay: '1.40609s' }} /><div className="hr-cert-star" style={{ left: '14.3456%', top: '35.7488%', width: '2.74105px', height: '2.74105px', '--dur': '5.609733835352163s', animationDelay: '0.785336s' }} /><div className="hr-cert-star" style={{ left: '26.0765%', top: '84.2522%', width: '2.11426px', height: '2.11426px', '--dur': '4.512114390902575s', animationDelay: '4.11673s' }} /><div className="hr-cert-star" style={{ left: '53.2915%', top: '74.0034%', width: '2.66614px', height: '2.66614px', '--dur': '3.7482592615020303s', animationDelay: '4.48374s' }} /><div className="hr-cert-star" style={{ left: '47.8495%', top: '39.1999%', width: '1.03556px', height: '1.03556px', '--dur': '2.4657150681354403s', animationDelay: '3.53609s' }} /><div className="hr-cert-star" style={{ left: '3.85856%', top: '64.1478%', width: '2.88183px', height: '2.88183px', '--dur': '4.85181783945932s', animationDelay: '2.38215s' }} /><div className="hr-cert-star" style={{ left: '21.6506%', top: '36.4757%', width: '1.1788px', height: '1.1788px', '--dur': '2.094978553466982s', animationDelay: '4.87259s' }} /><div className="hr-cert-star" style={{ left: '72.264%', top: '89.387%', width: '1.82554px', height: '1.82554px', '--dur': '4.7318769337506s', animationDelay: '2.69276s' }} /><div className="hr-cert-star" style={{ left: '65.2594%', top: '82.0089%', width: '1.38314px', height: '1.38314px', '--dur': '5.165587827553686s', animationDelay: '3.88782s' }} /><div className="hr-cert-star" style={{ left: '68.2142%', top: '53.2014%', width: '1.30537px', height: '1.30537px', '--dur': '5.213736351507887s', animationDelay: '0.263121s' }} /><div className="hr-cert-star" style={{ left: '96.5716%', top: '96.7636%', width: '3.06719px', height: '3.06719px', '--dur': '2.696383373451772s', animationDelay: '1.18232s' }} /><div className="hr-cert-star" style={{ left: '2.534%', top: '79.0077%', width: '3.39642px', height: '3.39642px', '--dur': '5.82698980008537s', animationDelay: '2.6848s' }} /><div className="hr-cert-star" style={{ left: '41.0347%', top: '22.5828%', width: '1.48151px', height: '1.48151px', '--dur': '2.7631209341977185s', animationDelay: '3.36768s' }} /><div className="hr-cert-star" style={{ left: '65.1074%', top: '32.4714%', width: '1.18072px', height: '1.18072px', '--dur': '4.439727978258622s', animationDelay: '1.56424s' }} /><div className="hr-cert-star" style={{ left: '16.3661%', top: '61.8816%', width: '3.35428px', height: '3.35428px', '--dur': '3.8420509523436186s', animationDelay: '0.59009s' }} /><div className="hr-cert-star" style={{ left: '51.2225%', top: '87.9418%', width: '2.55142px', height: '2.55142px', '--dur': '2.8603612774732676s', animationDelay: '4.38975s' }} /><div className="hr-cert-star" style={{ left: '53.4987%', top: '26.8509%', width: '2.56954px', height: '2.56954px', '--dur': '3.4421173050709846s', animationDelay: '0.794193s' }} /><div className="hr-cert-star" style={{ left: '1.09706%', top: '4.98477%', width: '1.68509px', height: '1.68509px', '--dur': '4.838797297181483s', animationDelay: '2.32395s' }} /><div className="hr-cert-star" style={{ left: '48.4604%', top: '4.42807%', width: '1.98285px', height: '1.98285px', '--dur': '5.970106084790611s', animationDelay: '2.82417s' }} /><div className="hr-cert-star" style={{ left: '82.2132%', top: '91.9503%', width: '2.33948px', height: '2.33948px', '--dur': '3.0433428764127193s', animationDelay: '2.22517s' }} /><div className="hr-cert-star" style={{ left: '33.2398%', top: '27.014%', width: '2.00727px', height: '2.00727px', '--dur': '5.120325359358526s', animationDelay: '1.18177s' }} /><div className="hr-cert-star" style={{ left: '66.9329%', top: '1.77483%', width: '1.8814px', height: '1.8814px', '--dur': '2.1270278686860484s', animationDelay: '2.16155s' }} /><div className="hr-cert-star" style={{ left: '82.5816%', top: '27.9228%', width: '1.00385px', height: '1.00385px', '--dur': '3.176597160921893s', animationDelay: '0.285755s' }} /><div className="hr-cert-star" style={{ left: '72.3914%', top: '28.5555%', width: '1.59311px', height: '1.59311px', '--dur': '5.041467553712229s', animationDelay: '1.77062s' }} /><div className="hr-cert-star" style={{ left: '50.0371%', top: '93.4986%', width: '1.03505px', height: '1.03505px', '--dur': '3.2214172740291875s', animationDelay: '2.49546s' }} /><div className="hr-cert-star" style={{ left: '24.4451%', top: '35.0937%', width: '3.27494px', height: '3.27494px', '--dur': '3.546176467185623s', animationDelay: '2.12161s' }} /><div className="hr-cert-star" style={{ left: '78.6171%', top: '15.4424%', width: '1.65505px', height: '1.65505px', '--dur': '4.41628974233674s', animationDelay: '2.02709s' }} /><div className="hr-cert-star" style={{ left: '47.8657%', top: '19.0656%', width: '2.19134px', height: '2.19134px', '--dur': '3.352557652295385s', animationDelay: '1.08087s' }} /><div className="hr-cert-star" style={{ left: '37.5027%', top: '97.3586%', width: '1.61554px', height: '1.61554px', '--dur': '2.4881622404468944s', animationDelay: '3.07485s' }} /><div className="hr-cert-star" style={{ left: '85.8187%', top: '97.6127%', width: '2.45971px', height: '2.45971px', '--dur': '3.0233581214139873s', animationDelay: '4.33915s' }} /><div className="hr-cert-star" style={{ left: '88.6693%', top: '6.8477%', width: '1.77673px', height: '1.77673px', '--dur': '5.118020842366326s', animationDelay: '4.59673s' }} /><div className="hr-cert-star" style={{ left: '87.7894%', top: '36.8585%', width: '3.45982px', height: '3.45982px', '--dur': '2.1777040624956086s', animationDelay: '2.59409s' }} /><div className="hr-cert-star" style={{ left: '54.7314%', top: '38.2244%', width: '1.4601px', height: '1.4601px', '--dur': '4.512467003256514s', animationDelay: '2.31902s' }} /><div className="hr-cert-star" style={{ left: '14.0453%', top: '3.61053%', width: '1.32099px', height: '1.32099px', '--dur': '4.57569065281783s', animationDelay: '0.875964s' }} /><div className="hr-cert-star" style={{ left: '37.8113%', top: '70.813%', width: '3.44694px', height: '3.44694px', '--dur': '5.92649773897355s', animationDelay: '0.47504s' }} /><div className="hr-cert-star" style={{ left: '54.8718%', top: '38.9135%', width: '1.30375px', height: '1.30375px', '--dur': '4.841417569188712s', animationDelay: '2.16071s' }} /><div className="hr-cert-star" style={{ left: '3.52927%', top: '2.21438%', width: '1.17135px', height: '1.17135px', '--dur': '4.298353274535036s', animationDelay: '1.95285s' }} /><div className="hr-cert-star" style={{ left: '96.0791%', top: '17.3783%', width: '3.25657px', height: '3.25657px', '--dur': '3.499309472837787s', animationDelay: '1.92683s' }} /><div className="hr-cert-star" style={{ left: '81.6863%', top: '0.969573%', width: '2.60821px', height: '2.60821px', '--dur': '5.842080293664537s', animationDelay: '4.19142s' }} /><div className="hr-cert-star" style={{ left: '32.2284%', top: '6.57246%', width: '1.68124px', height: '1.68124px', '--dur': '5.366817142923443s', animationDelay: '0.145682s' }} /><div className="hr-cert-star" style={{ left: '21.0906%', top: '92.18%', width: '3.34961px', height: '3.34961px', '--dur': '4.0577763233907795s', animationDelay: '0.387812s' }} /><div className="hr-cert-star" style={{ left: '87.2723%', top: '61.5321%', width: '1.67928px', height: '1.67928px', '--dur': '4.899616070961485s', animationDelay: '0.735595s' }} /><div className="hr-cert-star" style={{ left: '6.49941%', top: '56.1737%', width: '3.34382px', height: '3.34382px', '--dur': '4.848154729481319s', animationDelay: '3.74538s' }} /><div className="hr-cert-star" style={{ left: '85.5254%', top: '96.0658%', width: '1.09599px', height: '1.09599px', '--dur': '4.444751947882903s', animationDelay: '1.20145s' }} /><div className="hr-cert-star" style={{ left: '92.2202%', top: '49.1004%', width: '1.90526px', height: '1.90526px', '--dur': '2.8758269956320945s', animationDelay: '3.90003s' }} /><div className="hr-cert-star" style={{ left: '38.9905%', top: '57.4965%', width: '1.42513px', height: '1.42513px', '--dur': '2.846453258399476s', animationDelay: '2.66349s' }} /><div className="hr-cert-star" style={{ left: '86.8645%', top: '72.6244%', width: '3.42193px', height: '3.42193px', '--dur': '3.9017719206171813s', animationDelay: '0.68819s' }} /><div className="hr-cert-star" style={{ left: '51.4717%', top: '2.75477%', width: '1.41883px', height: '1.41883px', '--dur': '2.1357907880382427s', animationDelay: '0.194501s' }} /><div className="hr-cert-star" style={{ left: '24.8795%', top: '4.61487%', width: '2.05498px', height: '2.05498px', '--dur': '4.3778424524841455s', animationDelay: '3.45367s' }} /><div className="hr-cert-star" style={{ left: '84.0329%', top: '11.636%', width: '1.15917px', height: '1.15917px', '--dur': '3.10875062881697s', animationDelay: '2.95235s' }} /><div className="hr-cert-star" style={{ left: '21.369%', top: '52.9416%', width: '3.28021px', height: '3.28021px', '--dur': '3.595390205297282s', animationDelay: '1.23432s' }} /><div className="hr-cert-star" style={{ left: '6.40393%', top: '82.9994%', width: '1.67326px', height: '1.67326px', '--dur': '3.631705362738006s', animationDelay: '4.08537s' }} /><div className="hr-cert-star" style={{ left: '98.9019%', top: '72.3533%', width: '1.68234px', height: '1.68234px', '--dur': '2.313309833205775s', animationDelay: '1.66422s' }} /><div className="hr-cert-star" style={{ left: '29.3069%', top: '57.1814%', width: '2.34531px', height: '2.34531px', '--dur': '2.7029216512558514s', animationDelay: '0.693676s' }} /><div className="hr-cert-star" style={{ left: '56.1013%', top: '92.11%', width: '2.13943px', height: '2.13943px', '--dur': '4.489600306500696s', animationDelay: '2.09608s' }} /><div className="hr-cert-star" style={{ left: '67.5329%', top: '91.5246%', width: '1.82212px', height: '1.82212px', '--dur': '2.5962253563448465s', animationDelay: '3.18764s' }} /><div className="hr-cert-star" style={{ left: '61.2951%', top: '81.1234%', width: '2.42618px', height: '2.42618px', '--dur': '4.386315474860831s', animationDelay: '1.64574s' }} /><div className="hr-cert-star" style={{ left: '98.3148%', top: '30.1254%', width: '2.31057px', height: '2.31057px', '--dur': '4.023387747242591s', animationDelay: '2.04848s' }} /><div className="hr-cert-star" style={{ left: '66.6984%', top: '26.7285%', width: '3.49806px', height: '3.49806px', '--dur': '5.387794498293939s', animationDelay: '1.5892s' }} /><div className="hr-cert-star" style={{ left: '95.4623%', top: '93.6465%', width: '3.13234px', height: '3.13234px', '--dur': '3.8709674481159437s', animationDelay: '2.41481s' }} /><div className="hr-cert-star" style={{ left: '91.9455%', top: '72.8922%', width: '2.34701px', height: '2.34701px', '--dur': '2.25609505686777s', animationDelay: '0.28674s' }} /><div className="hr-cert-star" style={{ left: '67.3765%', top: '92.7379%', width: '2.56234px', height: '2.56234px', '--dur': '5.053206500069146s', animationDelay: '1.54766s' }} /><div className="hr-cert-star" style={{ left: '58.1891%', top: '69.4708%', width: '1.46777px', height: '1.46777px', '--dur': '3.40697727162993s', animationDelay: '0.182264s' }} /><div className="hr-cert-star" style={{ left: '44.2643%', top: '12.0679%', width: '1.57091px', height: '1.57091px', '--dur': '4.014852598611915s', animationDelay: '1.52312s' }} /><div className="hr-cert-star" style={{ left: '71.049%', top: '15.3986%', width: '2.80715px', height: '2.80715px', '--dur': '4.212341106387957s', animationDelay: '3.84815s' }} /><div className="hr-cert-star" style={{ left: '50.9706%', top: '3.18056%', width: '3.10675px', height: '3.10675px', '--dur': '4.66854620065676s', animationDelay: '1.52718s' }} /><div className="hr-cert-star" style={{ left: '54.4062%', top: '4.78534%', width: '3.40505px', height: '3.40505px', '--dur': '3.9540287980069677s', animationDelay: '2.5728s' }} /><div className="hr-cert-star" style={{ left: '49.9122%', top: '87.7823%', width: '2.10496px', height: '2.10496px', '--dur': '4.988088786541054s', animationDelay: '3.97255s' }} /><div className="hr-cert-star" style={{ left: '36.1718%', top: '1.27976%', width: '2.61522px', height: '2.61522px', '--dur': '5.5358205055692995s', animationDelay: '4.86526s' }} /><div className="hr-cert-star" style={{ left: '22.0411%', top: '63.1971%', width: '1.95042px', height: '1.95042px', '--dur': '2.5089073906031643s', animationDelay: '4.35631s' }} /><div className="hr-cert-star" style={{ left: '64.3113%', top: '27.3796%', width: '1.6329px', height: '1.6329px', '--dur': '4.491916572531567s', animationDelay: '3.94738s' }} /><div className="hr-cert-star" style={{ left: '97.8175%', top: '92.4501%', width: '2.03585px', height: '2.03585px', '--dur': '3.2014169045057796s', animationDelay: '2.46634s' }} /><div className="hr-cert-star" style={{ left: '58.8618%', top: '3.85507%', width: '2.91774px', height: '2.91774px', '--dur': '3.3839224197450597s', animationDelay: '3.89297s' }} /><div className="hr-cert-star" style={{ left: '79.3419%', top: '63.3437%', width: '1.07718px', height: '1.07718px', '--dur': '3.883946254842049s', animationDelay: '2.34698s' }} /><div className="hr-cert-star" style={{ left: '8.96343%', top: '41.6117%', width: '1.45727px', height: '1.45727px', '--dur': '3.8128263729832006s', animationDelay: '4.38378s' }} /><div className="hr-cert-star" style={{ left: '21.0429%', top: '25.0293%', width: '2.36429px', height: '2.36429px', '--dur': '3.0031505461616406s', animationDelay: '0.883567s' }} /><div className="hr-cert-star" style={{ left: '78.5437%', top: '52.2961%', width: '2.94757px', height: '2.94757px', '--dur': '3.7291882395221765s', animationDelay: '3.3515s' }} /><div className="hr-cert-star" style={{ left: '55.8752%', top: '68.5282%', width: '1.421px', height: '1.421px', '--dur': '3.20721352894309s', animationDelay: '0.663368s' }} /><div className="hr-cert-star" style={{ left: '35.7272%', top: '75.7291%', width: '1.97683px', height: '1.97683px', '--dur': '3.119215330066634s', animationDelay: '3.196s' }} /><div className="hr-cert-star" style={{ left: '40.1081%', top: '34.0322%', width: '1.7732px', height: '1.7732px', '--dur': '2.927141346191303s', animationDelay: '2.82596s' }} /><div className="hr-cert-star" style={{ left: '89.7781%', top: '9.95987%', width: '1.45749px', height: '1.45749px', '--dur': '4.353916207464717s', animationDelay: '0.740427s' }} /><div className="hr-cert-star" style={{ left: '4.29173%', top: '57.1994%', width: '2.50385px', height: '2.50385px', '--dur': '5.527388371636977s', animationDelay: '0.0112601s' }} /><div className="hr-cert-star" style={{ left: '21.4069%', top: '21.631%', width: '1.61238px', height: '1.61238px', '--dur': '4.6709218161081685s', animationDelay: '4.16206s' }} /><div className="hr-cert-star" style={{ left: '41.0339%', top: '14.8888%', width: '2.93414px', height: '2.93414px', '--dur': '4.2953397501058195s', animationDelay: '0.831961s' }} /><div className="hr-cert-star" style={{ left: '25.4596%', top: '29.6601%', width: '1.34075px', height: '1.34075px', '--dur': '4.988726350800601s', animationDelay: '2.76756s' }} /><div className="hr-cert-star" style={{ left: '20.3505%', top: '86.2061%', width: '1.49363px', height: '1.49363px', '--dur': '2.259008404806794s', animationDelay: '1.27721s' }} /><div className="hr-cert-star" style={{ left: '27.3063%', top: '25.2058%', width: '2.29373px', height: '2.29373px', '--dur': '3.041718657520453s', animationDelay: '3.98914s' }} /><div className="hr-cert-star" style={{ left: '31.8275%', top: '30.3902%', width: '1.44609px', height: '1.44609px', '--dur': '5.454354357627432s', animationDelay: '3.21722s' }} /><div className="hr-cert-star" style={{ left: '84.543%', top: '26.4947%', width: '2.49369px', height: '2.49369px', '--dur': '2.4430328970251756s', animationDelay: '2.13439s' }} /><div className="hr-cert-star" style={{ left: '81.1838%', top: '12.9457%', width: '2.11913px', height: '2.11913px', '--dur': '2.783227939621478s', animationDelay: '3.65589s' }} /><div className="hr-cert-star" style={{ left: '6.28715%', top: '84.2261%', width: '1.23274px', height: '1.23274px', '--dur': '4.932814553428641s', animationDelay: '1.54734s' }} /><div className="hr-cert-star" style={{ left: '71.2042%', top: '17.4464%', width: '3.40963px', height: '3.40963px', '--dur': '3.6980990098597815s', animationDelay: '1.98523s' }} /><div className="hr-cert-star" style={{ left: '5.18949%', top: '59.0802%', width: '2.23234px', height: '2.23234px', '--dur': '5.879136447408472s', animationDelay: '3.47473s' }} /><div className="hr-cert-star" style={{ left: '58.3192%', top: '41.165%', width: '2.5653px', height: '2.5653px', '--dur': '5.1835932192494845s', animationDelay: '1.29134s' }} /><div className="hr-cert-star" style={{ left: '1.26847%', top: '20.871%', width: '2.0786px', height: '2.0786px', '--dur': '4.90536786919197s', animationDelay: '4.7854s' }} /><div className="hr-cert-star" style={{ left: '84.0755%', top: '63.0119%', width: '1.63364px', height: '1.63364px', '--dur': '5.323935878487079s', animationDelay: '4.73822s' }} /><div className="hr-cert-star" style={{ left: '79.396%', top: '77.8947%', width: '1.68792px', height: '1.68792px', '--dur': '4.724018514420397s', animationDelay: '1.91707s' }} /><div className="hr-cert-star" style={{ left: '27.8657%', top: '2.02946%', width: '3.21584px', height: '3.21584px', '--dur': '4.994289243081514s', animationDelay: '2.76621s' }} /><div className="hr-cert-star" style={{ left: '41.5326%', top: '63.8857%', width: '2.17372px', height: '2.17372px', '--dur': '4.716917423864446s', animationDelay: '1.67825s' }} /><div className="hr-cert-star" style={{ left: '25.1883%', top: '65.9864%', width: '2.66487px', height: '2.66487px', '--dur': '5.221351498273299s', animationDelay: '0.704908s' }} /><div className="hr-cert-star" style={{ left: '69.8296%', top: '97.5374%', width: '2.49309px', height: '2.49309px', '--dur': '5.287857250890735s', animationDelay: '0.460368s' }} /><div className="hr-cert-star" style={{ left: '72.9518%', top: '28.9545%', width: '1.12509px', height: '1.12509px', '--dur': '4.5151335937224335s', animationDelay: '3.63612s' }} /><div className="hr-cert-star" style={{ left: '17.3219%', top: '91.4227%', width: '2.57807px', height: '2.57807px', '--dur': '2.0426813292787025s', animationDelay: '1.10024s' }} /><div className="hr-cert-star" style={{ left: '42.745%', top: '91.2622%', width: '3.04814px', height: '3.04814px', '--dur': '4.736620721493999s', animationDelay: '4.74196s' }} /><div className="hr-cert-star" style={{ left: '79.1538%', top: '85.9876%', width: '1.92124px', height: '1.92124px', '--dur': '3.3449220564910114s', animationDelay: '4.93118s' }} /><div className="hr-cert-star" style={{ left: '37.1719%', top: '67.8206%', width: '1.91274px', height: '1.91274px', '--dur': '3.278553594940565s', animationDelay: '0.107368s' }} /><div className="hr-cert-star" style={{ left: '99.8988%', top: '16.3668%', width: '1.56746px', height: '1.56746px', '--dur': '5.723521321416107s', animationDelay: '2.24641s' }} /><div className="hr-cert-star" style={{ left: '15.3117%', top: '91.3237%', width: '1.85217px', height: '1.85217px', '--dur': '4.508552256793694s', animationDelay: '1.21445s' }} /><div className="hr-cert-star" style={{ left: '50.6102%', top: '77.6843%', width: '2.09285px', height: '2.09285px', '--dur': '4.484455063464379s', animationDelay: '1.66598s' }} /><div className="hr-cert-star" style={{ left: '58.2813%', top: '97.6112%', width: '3.16694px', height: '3.16694px', '--dur': '4.883204677547942s', animationDelay: '4.3206s' }} /><div className="hr-cert-star" style={{ left: '37.9002%', top: '5.54483%', width: '2.9718px', height: '2.9718px', '--dur': '2.5516407554042733s', animationDelay: '2.98118s' }} /><div className="hr-cert-star" style={{ left: '31.4596%', top: '6.02342%', width: '2.42984px', height: '2.42984px', '--dur': '4.780625284970174s', animationDelay: '3.48304s' }} /><div className="hr-cert-star" style={{ left: '29.175%', top: '57.942%', width: '2.9149px', height: '2.9149px', '--dur': '4.413143219417936s', animationDelay: '3.86451s' }} /></div>
            <div className="hr-planet" id="hr-planet">
              <div className="hr-planet__horizon" id="hr-planet-horizon">
                <div className="hr-planet__glow" />
              </div>
            </div>
            <div className="hr-planet__earth" id="hr-planet-earth" />
            <div className="hr-coin-wrap" id="hr-coin-wrap">
              <div className="hr-coin" id="hr-coin">
                <div className="hr-coin__edge"><div className="hr-coin__seg" /><div className="hr-coin__seg" /><div className="hr-coin__seg" /><div className="hr-coin__seg" /><div className="hr-coin__seg" /><div className="hr-coin__seg" /><div className="hr-coin__seg" /><div className="hr-coin__seg" /><div className="hr-coin__seg" /><div className="hr-coin__seg" /><div className="hr-coin__seg" /><div className="hr-coin__seg" /><div className="hr-coin__seg" /><div className="hr-coin__seg" /><div className="hr-coin__seg" /><div className="hr-coin__seg" /></div>
              </div>
            </div>
            <h2 className="hr-gravity-title" id="hr-gravity-title">Assessment Analytics</h2>
            <div className="hr-gravity-subtitle" id="hr-gravity-subtitle">
              <span>TRACK</span>
              <span className="hr-gravity-dot">·</span>
              <span>ANALYZE</span>
              <span className="hr-gravity-dot">·</span>
              <span>IMPROVE</span>
            </div>
            <canvas className="hr-fireworks-canvas" id="hr-fireworks-canvas" />
          </div>
        </div>
        {/* ═══════════════════════════════════════════════
     7. GAMIFICATION — DARK BACKGROUND BLOCKS
     ═══════════════════════════════════════════════ */}
        <div className="hr-gamif" id="hr-gamif">
          {/* 7a. BADGES */}
          <div className="hr-gamif__section" style={{ opacity: 0, transform: 'translateY(40px)', transition: 'opacity 0.7s, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)' }}>
            <span className="hr-gamif__eyebrow">
              <svg viewBox="0 0 10 12" fill="#2563EB"><polygon score="0,0 10,6 0,12" /></svg>
              Analytics
            </span>
            <h2 className="hr-gamif__title">Turn assessment results into meaningful insights.</h2>
            <p className="hr-gamif__desc">Review scores, completion rates, question-level performance, and assessment outcomes from a centralized dashboard. Identify knowledge gaps and make better evaluation decisions.</p>
            <div className="hr-gamif__badges-grid" id="hr-badges-grid">
              <div className="hr-gamif__badge-card" style={{ opacity: 0, willChange: 'opacity, transform' }}>
                <div className="hr-gamif__badge-icon" style={{ background: '#2563EB' }}>
                  <i className="ph ph-handshake" style={{ fontSize: 24, color: '#fff' }} />
                </div>
                <div className="hr-gamif__badge-name">Teamwork</div>
                <div className="hr-gamif__badge-puntos" style={{ color: '#DBEAFE' }}><i className="ph-fill ph-coin" style={{ marginRight: 3 }} />50 score</div>
              </div>
              <div className="hr-gamif__badge-card" style={{ opacity: 0, willChange: 'opacity, transform' }}>
                <div className="hr-gamif__badge-icon" style={{ background: '#FDBF00' }}>
                  <i className="ph ph-rocket-launch" style={{ fontSize: 24, color: '#fff' }} />
                </div>
                <div className="hr-gamif__badge-name">Innovation</div>
                <div className="hr-gamif__badge-puntos" style={{ color: '#FEF9C3' }}><i className="ph-fill ph-coin" style={{ marginRight: 3 }} />75 score</div>
              </div>
              <div className="hr-gamif__badge-card" style={{ opacity: 0, willChange: 'opacity, transform' }}>
                <div className="hr-gamif__badge-icon" style={{ background: '#F32A73' }}>
                  <i className="ph ph-target" style={{ fontSize: 24, color: '#fff' }} />
                </div>
                <div className="hr-gamif__badge-name">Excellence</div>
                <div className="hr-gamif__badge-puntos" style={{ color: '#FCE7F3' }}><i className="ph-fill ph-coin" style={{ marginRight: 3 }} />100 score</div>
              </div>
              <div className="hr-gamif__badge-card" style={{ opacity: 0, willChange: 'opacity, transform' }}>
                <div className="hr-gamif__badge-icon" style={{ background: '#02A270' }}>
                  <i className="ph ph-heart" style={{ fontSize: 24, color: '#fff' }} />
                </div>
                <div className="hr-gamif__badge-name">Customer Service</div>
                <div className="hr-gamif__badge-puntos" style={{ color: '#D1FAE5' }}><i className="ph-fill ph-coin" style={{ marginRight: 3 }} />60 score</div>
              </div>
              <div className="hr-gamif__badge-card" style={{ opacity: 0, willChange: 'opacity, transform' }}>
                <div className="hr-gamif__badge-icon" style={{ background: '#7C3AED' }}>
                  <i className="ph ph-lightning" style={{ fontSize: 24, color: '#fff' }} />
                </div>
                <div className="hr-gamif__badge-name">Productivity</div>
                <div className="hr-gamif__badge-puntos" style={{ color: '#EDE9FE' }}><i className="ph-fill ph-coin" style={{ marginRight: 3 }} />40 score</div>
              </div>
              <div className="hr-gamif__badge-card" style={{ opacity: 0, willChange: 'opacity, transform' }}>
                <div className="hr-gamif__badge-icon" style={{ background: '#EA580C' }}>
                  <i className="ph ph-graduation-cap" style={{ fontSize: 24, color: '#fff' }} />
                </div>
                <div className="hr-gamif__badge-name">Mentorship</div>
                <div className="hr-gamif__badge-puntos" style={{ color: '#FFEDD5' }}><i className="ph-fill ph-coin" style={{ marginRight: 3 }} />80 score</div>
              </div>
            </div>
          </div>
          {/* 7b. RECOGNITION */}
          <div className="hr-gamif__section hr-gamif__section--recon" id="hr-recon-section" style={{ opacity: 0, transform: 'translateY(40px)', transition: 'opacity 0.7s, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)' }}>
            <canvas className="hr-ribbon-canvas" id="hr-ribbon-canvas" width={1200} height={1018} style={{ opacity: 0 }} />
            <span className="hr-gamif__eyebrow">
              <svg viewBox="0 0 10 12" fill="#2563EB"><polygon score="0,0 10,6 0,12" /></svg>
              Performance
            </span>
            <h2 className="hr-gamif__title">Understand performance beyond the final score.</h2>
            <p className="hr-gamif__desc">Analyze individual and overall performance to identify strengths, weaknesses, and areas that require improvement.</p>
            <div className="hr-giftcard-wrap" id="hr-giftcard-wrap">
              <div className="hr-giftcard-sleeve">
                <div className="hr-giftcard-sleeve__content">
                  <span className="hr-giftcard-sleeve__brand notranslate">EVALION</span>
                  <span className="hr-giftcard-sleeve__label">ASSESSMENT RESULT</span>
                </div>
              </div>
              <div className="hr-giftcard" id="hr-giftcard">
                <div className="hr-giftcard__face">
                  <div className="hr-giftcard__ribbon">
                    <div className="hr-giftcard__ribbon-label" style={{ background: '#4ade80', color: '#166534' }}>PASSED</div>
                  </div>
                  <div className="hr-giftcard__header">
                    <span className="hr-giftcard__header-brand notranslate">EVALION</span>
                    <span className="hr-giftcard__header-text">ASSESSMENT RESULT</span>
                  </div>
                  <div className="hr-giftcard__body" style={{ flexDirection: 'column', gap: '4px' }}>
                    <span className="hr-giftcard__score-value" style={{ fontSize: '48px' }}>87<span style={{ fontSize: '24px', opacity: 0.6 }}> / 100</span></span>
                    <span className="hr-giftcard__score-label">Python Fundamentals</span>
                  </div>
                  <div className="hr-giftcard__holder" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                    <span className="hr-giftcard__holder-name" style={{ fontSize: '14px', alignSelf: 'center' }}>Laura Méndez</span>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '12px', fontWeight: '600' }}>
                      <span style={{ color: '#4ade80' }}>✓ Passed</span>
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>17 / 20 correct</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* 7c. IMPROVES STORE */}
          <div className="hr-gamif__section hr-gamif__section--store" style={{ opacity: 0, transform: 'translateY(40px)', transition: 'opacity 0.7s, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)' }}>
            <span className="hr-gamif__eyebrow">
              <svg viewBox="0 0 10 12" fill="#7C3AED"><polygon score="0,0 10,6 0,12" /></svg>
              Performance Insights
            </span>
            <h2 className="hr-gamif__title">See exactly where performance stands.</h2>
            <p className="hr-gamif__desc">From overall scores to question-level accuracy, <span className="notranslate">Evalion</span> turns assessment attempts into clear, actionable insights.</p>
            <div className="hr-store__window">
              <div className="hr-store__bar">
                <div className="sk-dots"><i /><i /><i /></div>
                <span className="sk-filename">Performance Insights · <span className="notranslate">Evalion</span></span>
              </div>
              <div className="hr-store__body">
                <div className="hr-store__grid">
                  <div className="hr-store__card" style={{ padding: '24px' }}>
                    <div style={{ fontSize: '13px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Overall Score</div>
                    <div style={{ fontSize: '36px', fontWeight: '700', color: '#111827', marginBottom: '12px', lineHeight: 1 }}>87%</div>
                    <div style={{ fontSize: '13px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                      <i className="ph-fill ph-trend-up" /> +12% vs previous assessment
                    </div>
                  </div>

                  <div className="hr-store__card" style={{ padding: '24px' }}>
                    <div style={{ fontSize: '13px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Pass Rate</div>
                    <div style={{ fontSize: '36px', fontWeight: '700', color: '#111827', marginBottom: '12px', lineHeight: 1 }}>84%</div>
                    <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className="ph ph-users" /> 42 of 50 participants
                    </div>
                  </div>

                  <div className="hr-store__card" style={{ padding: '24px' }}>
                    <div style={{ fontSize: '13px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Avg. Score</div>
                    <div style={{ fontSize: '36px', fontWeight: '700', color: '#111827', marginBottom: '12px', lineHeight: 1 }}>76.4</div>
                    <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className="ph ph-calculator" /> Across all attempts
                    </div>
                  </div>

                  <div className="hr-store__card" style={{ padding: '24px' }}>
                    <div style={{ fontSize: '13px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Question Accuracy</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
                      <div style={{ fontSize: '32px', fontWeight: '700', color: '#111827', lineHeight: 1 }}>82%</div>
                    </div>
                    <div style={{ height: '6px', width: '100%', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '82%', background: '#3b82f6', borderRadius: '3px' }} />
                    </div>
                  </div>

                  <div className="hr-store__card" style={{ padding: '24px' }}>
                    <div style={{ fontSize: '13px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Completion Rate</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
                      <div style={{ fontSize: '32px', fontWeight: '700', color: '#111827', lineHeight: 1 }}>91%</div>
                    </div>
                    <div style={{ height: '6px', width: '100%', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '91%', background: '#10b981', borderRadius: '3px' }} />
                    </div>
                  </div>

                  <div className="hr-store__card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '13px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Top Performing Topic</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '12px', lineHeight: 1.2 }}>Data Structures</div>
                    <div style={{ fontSize: '13px', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', marginTop: 'auto' }}>
                      <i className="ph-fill ph-star" /> 94% accuracy
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '32px', paddingBottom: '8px' }}>
                  <button style={{ background: '#111827', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                    View Full Results <i className="ph ph-arrow-right" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* ═══════════════════════════════════════════════
     2. TALENT COPILOT
     ═══════════════════════════════════════════════ */}
        <section className="hr-section hr-section--ai-prompt">
          <div className="ai-prompt-grid">
            <div className="ai-prompt-grid__text">
              <span className="hr-eyebrow">
                <svg viewBox="0 0 10 12" fill="#2563EB"><polygon score="0,0 10,6 0,12" /></svg>
                Artificial Intelligence
              </span>
              <h2>Manage assessments with natural language.</h2>
              <p className="hr-section__desc">Check the status of an assessment, enroll students in a program, review who completed testing, or generate a question bank — all from a single message. No forms, no navigating between modules.</p>
            </div>
            <div className="ask-window">
              <div className="ask-window__bar">
                <div className="sk-dots"><i /><i /><i /></div>
                <span className="sk-filename">Assessment Copilot · <span className="notranslate">Evalion</span></span>
              </div>
              <div className="ask-window__body">
                <div className="sai-greeting">
                  <div className="sai-greeting__line">Hi, Valentina — How can I help you?</div>
                </div>
                <div className="ask-field" id="ask-field-hr">
                  <div className="ask-field__bar">
                    <div className="ask-field__inner">
                      <i className="ph ph-sparkle ask-field__icon" />
                      <span className="ask-field__text">Ask <span className="notranslate">Evalion</span> something...</span>
                      <span className="ask-field__cursor" />
                    </div>
                    <div className="ask-field__border" />
                  </div>
                  <div className="ask-suggestions">
                    <div className="ask-suggestions__item">
                      <i className="ph ph-sparkle ask-suggestions__icon" />
                      <span className="ask-suggestions__text">How many participants completed the Python Assessment?</span>
                    </div>
                    <div className="ask-suggestions__item">
                      <i className="ph ph-sparkle ask-suggestions__icon" />
                      <span className="ask-suggestions__text">Schedule the Database Concepts assessment for the engineering group</span>
                    </div>
                    <div className="ask-suggestions__item">
                      <i className="ph ph-sparkle ask-suggestions__icon" />
                      <span className="ask-suggestions__text">Generate 10 multiple choice questions for Data Structures</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ═══════════════════════════════════════════════
     EXPLORE THE SUITE — Cross-module CTA
     ═══════════════════════════════════════════════ */}
        <div className="suite-cta">
          <span className="suite-cta__eyebrow">
            <svg width={10} height={12} viewBox="0 0 10 12" fill="#02A270"><polygon score="0,0 10,6 0,12" /></svg>
            Explore
          </span>
          <div className="suite-cta__title" role="heading" aria-level={2}>Everything you need to run better assessments.</div>
          <div className="suite-cta__grid">
            <a href="https://prolibu.com/en/platform/sales/" className="suite-cta__item" style={{ '--accent': '#F32A73' }}>
              <div className="suite-cta__name">Assessment Management</div>
              <div className="suite-cta__desc">Create, configure, publish, and manage assessments from a centralized workspace.</div>
              <span className="suite-cta__link">Explore <svg width={14} height={14} viewBox="0 0 14 14" fill="none"><path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
            </a>
            <a href="https://prolibu.com/en/platform/operations/" className="suite-cta__item" style={{ '--accent': '#02A270' }}>
              <div className="suite-cta__name">Performance Analytics</div>
              <div className="suite-cta__desc">Transform assessment results into clear insights across candidates, questions, and subjects.</div>
              <span className="suite-cta__link">Explore <svg width={14} height={14} viewBox="0 0 14 14" fill="none"><path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
            </a>
            <a href="https://prolibu.com/en/platform/customer-service/" className="suite-cta__item" style={{ '--accent': '#FDBF00' }}>
              <div className="suite-cta__name">Secure Proctoring</div>
              <div className="suite-cta__desc">Protect assessment integrity with controlled testing environments and automated monitoring.</div>
              <span className="suite-cta__link">Explore <svg width={14} height={14} viewBox="0 0 14 14" fill="none"><path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
            </a>
          </div>
        </div>
      </div>

    </>
  );
}
