import { useNavigate, useLocation } from "react-router-dom";

const sidebarStyles = {
  sidebar: { width:260, background:"linear-gradient(180deg, #111827 0%, #1e2537 100%)", display:"flex", flexDirection:"column", position:"fixed", top:0, left:0, height:"100vh", zIndex:100, borderRight:"1px solid rgba(59,130,246,0.25)", boxShadow:"4px 0 24px rgba(59,130,246,0.18)" },
  sidebarTop: { padding:"1.75rem 1.25rem 1.25rem", borderBottom:"1px solid rgba(59,130,246,0.2)" },
  avatar: { width:48, height:48, borderRadius:"50%", background:"linear-gradient(135deg,#3b82f6,#1e40af)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.4rem", flexShrink:0, border:"2px solid #3b82f6", boxShadow:"0 0 14px rgba(59,130,246,0.5)" },
  nav: { padding:"1.25rem 0.75rem", display:"flex", flexDirection:"column", gap:4, flex:1, overflowY:"auto" },
  navBtn: { display:"flex", alignItems:"center", gap:"0.75rem", padding:"0.75rem 1rem", background:"transparent", border:"none", color:"#94a3b8", fontSize:"0.9rem", fontFamily:"'Poppins',sans-serif", fontWeight:500, cursor:"pointer", borderRadius:8, textAlign:"left", transition:"all 0.2s", width:"100%" },
  navBtnActive: { background:"rgba(59,130,246,0.18)", color:"#93c5fd", borderLeft:"3px solid #3b82f6" },
  navBtnDanger: { color:"#f87171" },
  logoutBtn: { margin:"0 0.75rem 1.25rem", padding:"0.65rem 1rem", background:"rgba(59,130,246,0.12)", border:"1px solid rgba(59,130,246,0.3)", borderRadius:8, color:"#c4b5fd", fontFamily:"'Poppins',sans-serif", fontWeight:600, fontSize:"0.85rem", cursor:"pointer" },
};

const TABS = [
  { id:"home",       label:"Dashboard",       icon:"📊" },
  { id:"profile",    label:"Edit Profile",    icon:"✏️" },
  { id:"membership", label:"Membership",      icon:"💳" },
  { id:"payment",    label:"Payment",         icon:"💰" },
  { id:"attendance", label:"Attendance",      icon:"📅" },
  { id:"reports",    label:"My Reports",      icon:"📈" },
  { id:"diet",       label:"Diet Plan",       icon:"🥗" },
  { id:"events",     label:"Events",          icon:"🎉" },
  { id:"costumes",   label:"Costume Rental",  icon:"👗" },
  { id:"announcements", label:"Announcements", icon:"📢" },
];

export default function MemberSidebar({ memberProfile, activeTab, onNavigate, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentTab = activeTab || (location.pathname.includes("/edit-profile") ? "profile" : "home");

  const handleNavigate = (tabId) => {
    if (onNavigate) {
      onNavigate(tabId);
      return;
    }

    const target = tabId === "home"
      ? "/member-dashboard"
      : tabId === "profile"
        ? `/edit-profile/${localStorage.getItem("memberId") || ""}`
        : `/member-dashboard/${tabId}`;
    navigate(target, { replace: true });
  };

  return (
    <aside className="md-sidebar" style={sidebarStyles.sidebar}>
      <div style={sidebarStyles.sidebarTop}>
        <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", background:"rgba(59,130,246,0.12)", padding:"0.85rem 1rem", borderRadius:10, border:"1px solid rgba(59,130,246,0.3)" }}>
          <div style={sidebarStyles.avatar}>👤</div>
          <div style={{ flex:1, overflow:"hidden" }}>
            <p style={{ margin:0, fontSize:"0.95rem", fontWeight:700, color:"#fff", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
              {memberProfile?.name || "Member"}
            </p>
            <p style={{ margin:"2px 0 0", fontSize:"0.72rem", color:"#98cfff", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
              {memberProfile?.email || ""}
            </p>
          </div>
        </div>
      </div>

      <nav style={sidebarStyles.nav}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            className="md-nav-btn"
            style={{ ...sidebarStyles.navBtn, ...(currentTab === tab.id ? sidebarStyles.navBtnActive : {}) }}
            onClick={() => handleNavigate(tab.id)}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <button style={sidebarStyles.logoutBtn} onClick={onLogout || (() => navigate("/"))}>🚪 Logout</button>
    </aside>
  );
}
