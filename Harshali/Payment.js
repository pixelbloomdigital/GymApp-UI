import { useState } from "react";
import "./App.css";
import { usePayments } from "./PaymentContext";
import { useProfile } from "./ProfileContext";

const generateReceipt = (paymentData, userName) => {
  const receiptContent = `
    POWER ZONE GYM
    Payment Receipt
    =====================================
    
    Receipt #: ${Date.now()}
    Date: ${new Date().toLocaleDateString()}
    Time: ${new Date().toLocaleTimeString()}
    
    -------------------------------------
    Payment Details:
    -------------------------------------
    Amount: ₹${paymentData.amount}
    Method: ${paymentData.method.toUpperCase()}
    Status: SUCCESS
    
    -------------------------------------
    Member Information:
    -------------------------------------
    Name: ${userName}
    Membership: Active
    
    =====================================
    Thank you for your payment!
    =====================================
  `;
  
  const blob = new Blob([receiptContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `receipt_${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};

export function UserPayment() {
  const { addPayment } = usePayments();
  const { profile } = useProfile();
  const [paymentData, setPaymentData] = useState({
    amount: "",
    method: "card",
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: ""
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  const MIN_AMOUNT = 100;
  const MAX_AMOUNT = 100000;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const amount = parseFloat(paymentData.amount);
    
    if (amount < MIN_AMOUNT) {
      setError(`Minimum payment amount is ₹${MIN_AMOUNT}`);
      return;
    }
    
    if (amount > MAX_AMOUNT) {
      setError(`Maximum payment amount is ₹${MAX_AMOUNT.toLocaleString()}`);
      return;
    }

    if (paymentData.method === "card") {
      if (paymentData.cardNumber.replace(/\s/g, "").length !== 16) {
        setError("Card number must be 16 digits");
        return;
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentData.expiry)) {
        setError("Invalid expiry date format (MM/YY)");
        return;
      }
      if (paymentData.cvv.length !== 3) {
        setError("CVV must be 3 digits");
        return;
      }
    }

    generateReceipt(paymentData, profile.name);
    addPayment(paymentData, profile.name);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setPaymentData({
        amount: "",
        method: "card",
        cardNumber: "",
        cardName: "",
        expiry: "",
        cvv: ""
      });
    }, 3000);
  };

  return (
    <div className="page-view">
      <h2>Make Payment</h2>
      
      {showSuccess && (
        <div style={{
          background: "#4caf50",
          color: "white",
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "1rem",
          textAlign: "center"
        }}>
          <i className="fas fa-check-circle"></i> Payment Successful!
        </div>
      )}

      {error && (
        <div style={{
          background: "#f44336",
          color: "white",
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "1rem",
          textAlign: "center"
        }}>
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      <div style={{ maxWidth: "500px", margin: "2rem auto" }}>
        <div style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "1.5rem",
          borderRadius: "12px",
          color: "white",
          marginBottom: "2rem"
        }}>
          <p style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>Current Balance</p>
          <h2 style={{ fontSize: "2rem", margin: 0 }}>₹0</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Amount</label>
            <input
              type="number"
              value={paymentData.amount}
              onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
              placeholder="Enter amount"
              min={MIN_AMOUNT}
              max={MAX_AMOUNT}
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid #ddd"
              }}
            />
            <small style={{ color: "#666", fontSize: "0.85rem" }}>
              Min: ₹{MIN_AMOUNT} | Max: ₹{MAX_AMOUNT.toLocaleString()}
            </small>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Payment Method</label>
            <select
              value={paymentData.method}
              onChange={(e) => setPaymentData({...paymentData, method: e.target.value})}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid #ddd"
              }}
            >
              <option value="card">Credit/Debit Card</option>
              <option value="upi">UPI</option>
              <option value="netbanking">Net Banking</option>
            </select>
          </div>

          {paymentData.method === "card" && (
            <>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>Card Number</label>
                <input
                  type="text"
                  value={paymentData.cardNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 16);
                    setPaymentData({...paymentData, cardNumber: value});
                  }}
                  placeholder="1234 5678 9012 3456"
                  required
                  maxLength="16"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid #ddd"
                  }}
                />
                <small style={{ color: "#666", fontSize: "0.85rem" }}>16 digits</small>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>Cardholder Name</label>
                <input
                  type="text"
                  value={paymentData.cardName}
                  onChange={(e) => setPaymentData({...paymentData, cardName: e.target.value})}
                  placeholder="John Doe"
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid #ddd"
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: "0.5rem" }}>Expiry</label>
                  <input
                    type="text"
                    value={paymentData.expiry}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, "");
                      if (value.length >= 2) {
                        value = value.slice(0, 2) + "/" + value.slice(2, 4);
                      }
                      setPaymentData({...paymentData, expiry: value});
                    }}
                    placeholder="MM/YY"
                    required
                    maxLength="5"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #ddd"
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: "0.5rem" }}>CVV</label>
                  <input
                    type="text"
                    value={paymentData.cvv}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 3);
                      setPaymentData({...paymentData, cvv: value});
                    }}
                    placeholder="123"
                    required
                    maxLength="3"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #ddd"
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {paymentData.method === "upi" && (
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>UPI ID</label>
              <input
                type="text"
                placeholder="yourname@upi"
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid #ddd"
                }}
              />
            </div>
          )}

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "1rem",
              background: "#3e0994",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            <i className="fas fa-lock"></i> Pay Now
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminPayments() {
  const { payments, deletePayment } = usePayments();
  const [sortBy, setSortBy] = useState("date");
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const filteredPayments = payments
    .filter(payment => {
      if (filterStatus !== "All" && payment.status !== filterStatus) return false;
      if (searchTerm && !payment.member.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (dateRange.start && payment.date < dateRange.start) return false;
      if (dateRange.end && payment.date > dateRange.end) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "id":
          return a.id - b.id;
        case "date":
          return new Date(b.date) - new Date(a.date);
        case "name":
          return a.member.localeCompare(b.member);
        case "amount":
          return b.amount - a.amount;
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const downloadReceipt = (payment) => {
    const receiptContent = `
    POWER ZONE GYM
    Payment Receipt
    =====================================
    
    Receipt #: ${payment.id}
    Date: ${payment.date}
    
    -------------------------------------
    Payment Details:
    -------------------------------------
    Amount: ₹${payment.amount}
    Method: ${payment.method}
    Status: ${payment.status}
    
    -------------------------------------
    Member Information:
    -------------------------------------
    Name: ${payment.member}
    
    =====================================
    Thank you for your payment!
    =====================================
    `;
    
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${payment.id}_${payment.member.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalRevenue = filteredPayments
    .filter(p => p.status === "Completed")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="page-view">
      <h2>Payment Management</h2>
      
      <div style={{ background: "#f8f8ff", padding: "16px 20px", borderRadius: "12px", marginBottom: "20px", border: "1px solid #e8e8f0" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 160px" }}>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: "600", fontSize: "0.8rem", color: "#3e0994" }}>Search Member</label>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "0.88rem", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ flex: "1 1 130px" }}>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: "600", fontSize: "0.8rem", color: "#3e0994" }}>Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "0.88rem", boxSizing: "border-box" }}>
              <option value="All">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
          <div style={{ flex: "1 1 140px" }}>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: "600", fontSize: "0.8rem", color: "#3e0994" }}>Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "0.88rem", boxSizing: "border-box" }}>
              <option value="date">Date (Newest)</option>
              <option value="name">Name (A-Z)</option>
              <option value="amount">Amount (High-Low)</option>
              <option value="status">Status</option>
            </select>
          </div>
          <div style={{ flex: "1 1 130px" }}>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: "600", fontSize: "0.8rem", color: "#3e0994" }}>From Date</label>
            <input type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "0.88rem", boxSizing: "border-box" }} />
          </div>
          <div style={{ flex: "1 1 130px" }}>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: "600", fontSize: "0.8rem", color: "#3e0994" }}>To Date</label>
            <input type="date" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "0.88rem", boxSizing: "border-box" }} />
          </div>
          <div style={{ flex: "0 0 auto" }}>
            <button
              onClick={() => { setSearchTerm(""); setFilterStatus("All"); setSortBy("date"); setDateRange({ start: "", end: "" }); }}
              style={{ padding: "8px 18px", background: "#ef4444", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "0.88rem", whiteSpace: "nowrap" }}
            >
              <i className="fas fa-times" style={{ marginRight: "6px" }}></i>Clear
            </button>
          </div>
        </div>
      </div>
      
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <div style={{
          flex: "1 1 180px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "1rem 1.5rem",
          borderRadius: "12px",
          color: "white",
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div>
            <p style={{ fontSize: "0.8rem", margin: 0, opacity: 0.85 }}>Total Revenue</p>
            <h3 style={{ fontSize: "1.6rem", margin: "2px 0 0" }}>₹{totalRevenue.toLocaleString()}</h3>
          </div>
          <i className="fas fa-indian-rupee-sign" style={{ fontSize: "1.8rem", opacity: 0.4 }}></i>
        </div>
        <div style={{
          flex: "1 1 180px",
          background: "linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)",
          padding: "1rem 1.5rem",
          borderRadius: "12px",
          color: "white",
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div>
            <p style={{ fontSize: "0.8rem", margin: 0, opacity: 0.85 }}>Showing Results</p>
            <h3 style={{ fontSize: "1.6rem", margin: "2px 0 0" }}>{filteredPayments.length}</h3>
          </div>
          <i className="fas fa-list" style={{ fontSize: "1.8rem", opacity: 0.4 }}></i>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "white",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={{ padding: "1rem", textAlign: "left", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }} onClick={() => setSortBy("id")}>
                ID <span style={{ fontSize: "0.8rem" }}>{sortBy === "id" && "↓"}</span>
              </th>
              <th style={{ padding: "1rem", textAlign: "left", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }} onClick={() => setSortBy("name")}>
                Member <span style={{ fontSize: "0.8rem" }}>{sortBy === "name" && "↓"}</span>
              </th>
              <th style={{ padding: "1rem", textAlign: "left", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }} onClick={() => setSortBy("amount")}>
                Amount <span style={{ fontSize: "0.8rem" }}>{sortBy === "amount" && "↓"}</span>
              </th>
              <th style={{ padding: "1rem", textAlign: "left", whiteSpace: "nowrap" }}>Date</th>
              <th style={{ padding: "1rem", textAlign: "left", whiteSpace: "nowrap" }}>Time</th>
              <th style={{ padding: "1rem", textAlign: "left", whiteSpace: "nowrap" }}>Method</th>
              <th style={{ padding: "1rem", textAlign: "left", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }} onClick={() => setSortBy("status")}>
                Status <span style={{ fontSize: "0.8rem" }}>{sortBy === "status" && "↓"}</span>
              </th>
              <th style={{ padding: "1rem", textAlign: "left", whiteSpace: "nowrap" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length > 0 ? filteredPayments.map((payment) => (
              <tr key={payment.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "1rem" }}>#{payment.id}</td>
                <td style={{ padding: "1rem" }}>{payment.member}</td>
                <td style={{ padding: "1rem", fontWeight: "bold" }}>₹{payment.amount}</td>
                <td style={{ padding: "1rem" }}>{payment.date}</td>
                <td style={{ padding: "1rem" }}>{payment.time || '-'}</td>
                <td style={{ padding: "1rem" }}>{payment.method}</td>
                <td style={{ padding: "1rem" }}>
                  <span style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "12px",
                    fontSize: "0.85rem",
                    background: payment.status === "Completed" ? "#e8f5e9" : 
                               payment.status === "Pending" ? "#fff3e0" : "#ffebee",
                    color: payment.status === "Completed" ? "#2e7d32" : 
                           payment.status === "Pending" ? "#f57c00" : "#c62828"
                  }}>
                    {payment.status}
                  </span>
                </td>
                <td style={{ padding: "1rem" }}>
                  <button
                    onClick={() => downloadReceipt(payment)}
                    style={{
                      padding: "0.5rem 1rem",
                      background: "#3e0994",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      marginRight: "0.5rem"
                    }}
                  >
                    <i className="fas fa-download"></i> Receipt
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete payment from ${payment.member}?`)) {
                        deletePayment(payment.id);
                      }
                    }}
                    style={{
                      padding: "0.5rem 1rem",
                      background: "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.85rem"
                    }}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="8" style={{ padding: "2rem", textAlign: "center", color: "#999" }}>No payments found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
