import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import { usePayments } from "./PaymentContext.jsx";
import { openRazorpayCheckout } from "./api/razorpayService";
import { assignMembership } from "./api/coreService";
import api from "./api/axios";

// ── UserPayment ───────────────────────────────────────────────────────────────
export function UserPayment() {
  const { addPayment } = usePayments();
  const navigate = useNavigate();
  const location = useLocation();

  const pendingPlan = location.state?.membershipPlan || (() => {
    try { return JSON.parse(localStorage.getItem("pendingMembershipPlan") || "null"); }
    catch { return null; }
  })();

  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState("");

  const memberId = localStorage.getItem("id") || localStorage.getItem("memberId");
  const name     = localStorage.getItem("name") || "Member";
  const email    = localStorage.getItem("email") || "";
  const phone    = localStorage.getItem("phone") || "";

  const handlePay = async () => {
    if (!pendingPlan) { setMessage("No plan selected."); setStatus("error"); return; }
    if (!memberId)    { setMessage("Please log in again."); setStatus("error"); return; }

    setStatus("loading");
    setMessage("");

    try {
      // 1. Get a batch to assign
      let batchId = null;
      try {
        const batchRes = await api.get("/api/batches");
        const batches = Array.isArray(batchRes.data) ? batchRes.data : [];
        batchId = batches.find(b => b.isActive)?.id || batches[0]?.id || null;
      } catch { /* proceed without batch */ }

      // 2. Assign membership → get orderNumber
      const assignRes = await assignMembership({
        memberId: Number(memberId),
        planId:   pendingPlan.id,
        ...(batchId && { batchId }),
      });
      const { orderNumber, planPrice, planName } = assignRes.data;
      const amount = Number(planPrice || pendingPlan.price);

      // 3. Open Razorpay checkout
      openRazorpayCheckout({
        amount,
        orderNumber,
        name,
        email,
        phone,
        description: planName || pendingPlan.name,
        onSuccess: () => {
          addPayment({ amount, method: "Razorpay", member: name });
          localStorage.removeItem("pendingMembershipPlan");
          setStatus("success");
          setMessage(`Payment of ₹${amount.toLocaleString("en-IN")} successful! Membership activated.`);
          setTimeout(() => navigate("/member-dashboard"), 2500);
        },
        onFailure: (msg) => {
          setStatus("error");
          setMessage(msg || "Payment failed. Please try again.");
        },
      });
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.message || "Failed to initiate payment.");
    }
  };

  return (
    <div className="page-view">
      <h2>Membership Payment</h2>

      {pendingPlan && (
        <div style={{ background:"linear-gradient(135deg,#3e0994,#8e2bbd)", color:"#fff",
                      padding:"1.25rem 1.5rem", borderRadius:12, marginBottom:"1.5rem" }}>
          <div style={{ fontSize:"0.82rem", opacity:0.8 }}>Selected Plan</div>
          <div style={{ fontSize:"1.2rem", fontWeight:700 }}>{pendingPlan.name}</div>
          <div style={{ fontSize:"1rem", marginTop:4 }}>
            ₹{Number(pendingPlan.price).toLocaleString("en-IN")}
            {pendingPlan.durationMonths && ` · ${pendingPlan.durationMonths} month${pendingPlan.durationMonths > 1 ? "s" : ""}`}
          </div>
        </div>
      )}

      {status === "success" && (
        <div style={{ background:"#dcfce7", color:"#166534", padding:"1rem", borderRadius:8, marginBottom:"1rem", fontWeight:600 }}>
          ✅ {message}
        </div>
      )}
      {status === "error" && (
        <div style={{ background:"#fee2e2", color:"#b91c1c", padding:"1rem", borderRadius:8, marginBottom:"1rem", fontWeight:600 }}>
          ❌ {message}
        </div>
      )}

      <div style={{ maxWidth:420, margin:"0 auto" }}>
        <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:12, padding:"1.5rem", marginBottom:"1.5rem" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.75rem" }}>
            <span style={{ color:"#64748b" }}>Plan</span>
            <strong>{pendingPlan?.name || "—"}</strong>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.75rem" }}>
            <span style={{ color:"#64748b" }}>Amount</span>
            <strong style={{ color:"#3e0994", fontSize:"1.1rem" }}>
              ₹{pendingPlan ? Number(pendingPlan.price).toLocaleString("en-IN") : "—"}
            </strong>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <span style={{ color:"#64748b" }}>Payment via</span>
            <strong>Razorpay (UPI / Card / NetBanking)</strong>
          </div>
        </div>

        <button
          onClick={handlePay}
          disabled={!pendingPlan || status === "loading" || status === "success"}
          style={{ width:"100%", padding:"1rem", background:"linear-gradient(135deg,#3e0994,#8e2bbd)",
                   color:"#fff", border:"none", borderRadius:10, fontSize:"1rem",
                   fontWeight:700, cursor:"pointer", opacity: (!pendingPlan || status === "loading") ? 0.7 : 1 }}
        >
          {status === "loading" ? "⏳ Opening Payment..." : "💳 Pay with Razorpay"}
        </button>

        <p style={{ textAlign:"center", color:"#94a3b8", fontSize:"0.8rem", marginTop:"0.75rem" }}>
          🔒 Secured by Razorpay · UPI · Cards · NetBanking · Wallets
        </p>

        {!pendingPlan && (
          <button onClick={() => navigate(-1)}
            style={{ width:"100%", marginTop:"0.75rem", padding:"0.75rem", background:"transparent",
                     border:"1px solid #d1d5db", borderRadius:10, cursor:"pointer", color:"#64748b" }}>
            ← Go Back to Plans
          </button>
        )}
      </div>
    </div>
  );
}

// ── AdminPayments (unchanged) ─────────────────────────────────────────────────
export function AdminPayments() {
  const { payments, deletePayment } = usePayments();
  const [sortBy, setSortBy] = useState("date");
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const filteredPayments = payments
    .filter(p => {
      if (filterStatus !== "All" && p.status !== filterStatus) return false;
      if (searchTerm && !p.member.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (dateRange.start && p.date < dateRange.start) return false;
      if (dateRange.end && p.date > dateRange.end) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "date")   return new Date(b.date) - new Date(a.date);
      if (sortBy === "name")   return a.member.localeCompare(b.member);
      if (sortBy === "amount") return b.amount - a.amount;
      if (sortBy === "status") return a.status.localeCompare(b.status);
      return a.id - b.id;
    });

  const totalRevenue = filteredPayments.filter(p => p.status === "Completed").reduce((s, p) => s + p.amount, 0);

  return (
    <div className="page-view">
      <h2>Payment Management</h2>
      <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginBottom:16, background:"#f8f8ff", padding:"14px 18px", borderRadius:12, border:"1px solid #e8e8f0" }}>
        <input placeholder="Search member…" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}
          style={{ flex:"1 1 160px", padding:"8px 12px", borderRadius:8, border:"1px solid #ddd", fontSize:"0.88rem" }} />
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}
          style={{ flex:"1 1 130px", padding:"8px 12px", borderRadius:8, border:"1px solid #ddd", fontSize:"0.88rem" }}>
          <option value="All">All Status</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
        </select>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
          style={{ flex:"1 1 140px", padding:"8px 12px", borderRadius:8, border:"1px solid #ddd", fontSize:"0.88rem" }}>
          <option value="date">Date (Newest)</option>
          <option value="name">Name (A-Z)</option>
          <option value="amount">Amount (High-Low)</option>
          <option value="status">Status</option>
        </select>
        <input type="date" value={dateRange.start} onChange={e=>setDateRange(r=>({...r,start:e.target.value}))}
          style={{ flex:"1 1 130px", padding:"8px 12px", borderRadius:8, border:"1px solid #ddd", fontSize:"0.88rem" }} />
        <input type="date" value={dateRange.end} onChange={e=>setDateRange(r=>({...r,end:e.target.value}))}
          style={{ flex:"1 1 130px", padding:"8px 12px", borderRadius:8, border:"1px solid #ddd", fontSize:"0.88rem" }} />
        <button onClick={()=>{setSearchTerm("");setFilterStatus("All");setSortBy("date");setDateRange({start:"",end:""});}}
          style={{ padding:"8px 18px", background:"#ef4444", color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600 }}>
          Clear
        </button>
      </div>

      <div style={{ display:"flex", gap:"1rem", marginBottom:"1.5rem", flexWrap:"wrap" }}>
        <div style={{ flex:"1 1 180px", background:"linear-gradient(135deg,#667eea,#764ba2)", padding:"1rem 1.5rem", borderRadius:12, color:"#fff" }}>
          <p style={{ fontSize:"0.8rem", margin:0, opacity:0.85 }}>Total Revenue</p>
          <h3 style={{ fontSize:"1.6rem", margin:"2px 0 0" }}>₹{totalRevenue.toLocaleString()}</h3>
        </div>
        <div style={{ flex:"1 1 180px", background:"linear-gradient(135deg,#1d4ed8,#7c3aed)", padding:"1rem 1.5rem", borderRadius:12, color:"#fff" }}>
          <p style={{ fontSize:"0.8rem", margin:0, opacity:0.85 }}>Showing Results</p>
          <h3 style={{ fontSize:"1.6rem", margin:"2px 0 0" }}>{filteredPayments.length}</h3>
        </div>
      </div>

      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", background:"#fff", borderRadius:8, overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.1)" }}>
          <thead>
            <tr style={{ background:"#f5f5f5" }}>
              {["ID","Member","Amount","Date","Method","Status","Action"].map(h=>(
                <th key={h} style={{ padding:"1rem", textAlign:"left", whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length > 0 ? filteredPayments.map(p=>(
              <tr key={p.id} style={{ borderBottom:"1px solid #f0f0f0" }}>
                <td style={{ padding:"1rem" }}>#{p.id}</td>
                <td style={{ padding:"1rem" }}>{p.member}</td>
                <td style={{ padding:"1rem", fontWeight:"bold" }}>₹{p.amount}</td>
                <td style={{ padding:"1rem" }}>{p.date}</td>
                <td style={{ padding:"1rem" }}>{p.method}</td>
                <td style={{ padding:"1rem" }}>
                  <span style={{ padding:"0.25rem 0.75rem", borderRadius:12, fontSize:"0.85rem",
                    background: p.status==="Completed"?"#e8f5e9":p.status==="Pending"?"#fff3e0":"#ffebee",
                    color:      p.status==="Completed"?"#2e7d32":p.status==="Pending"?"#f57c00":"#c62828" }}>
                    {p.status}
                  </span>
                </td>
                <td style={{ padding:"1rem" }}>
                  <button onClick={()=>{ if(window.confirm(`Delete payment from ${p.member}?`)) deletePayment(p.id); }}
                    style={{ padding:"0.5rem 1rem", background:"#ef4444", color:"#fff", border:"none", borderRadius:6, cursor:"pointer", fontSize:"0.85rem" }}>
                    🗑
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={7} style={{ padding:"2rem", textAlign:"center", color:"#999" }}>No payments found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
