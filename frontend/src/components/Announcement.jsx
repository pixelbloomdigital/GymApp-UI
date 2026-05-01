import { useState, useEffect } from "react";
import { getActiveAnnouncements, createAnnouncement, deleteAnnouncement as deleteAnnouncementApi } from "../api/announcementService";
import "./Announcement.css";

export default function Announcement() {
  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm]           = useState(false);
  const [loading, setLoading]             = useState(false);
  const [form, setForm] = useState({ title:"Gym Announcement", message:"", date:"", type:"GENERAL", targetAudience:"ALL" });

  useEffect(() => {
    getActiveAnnouncements().then(r => setAnnouncements(r.data || [])).catch(console.error);
  }, []);

  const handlePublish = async () => {
    if (!form.message.trim()) { alert("Please enter announcement text"); return; }
    setLoading(true);
    try {
      const creatorId = Number(localStorage.getItem("id") || localStorage.getItem("memberId") || 0);
      const expiresAtValue = form.date
        ? new Date(`${form.date}T23:59:59`).toISOString()
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data } = await createAnnouncement({
        title: form.title,
        message: form.message,
        type: form.type,
        targetAudience: form.targetAudience,
        createdBy: creatorId,
        expiresAt: expiresAtValue,
      });

      setAnnouncements(prev => [data, ...prev]);
      setForm({ title:"Gym Announcement", message:"", date:"", type:"GENERAL", targetAudience:"ALL" });
      setShowForm(false);
    } catch (e) { alert(e.response?.data?.message || "Failed to publish"); }
    finally { setLoading(false); }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Remove this announcement?")) return;
    try { await deleteAnnouncementApi(id); setAnnouncements(prev => prev.filter(a => a.id !== id)); }
    catch { alert("Failed to remove"); }
  };

  return (
    <div className="announcement-page" style={{ padding:0 }}>
      <div className="announcement-actions" style={{ marginBottom:"1rem" }}>
        <button className="manage-announcement-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New Announcement"}
        </button>
      </div>

      {showForm && (
        <div className="announcement-form-card">
          <h3><i className="fas fa-plus-circle" /> Make Announcement</h3>
          <div className="form-group">
            <label>Title</label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({...f, title:e.target.value}))} style={{ width:"100%", padding:"0.6rem", borderRadius:6, border:"1px solid #d1d5db" }} />
          </div>
          <div className="form-group">
            <label>Message *</label>
            <textarea placeholder="Enter announcement text..." value={form.message}
              onChange={e => setForm(f => ({...f, message:e.target.value}))} rows="5" />
          </div>
          <div className="form-group" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
            <div>
              <label>Type</label>
              <select value={form.type} onChange={e => setForm(f => ({...f, type:e.target.value}))} style={{ width:"100%", padding:"0.6rem", borderRadius:6, border:"1px solid #d1d5db" }}>
                {["GENERAL","EVENT","OFFER","DISCOUNT"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label>Target Audience</label>
              <select value={form.targetAudience} onChange={e => setForm(f => ({...f, targetAudience:e.target.value}))} style={{ width:"100%", padding:"0.6rem", borderRadius:6, border:"1px solid #d1d5db" }}>
                {["ALL","MEMBERS","TRAINERS","ADMINS"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Expires At (optional)</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({...f, date:e.target.value}))} />
          </div>
          <button className="publish-btn" onClick={handlePublish} disabled={loading}>
            {loading ? "Publishing…" : "Publish Now"}
          </button>
        </div>
      )}

      <div className="announcement-table-card">
        <h3><i className="fas fa-list" /> Announcements ({announcements.length})</h3>
        <table className="announcement-table">
          <thead>
            <tr><th>#</th><th>Title</th><th>Message</th><th>Type</th><th>Target</th><th>Expires</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {announcements.map((a, i) => (
              <tr key={a.id}>
                <td>{i + 1}</td>
                <td><strong>{a.title}</strong></td>
                <td className="message-cell">{a.message}</td>
                <td><span style={{ padding:"0.2rem 0.6rem", borderRadius:12, background:"#ede9fe", color:"#6d28d9", fontSize:"0.78rem" }}>{a.type}</span></td>
                <td><span style={{ padding:"0.2rem 0.6rem", borderRadius:12, background:"#dbeafe", color:"#1d4ed8", fontSize:"0.78rem" }}>{a.targetAudience}</span></td>
                <td>{a.expiresAt ? new Date(a.expiresAt).toLocaleDateString() : "—"}</td>
                <td>
                  <span className={`status-toggle ${a.isActive ? "published" : "draft"}`}>
                    {a.isActive ? <><i className="fas fa-check-circle" /> Active</> : <><i className="fas fa-clock" /> Inactive</>}
                  </span>
                </td>
                <td>
                  <button className="remove-btn" onClick={() => handleRemove(a.id)}>
                    <i className="fas fa-trash" /> Remove
                  </button>
                </td>
              </tr>
            ))}
            {announcements.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign:"center", color:"#94a3b8", padding:"2rem" }}>No announcements yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
