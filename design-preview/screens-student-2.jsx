// Student progress + AI tutor screens

function ProgressPage() {
  const days = Array.from({length: 84}, (_, i) => {
    // Generate plausible activity heatmap
    const r = (Math.sin(i*1.37) + 1) * 0.5;
    const r2 = (Math.cos(i*0.91) + 1) * 0.5;
    return Math.max(0, Math.min(4, Math.floor(r*r2*5)));
  });

  return (
    <div className="cg" style={{height: '100%'}}>
      <div className="app">
        <Sidebar role="student" active="progress" />
        <div className="main">
          <Topbar />
          <div className="content">
            <div className="page-head">
              <div>
                <div className="eyebrow">Learning analytics</div>
                <h1 className="page-title">Your progress, in detail.</h1>
                <p className="lede">All your learning activity in one view — streaks, mastery, weak topics, and how you compare to your past self.</p>
              </div>
              <div style={{display:'flex', gap: 8}}>
                <span className="chip">Term · Spring 2026</span>
                <button className="btn ghost sm">Export report</button>
              </div>
            </div>

            <div className="grid" style={{gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 16}}>
              <Stat num="12" label="Current streak (days)" delta="↑ longest" />
              <Stat num="87%" label="Avg quiz score" delta="+6 vs last month" />
              <Stat num="38h" label="Time learning" delta="+4h" />
              <Stat num="4 / 6" label="Courses on pace" sub="Two slightly behind" />
            </div>

            <div className="grid" style={{gridTemplateColumns: '1.5fr 1fr', gap: 16}}>
              {/* Score over time chart */}
              <div className="card card-pad">
                <div className="row" style={{justifyContent:'space-between', marginBottom: 14}}>
                  <div>
                    <div className="card-title">Quiz performance over time</div>
                    <div className="card-sub">Adaptive difficulty is shown by the band</div>
                  </div>
                  <div className="row" style={{gap: 8}}>
                    <span className="chip"><span className="dot" style={{background:'var(--accent)'}}/>Score</span>
                    <span className="chip"><span className="dot" style={{background:'var(--surface-3)'}}/>Difficulty</span>
                  </div>
                </div>
                <ScoreChart />
              </div>

              {/* Streak calendar */}
              <div className="card card-pad">
                <div className="row" style={{justifyContent:'space-between', marginBottom: 14}}>
                  <div>
                    <div className="card-title">Learning streak</div>
                    <div className="card-sub">Last 12 weeks</div>
                  </div>
                  <span className="chip accent">{Ic.flame} 12-day streak</span>
                </div>
                <div style={{display:'grid', gridTemplateColumns:'repeat(12, 1fr)', gap: 4}}>
                  {days.map((v, i) => (
                    <div key={i} style={{
                      aspectRatio: '1/1', borderRadius: 4,
                      background: v === 0 ? 'var(--surface-3)' :
                        v === 1 ? 'oklch(0.86 0.07 50)' :
                        v === 2 ? 'oklch(0.78 0.11 45)' :
                        v === 3 ? 'oklch(0.7 0.13 42)' :
                        'oklch(0.6 0.15 40)'
                    }}/>
                  ))}
                </div>
                <div className="row" style={{justifyContent:'space-between', marginTop: 14, fontSize: 11.5, color:'var(--muted)'}}>
                  <span>12 weeks ago</span>
                  <div className="row" style={{gap: 4}}>
                    <span>Less</span>
                    {[0,1,2,3,4].map(v => <div key={v} style={{
                      width: 10, height: 10, borderRadius: 3,
                      background: v === 0 ? 'var(--surface-3)' :
                        v === 1 ? 'oklch(0.86 0.07 50)' :
                        v === 2 ? 'oklch(0.78 0.11 45)' :
                        v === 3 ? 'oklch(0.7 0.13 42)' :
                        'oklch(0.6 0.15 40)'
                    }}/>)}
                    <span>More</span>
                  </div>
                  <span>Today</span>
                </div>
                <hr className="hair" style={{margin: '16px 0'}}/>
                <div className="grid" style={{gridTemplateColumns:'1fr 1fr', gap: 12}}>
                  <div><div className="stat-label">Longest streak</div><div style={{fontWeight: 500, marginTop: 2}}>12 days</div></div>
                  <div><div className="stat-label">Active days</div><div style={{fontWeight: 500, marginTop: 2}}>58 / 84</div></div>
                </div>
              </div>
            </div>

            <div className="grid" style={{gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16}}>
              <div className="card">
                <div className="card-head">
                  <div className="card-title">Weak topics</div>
                  <span className="card-sub">Across all courses</span>
                </div>
                <div style={{padding: 18}}>
                  {[
                    { t: "Eigenvectors", c: "Linear Algebra", v: 42, attempts: 8 },
                    { t: "Bayes' theorem", c: "Statistics 201", v: 55, attempts: 6 },
                    { t: "Async iterators", c: "Modern JavaScript", v: 61, attempts: 5 },
                    { t: "Conditional probability", c: "Statistics 201", v: 64, attempts: 4 },
                    { t: "Big-O analysis", c: "Data Structures", v: 68, attempts: 7 },
                  ].map((w, i) => (
                    <div key={i} style={{padding: '12px 0', borderTop: i ? '1px solid var(--hair)' : 'none'}}>
                      <div className="row" style={{justifyContent:'space-between', marginBottom: 6}}>
                        <div>
                          <div style={{fontSize: 13.5, fontWeight: 500}}>{w.t}</div>
                          <div className="card-sub">{w.c} · {w.attempts} quiz attempts</div>
                        </div>
                        <div className="row" style={{gap: 8}}>
                          <span className="tag">{w.v}%</span>
                          <button className="btn sm ghost">Review</button>
                        </div>
                      </div>
                      <div className="progress"><i style={{width: w.v+'%', background: w.v < 50 ? 'var(--bad)' : w.v < 70 ? 'var(--warn)' : 'var(--ok)'}}/></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="card-head">
                  <div className="card-title">Course pace</div>
                  <span className="card-sub">Projected vs. target</span>
                </div>
                <div style={{padding: 18}}>
                  {[
                    { t: "Linear Algebra Foundations", v: 72, target: 65, pace: "+3 days ahead", ok: true },
                    { t: "Statistics 201", v: 38, target: 50, pace: "5 days behind", ok: false },
                    { t: "Modern JavaScript", v: 88, target: 80, pace: "On pace", ok: true },
                    { t: "Logic & Argumentation", v: 22, target: 40, pace: "2 weeks behind", ok: false },
                  ].map((c, i) => (
                    <div key={i} style={{padding: '14px 0', borderTop: i ? '1px solid var(--hair)' : 'none'}}>
                      <div className="row" style={{justifyContent:'space-between', marginBottom: 8}}>
                        <div style={{fontSize: 13.5, fontWeight: 500}}>{c.t}</div>
                        <span className={"chip " + (c.ok ? 'ok' : 'bad')}><span className="dot"/>{c.pace}</span>
                      </div>
                      <div style={{position:'relative', height: 6, background:'var(--surface-3)', borderRadius: 999}}>
                        <div style={{position:'absolute', left:0, top:0, height:'100%', width: c.v+'%', background:'var(--accent)', borderRadius: 999}}/>
                        <div style={{position:'absolute', left: c.target+'%', top: -3, height: 12, width: 2, background:'var(--ink-2)'}}/>
                      </div>
                      <div className="row" style={{justifyContent:'space-between', marginTop: 6, fontSize: 11, color:'var(--muted)'}}>
                        <span>You: {c.v}%</span>
                        <span>Target: {c.target}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card warm card-pad" style={{marginTop: 16}}>
              <div className="row" style={{gap: 10, marginBottom: 6}}>
                <span style={{color:'var(--accent-deep)'}}>{Ic.spark}</span>
                <div className="card-title" style={{color:'var(--accent-deep)'}}>AI insights</div>
              </div>
              <div className="grid" style={{gridTemplateColumns:'1fr 1fr 1fr', gap: 14, marginTop: 10}}>
                {[
                  "Your morning quiz attempts score 14% higher than evening ones. Consider scheduling Stats 201 before noon.",
                  "Eigenvectors and Bayes' theorem are both about thinking conditionally — practicing one helps the other.",
                  "You're 2 weeks behind on Logic & Argumentation. A 25-minute session twice a week would close the gap.",
                ].map((t, i) => (
                  <div key={i} className="serif" style={{fontSize: 15, letterSpacing:'-0.01em', lineHeight: 1.45}}>{t}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreChart() {
  const pts = [62, 68, 65, 72, 70, 78, 74, 82, 79, 85, 88, 84, 87];
  const diff = [40, 45, 45, 50, 55, 55, 60, 65, 65, 70, 70, 75, 75];
  const W = 720, H = 200, pad = 30;
  const x = i => pad + (i * (W - 2*pad)) / (pts.length - 1);
  const y = v => H - pad - ((v - 30) / 70) * (H - 2*pad);
  const linePath = arr => arr.map((v, i) => (i === 0 ? 'M' : 'L') + x(i) + ' ' + y(v)).join(' ');
  const areaPath = arr => linePath(arr) + ` L${x(arr.length-1)} ${H-pad} L${x(0)} ${H-pad} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:'block'}}>
      {[30, 50, 70, 90].map(v => (
        <g key={v}>
          <line x1={pad} y1={y(v)} x2={W-pad} y2={y(v)} stroke="var(--hair)" strokeDasharray="2 4"/>
          <text x={6} y={y(v)+3} fontSize="10" fill="var(--muted)" fontFamily="var(--mono)">{v}</text>
        </g>
      ))}
      <path d={areaPath(diff)} fill="var(--surface-3)" opacity="0.6"/>
      <path d={linePath(diff)} stroke="var(--faint)" fill="none" strokeWidth="1.2" strokeDasharray="3 3"/>
      <path d={linePath(pts)} stroke="var(--accent)" fill="none" strokeWidth="2"/>
      {pts.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r="3.5" fill="var(--accent)" stroke="var(--card)" strokeWidth="1.5"/>
      ))}
      {["Wk1","","Wk3","","Wk5","","Wk7","","Wk9","","Wk11","","Wk13"].map((l, i) => (
        l && <text key={i} x={x(i)} y={H-8} fontSize="10" fill="var(--muted)" fontFamily="var(--mono)" textAnchor="middle">{l}</text>
      ))}
    </svg>
  );
}

function AITutor() {
  const chats = [
    { id: 1, t: "Eigenvalue intuition", course: "Linear Algebra", time: "Now", active: true },
    { id: 2, t: "Why is Bayes' theorem so hard?", course: "Statistics 201", time: "Yesterday" },
    { id: 3, t: "Closures vs. modules", course: "Modern JavaScript", time: "Mon" },
    { id: 4, t: "Proving big-O bounds", course: "Data Structures", time: "Last week" },
    { id: 5, t: "Quiz prep · derivatives", course: "Calculus I", time: "Mar 14" },
  ];
  return (
    <div className="cg" style={{height: '100%'}}>
      <div className="app">
        <Sidebar role="student" active="tutor" />
        <div className="main">
          <div style={{height: 56, borderBottom: '1px solid var(--hair)', background: 'var(--surface)', display:'flex', alignItems:'center', padding: '0 28px', gap: 16}}>
            <div className="row" style={{gap: 10}}>
              <span style={{color:'var(--accent-deep)'}}>{Ic.spark}</span>
              <div className="serif" style={{fontSize: 18, letterSpacing:'-0.02em'}}>AI Tutor</div>
              <span className="chip accent" style={{marginLeft: 8}}>Lesson context: Eigenvalues 4.2</span>
            </div>
            <div className="top-actions">
              <button className="btn ghost sm">{Ic.plus} New chat</button>
              <span className="streak-pill">{Ic.flame} 12</span>
            </div>
          </div>
          <div style={{display:'grid', gridTemplateColumns: '260px 1fr', flex: 1, overflow:'hidden'}}>
            {/* History */}
            <div style={{borderRight: '1px solid var(--hair)', padding: 14, background:'var(--surface)', overflow:'auto'}}>
              <div className="tag" style={{padding: '6px 8px'}}>RECENT</div>
              {chats.map(c => (
                <div key={c.id} style={{
                  padding: '10px 12px', borderRadius: 8, marginBottom: 4,
                  background: c.active ? 'var(--card)' : 'transparent',
                  border: c.active ? '1px solid var(--hair)' : '1px solid transparent',
                }}>
                  <div style={{fontSize: 13, fontWeight: 500, marginBottom: 3}}>{c.t}</div>
                  <div className="row" style={{justifyContent:'space-between'}}>
                    <span className="tag">{c.course}</span>
                    <span className="tag">{c.time}</span>
                  </div>
                </div>
              ))}
              <hr className="hair" style={{margin: '14px 0'}}/>
              <div className="tag" style={{padding: '6px 8px'}}>CONTEXT</div>
              <div className="card" style={{padding: 12, fontSize: 12.5}}>
                <div className="card-sub" style={{marginBottom: 6}}>Currently grounded in:</div>
                <div style={{fontWeight: 500, marginBottom: 4}}>Lesson 4.2 — Characteristic polynomial</div>
                <div className="card-sub">Linear Algebra Foundations · Module 4</div>
              </div>
            </div>

            {/* Conversation */}
            <div style={{display:'flex', flexDirection:'column', overflow:'hidden'}}>
              <div style={{flex: 1, overflow:'auto', padding: '28px 80px'}}>
                <div style={{maxWidth: 720, margin: '0 auto'}}>
                  <Msg role="user" who="LP" name="You" time="2:14 pm">
                    I don't get why we even bother with the characteristic polynomial. Can't we just guess eigenvalues from the matrix?
                  </Msg>

                  <Msg role="ai" time="2:14 pm">
                    <p>Great question — and you <em>can</em> guess for small or special matrices. The characteristic polynomial earns its keep in two situations:</p>
                    <ol>
                      <li><b>Anything beyond 2×2 or triangular.</b> Once you can't read eigenvalues off the diagonal, a determinant is faster than guess-and-check.</li>
                      <li><b>You need <em>all</em> of them.</b> The polynomial guarantees you find every eigenvalue, including repeats and complex ones — guessing tends to miss those.</li>
                    </ol>
                    <p>For your lesson's matrix A = [[3,1],[0,3]], the polynomial is (3−λ)² — instantly telling you λ=3 is repeated. A guess might've stopped at 3 and missed the algebraic multiplicity.</p>
                  </Msg>

                  <Msg role="user" who="LP" name="You" time="2:15 pm">
                    OK that makes sense for the repeated case. But what changes when the matrix is bigger — is it just messier algebra?
                  </Msg>

                  <Msg role="ai" streaming time="2:15 pm">
                    <p>Messier, yes — but also more <em>structured</em>. Here's what scales up:</p>
                    <ul>
                      <li>For an n×n matrix, you get a degree-n polynomial. So a 5×5 matrix means a quintic — which has no general closed-form solution.</li>
                      <li>That's why, in practice, real software <span className="mono">never</span> computes eigenvalues via the polynomial. They use iterative methods like QR.</li>
                      <li>The polynomial is still the right mental model — it tells you the eigenvalues <i>exist</i>{" "}<span className="streaming-cursor"/></li>
                    </ul>
                  </Msg>
                </div>
              </div>

              {/* Composer */}
              <div style={{padding: '14px 80px 24px', borderTop:'1px solid var(--hair)', background: 'var(--surface)'}}>
                <div style={{maxWidth: 720, margin: '0 auto'}}>
                  <div className="card" style={{padding: 12, display:'grid', gridTemplateColumns:'1fr auto', gap: 8, alignItems:'end'}}>
                    <textarea className="in" rows={2} style={{border:'none', resize:'none', padding: 0}} defaultValue="Can you walk me through computing the eigenvectors once we have λ?"/>
                    <div className="row" style={{gap: 6}}>
                      <button className="btn ghost sm">{Ic.book} Cite</button>
                      <button className="btn accent sm">{Ic.send} Send</button>
                    </div>
                  </div>
                  <div className="row" style={{gap: 6, marginTop: 10, flexWrap:'wrap'}}>
                    <span className="tag" style={{marginRight: 4}}>Try:</span>
                    {["Quiz me on this", "Give me a worked example", "Show me a visual", "Connect to PCA"].map(s => (
                      <span key={s} className="chip" style={{cursor:'default'}}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Msg({ role, who, name, time, streaming, children }) {
  const isAI = role === 'ai';
  return (
    <div style={{display:'grid', gridTemplateColumns:'40px 1fr', gap: 14, marginBottom: 22}}>
      <div style={{
        width: 32, height: 32, borderRadius: 999,
        background: isAI ? 'var(--ink)' : 'var(--accent)',
        color: 'white', display:'grid', placeItems:'center',
        fontFamily: isAI ? 'var(--serif)' : 'var(--sans)',
        fontSize: isAI ? 14 : 12, fontWeight: 500
      }}>{isAI ? 'c' : who}</div>
      <div>
        <div className="row" style={{gap: 8, marginBottom: 6}}>
          <span style={{fontSize: 13, fontWeight: 500}}>{isAI ? 'Cognify Tutor' : name}</span>
          {isAI && <span className="tag">Gemini · grounded in Lesson 4.2</span>}
          {streaming && <span className="chip accent" style={{padding: '0 6px'}}><span className="dot" style={{animation:'pulse 1.4s ease infinite'}}/>streaming</span>}
          <span className="tag" style={{marginLeft:'auto'}}>{time}</span>
        </div>
        <div style={{
          fontSize: 14.5, lineHeight: 1.6, color: 'var(--ink-2)',
          background: isAI ? 'var(--surface)' : 'transparent',
          border: isAI ? '1px solid var(--hair)' : 'none',
          borderRadius: 10, padding: isAI ? '14px 18px' : '0',
        }}>
          {children}
        </div>
        {isAI && !streaming && (
          <div className="row" style={{gap: 6, marginTop: 8}}>
            <button className="btn ghost sm">{Ic.copy} Copy</button>
            <button className="btn ghost sm">Save to notes</button>
            <button className="btn ghost sm">👍</button>
            <button className="btn ghost sm">👎</button>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { ProgressPage, AITutor });
