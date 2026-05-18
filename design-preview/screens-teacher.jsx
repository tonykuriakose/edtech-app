// Teacher screens

function TeacherDashboard() {
  return (
    <div className="cg" style={{height: '100%'}}>
      <div className="app">
        <Sidebar role="teacher" active="teach" />
        <div className="main">
          <Topbar search="Search your courses, students, drafts…" right={
            <>
              <button className="btn ghost sm">{Ic.spark} Generate quiz</button>
              <button className="btn accent sm">{Ic.plus} New course</button>
            </>
          }/>
          <div className="content">
            <div className="page-head">
              <div>
                <div className="eyebrow">Teaching · Spring term</div>
                <h1 className="page-title">Hi Naomi — your studio.</h1>
                <p className="lede">3 courses live, 2 in draft. A new cohort started Linear Algebra yesterday — early signals look strong.</p>
              </div>
            </div>

            <div className="grid" style={{gridTemplateColumns:'repeat(4, 1fr)', marginBottom: 16}}>
              <Stat num="2,418" label="Active students" delta="+312 this week" />
              <Stat num="78%" label="Avg. completion" delta="+4%" />
              <Stat num="84%" label="Avg. quiz score" delta="+1%" />
              <Stat num="$4,820" label="Earnings (term)" delta="+18%" />
            </div>

            <div className="grid" style={{gridTemplateColumns: '1.4fr 1fr', gap: 16}}>
              {/* Courses table */}
              <div className="card">
                <div className="card-head">
                  <div>
                    <div className="card-title">Your courses</div>
                    <div className="card-sub">Drag to reorder · status reflects review state</div>
                  </div>
                  <div className="row" style={{gap: 6}}>
                    <span className="chip">All</span>
                    <span className="chip accent">Published</span>
                    <span className="chip">Draft</span>
                    <span className="chip">In review</span>
                  </div>
                </div>
                <table className="tbl">
                  <thead>
                    <tr><th>Course</th><th>Status</th><th>Students</th><th>Completion</th><th></th></tr>
                  </thead>
                  <tbody>
                    {[
                      { t: "Linear Algebra Foundations", s: "Published", n: 1240, c: 72, hue: 30 },
                      { t: "Calculus I — A Visual Course", s: "Published", n: 802, c: 64, hue: 50 },
                      { t: "Discrete Math Essentials", s: "Published", n: 376, c: 81, hue: 70 },
                      { t: "Probability for Programmers", s: "In review", n: 0, c: 0, hue: 130 },
                      { t: "Numerical Methods (working title)", s: "Draft", n: 0, c: 0, hue: 200 },
                    ].map((c, i) => (
                      <tr key={i}>
                        <td>
                          <div className="row" style={{gap: 12}}>
                            <div style={{width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg, oklch(0.86 0.06 ${c.hue}), oklch(0.74 0.10 ${c.hue}))`, flex: 'none'}}/>
                            <div>
                              <div style={{fontWeight: 500}}>{c.t}</div>
                              <div className="card-sub">Updated 2 days ago</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={"chip " + (c.s === 'Published' ? 'ok' : c.s === 'In review' ? 'warn' : '')}>
                            <span className="dot"/>{c.s}
                          </span>
                        </td>
                        <td>{c.n > 0 ? c.n.toLocaleString() : '—'}</td>
                        <td style={{minWidth: 140}}>
                          {c.c > 0 ? (
                            <>
                              <div className="row" style={{justifyContent:'space-between', marginBottom: 4}}>
                                <span className="tag">{c.c}%</span>
                              </div>
                              <div className="progress"><i style={{width: c.c+'%'}}/></div>
                            </>
                          ) : <span className="tag">—</span>}
                        </td>
                        <td><button className="btn sm ghost">{Ic.more}</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Side panels */}
              <div className="grid" style={{gap: 16, alignContent:'start'}}>
                <div className="card">
                  <div className="card-head">
                    <div className="card-title">Approval queue</div>
                    <span className="chip warn"><span className="dot"/>1 awaiting</span>
                  </div>
                  <div style={{padding: 14}}>
                    <div className="card-sub" style={{marginBottom: 6}}>Probability for Programmers</div>
                    <div style={{fontSize: 13, marginBottom: 10}}>Submitted 6h ago · admin will respond within 48h. You can keep editing minor things.</div>
                    <div className="progress"><i style={{width: '60%'}}/></div>
                    <div className="row" style={{justifyContent:'space-between', marginTop: 8, fontSize: 11.5, color:'var(--muted)'}}>
                      <span>Content reviewed</span>
                      <span>Curriculum approved</span>
                      <span>Final</span>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-head">
                    <div className="card-title">Recent feedback</div>
                    <span className="card-sub">From student quizzes</span>
                  </div>
                  <div>
                    {[
                      { who: "Lena P.", c: "Linear Algebra", t: "Lesson 4.2 — the video derivation moves a bit fast. Could use a pause for the determinant step.", time: "1h" },
                      { who: "Diego R.", c: "Calculus I", t: "Loved the geometric explanation of limits — clicked immediately!", time: "3h", positive: true },
                      { who: "Aki T.", c: "Linear Algebra", t: "Question 4 on the M4 quiz feels ambiguous — both B and C seem defensible.", time: "1d" },
                    ].map((f, i) => (
                      <div key={i} style={{padding: 14, borderTop: i ? '1px solid var(--hair)' : 'none'}}>
                        <div className="row" style={{justifyContent:'space-between', marginBottom: 6}}>
                          <div className="row" style={{gap: 8}}>
                            <span className="avatar" style={{width: 20, height: 20, fontSize: 9, background: f.positive ? 'var(--ok)' : 'var(--accent)'}}>{f.who[0]}</span>
                            <span style={{fontSize: 12.5, fontWeight: 500}}>{f.who}</span>
                            <span className="tag">{f.c}</span>
                          </div>
                          <span className="tag">{f.time}</span>
                        </div>
                        <div style={{fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.45}}>"{f.t}"</div>
                      </div>
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

function CourseWizard() {
  return (
    <div className="cg" style={{height: '100%'}}>
      <div className="app">
        <Sidebar role="teacher" active="wizard" />
        <div className="main">
          <div style={{height: 56, borderBottom: '1px solid var(--hair)', background: 'var(--surface)', display:'flex', alignItems:'center', padding:'0 28px', gap: 16}}>
            <div className="row" style={{gap: 10}}>
              <button className="btn ghost sm">{Ic.arrowL} Back to drafts</button>
              <span className="tag" style={{marginLeft: 10}}>DRAFT</span>
              <div className="serif" style={{fontSize: 17, letterSpacing:'-0.015em', marginLeft: 6}}>Probability for Programmers</div>
            </div>
            <div className="top-actions">
              <span className="tag">Saved 8s ago</span>
              <button className="btn ghost sm">Preview</button>
              <button className="btn sm">Submit for review</button>
            </div>
          </div>

          <div className="content">
            {/* Stepper */}
            <div className="card card-pad" style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 0, padding: 0, marginBottom: 24, overflow:'hidden'}}>
              {[
                { n: 1, t: "Course basics", s: "Title, audience, tags", state: "done" },
                { n: 2, t: "Modules", s: "5 modules · 28 lessons", state: "done" },
                { n: 3, t: "Lessons & content", s: "MDX, videos, summaries", state: "active" },
                { n: 4, t: "Review & publish", s: "Quizzes, publish settings", state: "future" },
              ].map((s, i) => (
                <div key={i} style={{
                  padding: '18px 22px',
                  borderRight: i < 3 ? '1px solid var(--hair)' : 'none',
                  background: s.state === 'active' ? 'var(--accent-tint)' : s.state === 'done' ? 'var(--surface)' : 'transparent',
                }}>
                  <div className="row" style={{gap: 12, marginBottom: 8}}>
                    <div style={{
                      width: 26, height: 26, borderRadius: 999, display:'grid', placeItems:'center',
                      background: s.state === 'done' ? 'var(--ok)' : s.state === 'active' ? 'var(--accent)' : 'var(--surface-2)',
                      color: s.state === 'future' ? 'var(--muted)' : 'white', fontSize: 12, fontWeight: 500
                    }}>{s.state === 'done' ? '✓' : s.n}</div>
                    <div style={{fontWeight: 500}}>{s.t}</div>
                  </div>
                  <div className="card-sub">{s.s}</div>
                </div>
              ))}
            </div>

            <div style={{display:'grid', gridTemplateColumns:'280px 1fr 320px', gap: 24}}>
              {/* Module tree */}
              <div>
                <div className="row" style={{justifyContent:'space-between', marginBottom: 10}}>
                  <div className="card-title">Modules</div>
                  <button className="btn ghost sm">{Ic.plus}</button>
                </div>
                {[
                  { n: 1, t: "Probability fundamentals", lessons: 6, done: 6 },
                  { n: 2, t: "Random variables", lessons: 5, done: 5 },
                  { n: 3, t: "Common distributions", lessons: 7, done: 4, active: true },
                  { n: 4, t: "Estimators & inference", lessons: 6, done: 0 },
                  { n: 5, t: "Monte Carlo in code", lessons: 4, done: 0 },
                ].map((m, i) => (
                  <div key={i} style={{
                    padding: 12, borderRadius: 8, marginBottom: 6,
                    background: m.active ? 'var(--card)' : 'transparent',
                    border: m.active ? '1px solid var(--accent-soft)' : '1px solid transparent',
                  }}>
                    <div className="row" style={{justifyContent:'space-between', marginBottom: 6}}>
                      <div style={{fontSize: 13, fontWeight: 500}}>0{m.n} · {m.t}</div>
                      <span className="tag">{m.done}/{m.lessons}</span>
                    </div>
                    {m.active && (
                      <div style={{marginTop: 8, paddingLeft: 12, borderLeft: '2px solid var(--accent)'}}>
                        {[
                          "3.1 The bell curve, intuitively",
                          "3.2 Bernoulli & binomial",
                          "3.3 Poisson processes",
                          "3.4 Exponential distribution (in progress)",
                          "3.5 The normal distribution",
                          "3.6 When distributions go wrong",
                          "3.7 Module quiz",
                        ].map((l, j) => (
                          <div key={j} style={{padding: '4px 8px', fontSize: 12.5, color: j === 3 ? 'var(--accent-deep)' : 'var(--muted)', fontWeight: j === 3 ? 500 : 400}}>
                            {l}
                          </div>
                        ))}
                        <button className="btn ghost sm" style={{marginTop: 6, fontSize: 11.5}}>{Ic.plus} Lesson</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Editor */}
              <div>
                <div className="row" style={{justifyContent:'space-between', marginBottom: 14}}>
                  <div>
                    <span className="tag">MODULE 3 · LESSON 3.4</span>
                    <div className="serif" style={{fontSize: 26, letterSpacing:'-0.02em', marginTop: 4}}>Exponential distribution</div>
                  </div>
                  <div className="row" style={{gap: 6}}>
                    <button className="btn ghost sm">{Ic.video} Embed video</button>
                    <button className="btn accent sm">{Ic.spark} Generate quiz</button>
                  </div>
                </div>

                <div className="card" style={{padding: 18, marginBottom: 16}}>
                  <div className="row" style={{gap: 10, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--hair)'}}>
                    <span className="chip">H1</span>
                    <span className="chip">H2</span>
                    <span className="chip">B</span>
                    <span className="chip">i</span>
                    <span className="chip">{Ic.copy} Code</span>
                    <span className="chip">Quote</span>
                    <span className="chip">Math</span>
                    <span className="chip">Image</span>
                    <span style={{flex: 1}}/>
                    <span className="chip accent">{Ic.spark} Rewrite</span>
                  </div>
                  <div style={{fontFamily:'var(--mono)', fontSize: 13, lineHeight: 1.7, color: 'var(--ink-2)'}}>
                    <div style={{color: 'var(--accent-deep)'}}># Exponential distribution</div>
                    <br/>
                    <div>The exponential distribution describes the **time between events** in a Poisson process — the wait until the next bus, the next packet, the next radioactive decay.</div>
                    <br/>
                    <div style={{color: 'var(--accent-deep)'}}>## The shape of patience</div>
                    <br/>
                    <div>It has a single parameter, the rate `λ`, and a beautifully simple PDF:</div>
                    <br/>
                    <div>$$f(x) = \lambda e^{`{-\\lambda x}`}, \quad x \\geq 0$$</div>
                    <br/>
                    <div>A few things to notice:</div>
                    <div>- It's **memoryless** — past waiting time tells you nothing about future waiting time</div>
                    <div>- Mean and standard deviation are both `1/λ`</div>
                    <div>- It's the continuous cousin of the geometric distribution</div>
                    <br/>
                    <div>&lt;VideoEmbed src="..." caption="3-min visual derivation" /&gt;</div>
                  </div>
                </div>

                <div className="card card-pad" style={{display:'flex', gap: 12, alignItems:'center'}}>
                  <div style={{flex: 1}}>
                    <div className="card-title">Quiz for this lesson</div>
                    <div className="card-sub">8 multiple-choice questions · generated and edited by you</div>
                  </div>
                  <span className="chip ok"><span className="dot"/>Ready</span>
                  <button className="btn sm ghost">Edit questions</button>
                </div>
              </div>

              {/* AI assistant panel */}
              <div>
                <div className="card warm card-pad" style={{marginBottom: 16}}>
                  <div className="row" style={{gap: 8, marginBottom: 10}}>
                    <span style={{color:'var(--accent-deep)'}}>{Ic.spark}</span>
                    <div className="card-title" style={{color:'var(--accent-deep)'}}>Generate quiz from this lesson</div>
                  </div>
                  <div className="card-sub" style={{marginBottom: 14}}>We'll create MCQs grounded in your MDX. You review before students see anything.</div>
                  <label className="lbl">Number of questions</label>
                  <div className="row" style={{gap: 6, marginBottom: 14}}>
                    {[5, 8, 10, 12].map(n => <span key={n} className={"chip" + (n === 8 ? " accent" : "")}>{n}</span>)}
                  </div>
                  <label className="lbl">Difficulty mix</label>
                  <div className="row" style={{gap: 6, marginBottom: 14}}>
                    <span className="chip">Easy 25%</span>
                    <span className="chip accent">Mixed</span>
                    <span className="chip">Hard 25%</span>
                  </div>
                  <button className="btn accent" style={{width: '100%', justifyContent:'center'}}>{Ic.spark} Generate 8 questions</button>
                  <div className="tag" style={{marginTop: 8, textAlign: 'center'}}>~12 seconds · Gemini · Zod-validated</div>
                </div>

                <div className="card card-pad">
                  <div className="card-title" style={{marginBottom: 8}}>Suggestions for this lesson</div>
                  {[
                    "Add an interactive λ slider so students can see how the curve changes",
                    "The memoryless property could use a real-world example — bus arrivals?",
                    "Mention the connection to the Poisson section earlier",
                  ].map((s, i) => (
                    <div key={i} className="row" style={{gap: 8, padding: '8px 0', borderTop: i ? '1px solid var(--hair)' : 'none', alignItems:'flex-start'}}>
                      <span style={{color:'var(--accent)', marginTop: 2, flex:'none'}}>{Ic.spark}</span>
                      <div style={{fontSize: 12.5, lineHeight: 1.5}}>{s}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CourseAnalytics() {
  return (
    <div className="cg" style={{height: '100%'}}>
      <div className="app">
        <Sidebar role="teacher" active="analytics" />
        <div className="main">
          <Topbar search="Search analytics…" right={
            <>
              <span className="chip">Term · Spring 2026</span>
              <button className="btn ghost sm">Export CSV</button>
            </>
          }/>
          <div className="content">
            <div className="row" style={{gap: 8, marginBottom: 14}}>
              <span className="tag">My courses /</span>
              <span className="tag" style={{color:'var(--ink-2)'}}>Linear Algebra Foundations</span>
              <span className="tag">/ Analytics</span>
            </div>

            <div className="page-head">
              <div>
                <div className="eyebrow">Linear Algebra Foundations · Analytics</div>
                <h1 className="page-title">1,240 students. 72% on pace.</h1>
                <p className="lede">Eigenvectors is the topic students struggle with most — consider reviewing lesson 4.3 or adding a tutorial.</p>
              </div>
              <div style={{display:'flex', gap: 6}}>
                <span className="chip">All cohorts</span>
                <span className="chip accent">Spring '26</span>
                <span className="chip">Fall '25</span>
              </div>
            </div>

            <div className="grid" style={{gridTemplateColumns:'repeat(5, 1fr)', marginBottom: 16}}>
              <Stat num="1,240" label="Active learners" delta="+128" />
              <Stat num="72%" label="Avg. completion" delta="+3%" />
              <Stat num="84%" label="Avg. quiz score" delta="+2%" />
              <Stat num="2.1" label="Quizzes per learner" sub="median" />
              <Stat num="4.8" label="Rating · 412 reviews" sub="↑ from 4.7" />
            </div>

            <div className="grid" style={{gridTemplateColumns: '1.4fr 1fr', gap: 16}}>
              {/* Funnel by module */}
              <div className="card card-pad">
                <div className="card-title" style={{marginBottom: 4}}>Completion funnel</div>
                <div className="card-sub" style={{marginBottom: 18}}>Drop-off by module · 1,240 starters</div>
                {[
                  { t: "Module 1: Vectors & spaces", n: 1240, p: 100 },
                  { t: "Module 2: Matrix operations", n: 1132, p: 91 },
                  { t: "Module 3: Linear transformations", n: 982, p: 79 },
                  { t: "Module 4: Eigenvalues & eigenvectors", n: 740, p: 60, drop: true },
                  { t: "Module 5: Diagonalization", n: 562, p: 45 },
                  { t: "Module 6: Applications · PCA", n: 412, p: 33 },
                ].map((m, i) => (
                  <div key={i} style={{marginBottom: 12}}>
                    <div className="row" style={{justifyContent:'space-between', marginBottom: 6}}>
                      <div style={{fontSize: 13}}>{m.t}</div>
                      <div className="row" style={{gap: 10}}>
                        <span className="tag">{m.n.toLocaleString()}</span>
                        {m.drop && <span className="chip bad"><span className="dot"/>biggest drop</span>}
                      </div>
                    </div>
                    <div style={{position:'relative', height: 22, background: 'var(--surface-2)', borderRadius: 4, overflow: 'hidden'}}>
                      <div style={{position:'absolute', inset: 0, width: m.p+'%', background: m.drop ? 'var(--bad-soft)' : 'var(--accent-tint)', borderRadius: 4}}/>
                      <div style={{position:'absolute', left: 8, top: 0, lineHeight: '22px', fontSize: 11.5, color: m.drop ? 'var(--bad)' : 'var(--accent-deep)', fontWeight: 500}}>{m.p}%</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Question quality */}
              <div className="card">
                <div className="card-head">
                  <div>
                    <div className="card-title">Quiz question health</div>
                    <div className="card-sub">Module 4 · Eigenvalue checkpoint</div>
                  </div>
                </div>
                <table className="tbl">
                  <thead><tr><th>#</th><th>Correct%</th><th>Time</th><th>Health</th></tr></thead>
                  <tbody>
                    {[
                      { n: "Q1", c: 92, t: "44s", h: "ok" },
                      { n: "Q2", c: 78, t: "1m 02s", h: "ok" },
                      { n: "Q3", c: 64, t: "1m 18s", h: "ok" },
                      { n: "Q4", c: 28, t: "2m 41s", h: "bad", note: "Ambiguous" },
                      { n: "Q5", c: 81, t: "55s", h: "ok" },
                      { n: "Q6", c: 49, t: "1m 50s", h: "warn", note: "Too hard" },
                      { n: "Q7", c: 99, t: "30s", h: "warn", note: "Too easy" },
                      { n: "Q8", c: 72, t: "1m 12s", h: "ok" },
                    ].map((q, i) => (
                      <tr key={i}>
                        <td style={{fontFamily:'var(--mono)'}}>{q.n}</td>
                        <td>{q.c}%</td>
                        <td className="tag">{q.t}</td>
                        <td>
                          <span className={"chip " + q.h}><span className="dot"/>{q.note || 'Healthy'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid" style={{gridTemplateColumns:'1fr 1fr', gap: 16, marginTop: 16}}>
              <div className="card card-pad">
                <div className="card-title" style={{marginBottom: 4}}>Score distribution</div>
                <div className="card-sub" style={{marginBottom: 18}}>All Module 4 attempts · n = 1,840</div>
                <div className="row" style={{alignItems:'flex-end', height: 160, gap: 8}}>
                  {[3, 6, 9, 14, 22, 28, 24, 18, 12, 7].map((h, i) => (
                    <div key={i} style={{flex: 1, display:'flex', flexDirection:'column', alignItems:'center', gap: 6}}>
                      <div style={{
                        height: h * 5, width: '100%', borderRadius: 4,
                        background: i < 3 ? 'var(--bad-soft)' : i < 6 ? 'var(--warn-soft)' : 'var(--accent-tint)',
                        border: i === 7 ? '2px solid var(--accent)' : 'none'
                      }}/>
                      <span className="tag">{i*10}-{i*10+10}</span>
                    </div>
                  ))}
                </div>
                <hr className="hair" style={{margin:'16px 0'}}/>
                <div className="row" style={{justifyContent:'space-between', fontSize: 12}}>
                  <span className="card-sub">Mean: <b style={{color:'var(--ink)'}}>84%</b></span>
                  <span className="card-sub">Median: <b style={{color:'var(--ink)'}}>87%</b></span>
                  <span className="card-sub">Pass rate: <b style={{color:'var(--ink)'}}>92%</b></span>
                </div>
              </div>

              <div className="card card-pad">
                <div className="card-title" style={{marginBottom: 4}}>AI-flagged actions</div>
                <div className="card-sub" style={{marginBottom: 14}}>Suggestions based on cohort behavior</div>
                {[
                  { sev: "bad", t: "Question 4 is confusing", d: "Only 28% correct, 2:41 avg time. Several students complained in feedback.", a: "Rewrite" },
                  { sev: "warn", t: "Module 4 → 5 drop-off is steep", d: "24% drop. Most cite eigenvector computation. Consider a worked-example bonus lesson.", a: "Add lesson" },
                  { sev: "info", t: "Add a video to lesson 3.7", d: "Students spend 4x average time but score above average. Visual aid would tighten this.", a: "Generate brief" },
                ].map((a, i) => (
                  <div key={i} style={{padding: '14px 0', borderTop: i ? '1px solid var(--hair)' : 'none', display:'grid', gridTemplateColumns:'24px 1fr auto', gap: 12, alignItems: 'start'}}>
                    <span className={"chip " + a.sev} style={{width: 22, height: 22, padding: 0, justifyContent:'center'}}><span className="dot"/></span>
                    <div>
                      <div style={{fontSize: 13.5, fontWeight: 500, marginBottom: 2}}>{a.t}</div>
                      <div className="card-sub">{a.d}</div>
                    </div>
                    <button className="btn sm ghost">{a.a}</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TeacherDashboard, CourseWizard, CourseAnalytics });
