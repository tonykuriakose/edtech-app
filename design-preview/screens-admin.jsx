// Admin screens

function AdminOverview() {
  return (
    <div className="cg" style={{height: '100%'}}>
      <div className="app">
        <Sidebar role="admin" active="admin" />
        <div className="main">
          <Topbar search="Search users, courses, audit log…" right={
            <>
              <span className="chip">Last 30 days</span>
              <button className="btn ghost sm">Export</button>
            </>
          }/>
          <div className="content">
            <div className="page-head">
              <div>
                <div className="eyebrow">Platform · Health</div>
                <h1 className="page-title">Cognify is running well.</h1>
                <p className="lede">All systems normal. 12 courses await your approval — three submitted in the last 24 hours.</p>
              </div>
              <div style={{display:'flex', gap: 8}}>
                <span className="chip ok"><span className="dot"/>All systems normal</span>
                <button className="btn ghost sm">Audit log</button>
              </div>
            </div>

            <div className="grid" style={{gridTemplateColumns:'repeat(4, 1fr)', marginBottom: 16}}>
              <Stat num="48,210" label="Total users" delta="+1,240 this month" />
              <Stat num="412" label="Live courses" delta="+18" />
              <Stat num="12" label="Pending approval" delta="3 new today" deltaDir="down" />
              <Stat num="98.7%" label="Quiz gen success" sub="last 7d · AI SDK" />
            </div>

            <div className="grid" style={{gridTemplateColumns: '1.4fr 1fr', gap: 16}}>
              {/* Activity chart */}
              <div className="card card-pad">
                <div className="row" style={{justifyContent:'space-between', marginBottom: 14}}>
                  <div>
                    <div className="card-title">Active users</div>
                    <div className="card-sub">Daily active · 30 days</div>
                  </div>
                  <div className="row" style={{gap: 6}}>
                    <span className="chip"><span className="dot" style={{background:'var(--accent)'}}/>Students</span>
                    <span className="chip"><span className="dot" style={{background:'var(--info)'}}/>Teachers</span>
                  </div>
                </div>
                <ActivityChart />
              </div>

              {/* Approval queue */}
              <div className="card">
                <div className="card-head">
                  <div>
                    <div className="card-title">Approval queue</div>
                    <div className="card-sub">Oldest first</div>
                  </div>
                  <span className="chip warn"><span className="dot"/>12 pending</span>
                </div>
                <div>
                  {[
                    { t: "Probability for Programmers", by: "N. Okafor", time: "6h", hue: 130 },
                    { t: "Intro to Topology", by: "M. Vance", time: "2d", hue: 200 },
                    { t: "Modern French — Grammar", by: "É. Dubois", time: "3d", hue: 280 },
                    { t: "Mindful Productivity", by: "K. Shaw", time: "4d", hue: 350 },
                  ].map((c, i) => (
                    <div key={i} style={{padding: '12px 18px', borderTop: i ? '1px solid var(--hair)' : 'none', display:'grid', gridTemplateColumns:'30px 1fr auto', gap: 12, alignItems:'center'}}>
                      <div style={{width: 28, height: 28, borderRadius: 6, background: `linear-gradient(135deg, oklch(0.86 0.06 ${c.hue}), oklch(0.74 0.10 ${c.hue}))`}}/>
                      <div>
                        <div style={{fontSize: 13, fontWeight: 500}}>{c.t}</div>
                        <div className="card-sub">{c.by} · waiting {c.time}</div>
                      </div>
                      <button className="btn sm ghost">Review</button>
                    </div>
                  ))}
                </div>
                <div style={{padding: 12, borderTop:'1px solid var(--hair)'}}>
                  <button className="btn ghost sm" style={{width: '100%', justifyContent:'center'}}>See all 12</button>
                </div>
              </div>
            </div>

            <div className="grid" style={{gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 16}}>
              <div className="card">
                <div className="card-head"><div className="card-title">Top courses</div><span className="card-sub">by enrollment</span></div>
                <div>
                  {[
                    { t: "Modern JavaScript", n: 21034 },
                    { t: "Linear Algebra Foundations", n: 12401 },
                    { t: "Calculus I — Visual", n: 9881 },
                    { t: "Statistics 201", n: 8104 },
                    { t: "Data Structures", n: 5810 },
                  ].map((c, i) => (
                    <div key={i} style={{padding: '12px 18px', borderTop: i ? '1px solid var(--hair)' : 'none'}}>
                      <div className="row" style={{justifyContent:'space-between', marginBottom: 4}}>
                        <span style={{fontSize: 13}}>{c.t}</span>
                        <span className="tag">{c.n.toLocaleString()}</span>
                      </div>
                      <div className="progress"><i style={{width: (c.n / 21034 * 100) + '%'}}/></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="card-head"><div className="card-title">Roles</div></div>
                <div style={{padding: 18}}>
                  <div className="grid" style={{gridTemplateColumns:'auto 1fr', gap: 14, alignItems:'center', marginBottom: 14}}>
                    <RoleDonut/>
                    <div>
                      {[
                        { c: "var(--accent)", l: "Student", v: "46,128 · 95.7%" },
                        { c: "var(--info)", l: "Teacher", v: "2,041 · 4.2%" },
                        { c: "var(--ink)", l: "Admin", v: "41 · 0.1%" },
                      ].map((r, i) => (
                        <div key={i} className="row" style={{gap: 10, marginBottom: 8}}>
                          <span style={{width: 10, height: 10, borderRadius: 2, background: r.c}}/>
                          <div>
                            <div style={{fontSize: 13, fontWeight: 500}}>{r.l}</div>
                            <div className="card-sub">{r.v}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-head"><div className="card-title">AI usage</div><span className="card-sub">last 7 days</span></div>
                <div style={{padding: 18}}>
                  {[
                    { l: "Tutor chat (streamText)", n: 24180, p: 100, c: "var(--accent)" },
                    { l: "Quiz gen (generateObject)", n: 5042, p: 22, c: "var(--info)" },
                    { l: "Summary (generateText)", n: 3801, p: 16, c: "var(--ok)" },
                  ].map((u, i) => (
                    <div key={i} style={{marginBottom: 14}}>
                      <div className="row" style={{justifyContent:'space-between', marginBottom: 6}}>
                        <span style={{fontSize: 13}}>{u.l}</span>
                        <span className="tag">{u.n.toLocaleString()}</span>
                      </div>
                      <div className="progress"><i style={{width: u.p+'%', background: u.c}}/></div>
                    </div>
                  ))}
                  <hr className="hair" style={{margin:'12px 0'}}/>
                  <div className="row" style={{justifyContent:'space-between', fontSize: 12, color:'var(--muted)'}}>
                    <span>Gemini primary · 98.7%</span>
                    <span>Fallback OpenAI · 1.3%</span>
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

function ActivityChart() {
  const students = Array.from({length: 30}, (_, i) => 60 + Math.sin(i*0.3)*8 + (i*0.6));
  const teachers = Array.from({length: 30}, (_, i) => 12 + Math.cos(i*0.4)*3 + (i*0.1));
  const W = 720, H = 220, pad = 30;
  const max = 100;
  const x = i => pad + (i * (W - 2*pad)) / 29;
  const y = v => H - pad - (v / max) * (H - 2*pad);
  const lp = arr => arr.map((v, i) => (i === 0 ? 'M' : 'L') + x(i) + ' ' + y(v)).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:'block'}}>
      {[0, 25, 50, 75, 100].map(v => (
        <g key={v}>
          <line x1={pad} y1={y(v)} x2={W-pad} y2={y(v)} stroke="var(--hair)" strokeDasharray="2 4"/>
          <text x={6} y={y(v)+3} fontSize="10" fill="var(--muted)" fontFamily="var(--mono)">{v}k</text>
        </g>
      ))}
      <path d={lp(students) + ` L${x(29)} ${H-pad} L${x(0)} ${H-pad} Z`} fill="var(--accent)" opacity="0.12"/>
      <path d={lp(students)} stroke="var(--accent)" fill="none" strokeWidth="2"/>
      <path d={lp(teachers)} stroke="var(--info)" fill="none" strokeWidth="2"/>
    </svg>
  );
}

function RoleDonut() {
  const size = 110, r = 42, sw = 14;
  const c = 2 * Math.PI * r;
  // 95.7 / 4.2 / 0.1
  const off1 = c * (1 - 0.957);
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} stroke="var(--surface-3)" strokeWidth={sw} fill="none"/>
      <circle cx={size/2} cy={size/2} r={r} stroke="var(--accent)" strokeWidth={sw} fill="none"
        strokeDasharray={c} strokeDashoffset={off1} transform={`rotate(-90 ${size/2} ${size/2})`}/>
      <circle cx={size/2} cy={size/2} r={r} stroke="var(--info)" strokeWidth={sw} fill="none"
        strokeDasharray={`${c*0.042} ${c}`} strokeDashoffset={-(c*0.957)} transform={`rotate(-90 ${size/2} ${size/2})`}/>
      <text x={size/2} y={size/2 - 2} textAnchor="middle" fontFamily="var(--serif)" fontSize="20" letterSpacing="-0.02em">48.2k</text>
      <text x={size/2} y={size/2 + 14} textAnchor="middle" fontSize="10" fill="var(--muted)" fontFamily="var(--mono)">USERS</text>
    </svg>
  );
}

function CourseApprovals() {
  return (
    <div className="cg" style={{height: '100%'}}>
      <div className="app">
        <Sidebar role="admin" active="approvals" />
        <div className="main">
          <Topbar search="Search submissions…" right={
            <>
              <span className="chip warn"><span className="dot"/>12 pending</span>
              <button className="btn ghost sm">Audit log</button>
            </>
          }/>
          <div className="content">
            <div className="page-head">
              <div>
                <div className="eyebrow">Course approvals</div>
                <h1 className="page-title">12 courses awaiting your review.</h1>
                <p className="lede">Each submission has been auto-scanned for content quality, originality, and policy. Your final approval makes the course live.</p>
              </div>
            </div>

            <div style={{display:'grid', gridTemplateColumns:'320px 1fr', gap: 24, alignItems:'start'}}>
              {/* List */}
              <div className="card">
                <div className="card-head">
                  <div className="card-title">Queue</div>
                  <span className="chip">Oldest first</span>
                </div>
                <div>
                  {[
                    { t: "Probability for Programmers", by: "N. Okafor", time: "6h", hue: 130, sev: "ok", state: "selected" },
                    { t: "Intro to Topology", by: "M. Vance", time: "2d", hue: 200, sev: "warn" },
                    { t: "Modern French — Grammar", by: "É. Dubois", time: "3d", hue: 280, sev: "ok" },
                    { t: "Mindful Productivity", by: "K. Shaw", time: "4d", hue: 350, sev: "bad" },
                    { t: "Quantum Mechanics in 30 Days", by: "F. Hanssen", time: "5d", hue: 230, sev: "warn" },
                    { t: "Cooking with Fermentation", by: "J. Park", time: "6d", hue: 50, sev: "ok" },
                  ].map((c, i) => (
                    <div key={i} style={{
                      padding: '12px 14px',
                      borderTop: i ? '1px solid var(--hair)' : 'none',
                      display:'grid', gridTemplateColumns:'30px 1fr auto', gap: 10, alignItems:'center',
                      background: c.state === 'selected' ? 'var(--accent-tint)' : 'transparent'
                    }}>
                      <div style={{width: 28, height: 28, borderRadius: 6, background: `linear-gradient(135deg, oklch(0.86 0.06 ${c.hue}), oklch(0.74 0.10 ${c.hue}))`}}/>
                      <div>
                        <div style={{fontSize: 13, fontWeight: 500}}>{c.t}</div>
                        <div className="card-sub">{c.by} · {c.time}</div>
                      </div>
                      <span className={"chip " + c.sev} style={{width: 18, height: 18, padding: 0, justifyContent:'center'}}><span className="dot"/></span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detail */}
              <div className="card">
                <div style={{padding: 24, display:'grid', gridTemplateColumns:'1fr auto', gap: 14, alignItems:'start', borderBottom: '1px solid var(--hair)'}}>
                  <div>
                    <div className="row" style={{gap: 8, marginBottom: 10}}>
                      <span className="chip warn"><span className="dot"/>Pending review</span>
                      <span className="tag">SUBMITTED 6H AGO</span>
                    </div>
                    <h2 className="serif" style={{fontSize: 30, letterSpacing:'-0.02em', margin: '0 0 8px', fontWeight: 400}}>Probability for Programmers</h2>
                    <div className="row" style={{gap: 14, color:'var(--muted)', fontSize: 13}}>
                      <span className="row" style={{gap: 6}}>
                        <span className="avatar" style={{width: 22, height: 22, fontSize: 10, background:'var(--accent)'}}>NO</span>
                        Naomi Okafor
                      </span>
                      <span>5 modules · 28 lessons</span>
                      <span>~9 hours of content</span>
                    </div>
                  </div>
                  <div className="row" style={{gap: 6}}>
                    <button className="btn ghost">{Ic.x} Reject</button>
                    <button className="btn">Request changes</button>
                    <button className="btn accent">{Ic.check} Approve & publish</button>
                  </div>
                </div>

                <div style={{padding: 24}}>
                  <div className="grid" style={{gridTemplateColumns:'1.2fr 1fr', gap: 24}}>
                    <div>
                      <div className="serif" style={{fontSize: 16, marginBottom: 8}}>Description</div>
                      <p style={{fontSize: 13.5, color:'var(--ink-2)', lineHeight: 1.6, marginBottom: 20}}>
                        A hands-on introduction to probability theory aimed at working software engineers. Starts from sample spaces and works up to Monte Carlo methods, with every concept coded in Python. Five modules across 28 lessons, including 240 generated quiz questions, all hand-reviewed.
                      </p>

                      <div className="serif" style={{fontSize: 16, marginBottom: 12}}>Curriculum</div>
                      <div style={{border: '1px solid var(--hair)', borderRadius: 8, overflow: 'hidden'}}>
                        {[
                          { n: 1, t: "Probability fundamentals", l: 6 },
                          { n: 2, t: "Random variables", l: 5 },
                          { n: 3, t: "Common distributions", l: 7 },
                          { n: 4, t: "Estimators & inference", l: 6 },
                          { n: 5, t: "Monte Carlo in code", l: 4 },
                        ].map((m, i) => (
                          <div key={i} style={{padding: '10px 14px', borderTop: i ? '1px solid var(--hair)' : 'none', display:'grid', gridTemplateColumns:'30px 1fr auto', gap: 12, alignItems:'center'}}>
                            <span className="tag">M{m.n}</span>
                            <div style={{fontSize: 13}}>{m.t}</div>
                            <span className="card-sub">{m.l} lessons</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="card tinted" style={{padding: 16, marginBottom: 16}}>
                        <div className="row" style={{gap: 8, marginBottom: 12}}>
                          <span style={{color:'var(--accent-deep)'}}>{Ic.spark}</span>
                          <div className="card-title">Automated checks</div>
                        </div>
                        {[
                          { t: "Content quality score", v: "9.2 / 10", ok: true },
                          { t: "Originality (plagiarism)", v: "Clean — 3% boilerplate", ok: true },
                          { t: "Policy & accessibility", v: "Passes — alt text complete", ok: true },
                          { t: "Quiz validity (Zod)", v: "240/240 pass", ok: true },
                          { t: "Reading level", v: "Grade 11 · suits audience", ok: true },
                          { t: "Estimated workload", v: "9h ± 1h matches claim", ok: true },
                        ].map((c, i) => (
                          <div key={i} className="row" style={{justifyContent:'space-between', padding: '6px 0'}}>
                            <span style={{fontSize: 12.5}}>{c.t}</span>
                            <span className="row" style={{gap: 6}}>
                              <span className="tag">{c.v}</span>
                              <span style={{color: c.ok ? 'var(--ok)' : 'var(--bad)'}}>{Ic.check}</span>
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="card-title" style={{marginBottom: 8}}>Reviewer notes</div>
                      <textarea className="in" rows={4} defaultValue="Strong submission — Module 4 lesson 3 has a small typo on the binomial PMF. Approve with note."/>
                    </div>
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

function UserManagement() {
  const users = [
    { name: "Lena Park", email: "lena.p@uni.edu", role: "Student", state: "Active", joined: "Mar 14", courses: 4, hue: 30 },
    { name: "Naomi Okafor", email: "naomi@cognify.app", role: "Teacher", state: "Active", joined: "Jan 02", courses: 7, hue: 130 },
    { name: "Marcus Vance", email: "mvance@cognify.app", role: "Teacher", state: "Active", joined: "Sep 14, '24", courses: 4, hue: 200 },
    { name: "Diego Ruiz", email: "d.ruiz@uni.edu", role: "Student", state: "Active", joined: "Feb 22", courses: 2, hue: 280 },
    { name: "Aki Tanaka", email: "aki@gmail.com", role: "Student", state: "Suspended", joined: "Feb 03", courses: 3, hue: 350 },
    { name: "Priya Ramanathan", email: "priya@cognify.app", role: "Admin", state: "Active", joined: "Aug 11, '24", courses: 0, hue: 50 },
    { name: "Élise Dubois", email: "e.dubois@cognify.app", role: "Teacher", state: "Pending email", joined: "Mar 22", courses: 1, hue: 230 },
    { name: "Sara Okonkwo", email: "sara@cognify.app", role: "Teacher", state: "Active", joined: "Jul 04, '24", courses: 3, hue: 70 },
  ];
  return (
    <div className="cg" style={{height: '100%'}}>
      <div className="app">
        <Sidebar role="admin" active="users" />
        <div className="main">
          <Topbar search="Search users by name, email, or ID…" right={
            <>
              <button className="btn ghost sm">Export CSV</button>
              <button className="btn accent sm">{Ic.plus} Invite user</button>
            </>
          }/>
          <div className="content">
            <div className="page-head">
              <div>
                <div className="eyebrow">User management</div>
                <h1 className="page-title">48,210 people across Cognify.</h1>
                <p className="lede">Manage accounts, change roles, and respond to support escalations. All actions are recorded in the audit log.</p>
              </div>
            </div>

            <div className="grid" style={{gridTemplateColumns:'repeat(4, 1fr)', marginBottom: 16}}>
              <Stat num="46,128" label="Students" delta="+1,180 this month" />
              <Stat num="2,041" label="Teachers" delta="+58" />
              <Stat num="41" label="Admins" sub="No change" />
              <Stat num="14" label="Suspended" sub="Down from 22" />
            </div>

            <div className="card">
              <div className="card-head">
                <div className="row" style={{gap: 10}}>
                  <span className="card-title">All users</span>
                  <span className="chip">48,210</span>
                </div>
                <div className="row" style={{gap: 6}}>
                  <span className="chip accent">All</span>
                  <span className="chip">Students</span>
                  <span className="chip">Teachers</span>
                  <span className="chip">Admins</span>
                  <span className="chip">Suspended</span>
                  <span className="chip">{Ic.filter} Filter</span>
                </div>
              </div>
              <table className="tbl">
                <thead>
                  <tr>
                    <th style={{width: 24}}><input type="checkbox"/></th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Courses</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={i}>
                      <td><input type="checkbox"/></td>
                      <td>
                        <div className="row" style={{gap: 10}}>
                          <span className="avatar" style={{width: 28, height: 28, background: `oklch(0.7 0.12 ${u.hue})`}}>{u.name.split(' ').map(s=>s[0]).join('')}</span>
                          <div>
                            <div style={{fontWeight: 500}}>{u.name}</div>
                            <div className="card-sub">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={"chip " + (u.role === 'Admin' ? 'info' : u.role === 'Teacher' ? 'accent' : '')}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={"chip " + (u.state === 'Active' ? 'ok' : u.state === 'Suspended' ? 'bad' : 'warn')}>
                          <span className="dot"/>{u.state}
                        </span>
                      </td>
                      <td className="tag">{u.joined}</td>
                      <td>{u.courses}</td>
                      <td>
                        <div className="row" style={{gap: 4}}>
                          <button className="btn ghost sm">View</button>
                          <button className="btn ghost sm">{Ic.more}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{padding: '12px 18px', borderTop: '1px solid var(--hair)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <span className="card-sub">Showing 1–8 of 48,210</span>
                <div className="row" style={{gap: 6}}>
                  <button className="btn ghost sm">{Ic.arrowL}</button>
                  <span className="chip accent">1</span>
                  <span className="chip">2</span>
                  <span className="chip">3</span>
                  <span className="tag">…</span>
                  <span className="chip">6,026</span>
                  <button className="btn ghost sm">{Ic.arrowR}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AdminOverview, CourseApprovals, UserManagement });
