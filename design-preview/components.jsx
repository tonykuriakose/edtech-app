// Cognify shared components

const Ic = {
  search: <svg className="ic" viewBox="0 0 24 24" width="14" height="14"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>,
  home: <svg className="ic" viewBox="0 0 24 24"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></svg>,
  book: <svg className="ic" viewBox="0 0 24 24"><path d="M4 4h10a4 4 0 014 4v12H8a4 4 0 01-4-4V4z"/><path d="M4 16a4 4 0 014-4h10"/></svg>,
  mortar: <svg className="ic" viewBox="0 0 24 24"><path d="M2 9l10-4 10 4-10 4-10-4z"/><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/></svg>,
  chart: <svg className="ic" viewBox="0 0 24 24"><path d="M4 20V8"/><path d="M10 20V4"/><path d="M16 20v-9"/><path d="M22 20H2"/></svg>,
  spark: <svg className="ic" viewBox="0 0 24 24"><path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z"/></svg>,
  pen: <svg className="ic" viewBox="0 0 24 24"><path d="M4 20l4-1L20 7l-3-3L5 16l-1 4z"/></svg>,
  shield: <svg className="ic" viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3z"/></svg>,
  users: <svg className="ic" viewBox="0 0 24 24"><circle cx="9" cy="9" r="3.5"/><path d="M2 20c0-3 3-5 7-5s7 2 7 5"/><circle cx="17" cy="8" r="2.5"/><path d="M16 14c3 .3 5 2 5 5"/></svg>,
  flame: <svg className="ic" viewBox="0 0 24 24"><path d="M12 3c1 4 5 5 5 10a5 5 0 11-10 0c0-3 2-4 2-7 2 1 3 0 3-3z"/></svg>,
  clock: <svg className="ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
  check: <svg className="ic" viewBox="0 0 24 24"><path d="M4 12l5 5 11-12"/></svg>,
  x: <svg className="ic" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>,
  arrowR: <svg className="ic" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
  arrowL: <svg className="ic" viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>,
  send: <svg className="ic" viewBox="0 0 24 24"><path d="M4 12l16-8-6 18-3-7-7-3z"/></svg>,
  bell: <svg className="ic" viewBox="0 0 24 24"><path d="M6 9a6 6 0 0112 0v4l2 3H4l2-3V9z"/><path d="M10 19a2 2 0 004 0"/></svg>,
  filter: <svg className="ic" viewBox="0 0 24 24"><path d="M3 5h18M6 12h12M10 19h4"/></svg>,
  play: <svg className="ic" viewBox="0 0 24 24"><path d="M7 5l12 7-12 7V5z" fill="currentColor"/></svg>,
  plus: <svg className="ic" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>,
  more: <svg className="ic" viewBox="0 0 24 24"><circle cx="6" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="18" cy="12" r="1.2" fill="currentColor"/></svg>,
  copy: <svg className="ic" viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2"/></svg>,
  video: <svg className="ic" viewBox="0 0 24 24"><rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10l6-3v10l-6-3z"/></svg>,
  globe: <svg className="ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>,
  bolt: <svg className="ic" viewBox="0 0 24 24"><path d="M13 3L4 14h6l-1 7 9-11h-6l1-7z"/></svg>,
  target: <svg className="ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>,
  inbox: <svg className="ic" viewBox="0 0 24 24"><path d="M3 13l3-8h12l3 8M3 13v6h18v-6M3 13h5l1 2h6l1-2h5"/></svg>,
};

function Brand() {
  return (
    <div className="brand">
      <div className="brand-mark">c</div>
      <div className="brand-name">Cognify</div>
    </div>
  );
}

function NavItem({ icon, label, active, badge }) {
  return (
    <div className={"nav-item" + (active ? " active" : "")}>
      <span className="ico">{icon}</span>
      <span>{label}</span>
      {badge && <span className="nav-badge">{badge}</span>}
    </div>
  );
}

function Sidebar({ role = "student", active }) {
  const studentNav = [
    { id: "dashboard", label: "Home", icon: Ic.home },
    { id: "catalog", label: "Browse courses", icon: Ic.globe },
    { id: "my-courses", label: "My courses", icon: Ic.book, badge: "4" },
    { id: "progress", label: "Progress", icon: Ic.chart },
    { id: "tutor", label: "AI Tutor", icon: Ic.spark },
  ];
  const teacherNav = [
    { id: "teach", label: "Teaching home", icon: Ic.home },
    { id: "courses", label: "My courses", icon: Ic.book, badge: "7" },
    { id: "wizard", label: "New course", icon: Ic.plus },
    { id: "analytics", label: "Analytics", icon: Ic.chart },
    { id: "tutor", label: "AI Tutor", icon: Ic.spark },
  ];
  const adminNav = [
    { id: "admin", label: "Overview", icon: Ic.home },
    { id: "approvals", label: "Approvals", icon: Ic.inbox, badge: "12" },
    { id: "users", label: "Users", icon: Ic.users },
    { id: "stats", label: "Platform stats", icon: Ic.chart },
  ];
  const items = role === "teacher" ? teacherNav : role === "admin" ? adminNav : studentNav;
  const user = role === "teacher"
    ? { name: "Naomi Okafor", role: "Teacher", initials: "NO" }
    : role === "admin"
    ? { name: "Admin · Priya R.", role: "Administrator", initials: "PR" }
    : { name: "Lena Park", role: "Student · Year 2", initials: "LP" };

  return (
    <div className="sidebar">
      <Brand />
      <div className="nav-section">{role === "teacher" ? "Teach" : role === "admin" ? "Admin" : "Learn"}</div>
      {items.map((it) => <NavItem key={it.id} {...it} active={active === it.id} />)}
      <div className="nav-section">Account</div>
      <NavItem icon={Ic.bell} label="Notifications" badge="3" />
      <NavItem icon={Ic.shield} label="Settings" />
      <div className="user-card">
        <div className="avatar">{user.initials}</div>
        <div style={{minWidth: 0}}>
          <div className="user-name">{user.name}</div>
          <div className="user-role">{user.role}</div>
        </div>
      </div>
    </div>
  );
}

function Topbar({ search = "Search lessons, courses, topics…", right }) {
  return (
    <div className="topbar">
      <div className="search">
        {Ic.search}
        <span>{search}</span>
        <span className="kbd">⌘K</span>
      </div>
      <div className="top-actions">
        {right || <>
          <span className="streak-pill">{Ic.flame} 12-day streak</span>
          <span style={{display: 'grid', placeItems: 'center', width: 28, height: 28}}>{Ic.bell}</span>
        </>}
      </div>
    </div>
  );
}

function Stat({ num, label, delta, deltaDir, sub }) {
  return (
    <div className="card card-pad">
      <div className="stat-num">{num}</div>
      <div className="stat-label">{label}</div>
      {delta && <div className={"stat-delta" + (deltaDir === "down" ? " down" : "")}>{delta}</div>}
      {sub && <div className="stat-label" style={{marginTop: 8}}>{sub}</div>}
    </div>
  );
}

function ProgressRing({ value = 0, size = 64, stroke = 6, label }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <div style={{position: 'relative', width: size, height: size}}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} className="ring-bg" strokeWidth={stroke} fill="none" />
        <circle cx={size/2} cy={size/2} r={r} className="ring-fg" strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`} />
      </svg>
      <div style={{position:'absolute', inset:0, display:'grid', placeItems:'center', fontFamily:'var(--serif)', fontSize: size*0.28, letterSpacing:'-0.02em'}}>{label ?? `${value}%`}</div>
    </div>
  );
}

function CourseThumb({ hue = 30, label = "Course art", h = 120 }) {
  const bg = `oklch(0.85 0.06 ${hue})`;
  const bg2 = `oklch(0.74 0.10 ${hue})`;
  return (
    <div style={{
      height: h, borderRadius: 10,
      background: `linear-gradient(135deg, ${bg}, ${bg2})`,
      position:'relative', overflow:'hidden',
      border: '1px solid var(--hair)'
    }}>
      <svg width="100%" height="100%" style={{position:'absolute', inset:0, opacity: 0.35}}>
        <defs>
          <pattern id={"p"+hue} width="14" height="14" patternUnits="userSpaceOnUse">
            <path d="M0 14L14 0" stroke="rgba(255,255,255,.7)" strokeWidth="0.8"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={"url(#p"+hue+")"} />
      </svg>
      <div style={{position:'absolute', left: 12, bottom: 10, fontFamily:'var(--serif)', fontSize: 13, color:'rgba(31,29,26,.7)', letterSpacing:'-0.01em'}}>
        {label}
      </div>
    </div>
  );
}

Object.assign(window, { Ic, Brand, NavItem, Sidebar, Topbar, Stat, ProgressRing, CourseThumb });
