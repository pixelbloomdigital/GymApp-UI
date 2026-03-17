import { useState, useMemo } from "react";
import "./App.css";
import { usePayments } from "./PaymentContext";

export function FinanceManagement() {
  const { payments } = usePayments();
  const [activeTab, setActiveTab] = useState("profit");
  const [expenses] = useState([
    { id: 1, category: "Rent", amount: 50000, date: "2024-01-01", description: "Monthly gym rent" },
    { id: 2, category: "Utilities", amount: 8000, date: "2024-01-05", description: "Electricity & Water" },
    { id: 3, category: "Equipment", amount: 25000, date: "2024-01-10", description: "New treadmill" },
    { id: 4, category: "Salaries", amount: 80000, date: "2024-01-01", description: "Staff salaries" },
    { id: 5, category: "Maintenance", amount: 12000, date: "2024-01-15", description: "Equipment maintenance" }
  ]);

  // Calculate real-time earnings from payments
  const earnings = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.date);
      return payment.status === "Completed" && 
             paymentDate.getMonth() === currentMonth && 
             paymentDate.getFullYear() === currentYear;
    });

    const membershipEarnings = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);
    const personalTrainingEarnings = 120000;
    const supplementsEarnings = 85000;
    
    return [
      { 
        id: 1, 
        source: "Memberships", 
        amount: membershipEarnings, 
        date: new Date().toISOString().split('T')[0],
        count: monthlyPayments.length
      },
      { 
        id: 2, 
        source: "Personal Training", 
        amount: personalTrainingEarnings, 
        date: new Date().toISOString().split('T')[0] 
      },
      { 
        id: 3, 
        source: "Supplements", 
        amount: supplementsEarnings, 
        date: new Date().toISOString().split('T')[0] 
      }
    ];
  }, [payments]);

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalEarnings = earnings.reduce((sum, earn) => sum + earn.amount, 0);
  const netProfit = totalEarnings - totalExpenses;

  return (
    <div className="page-view">
      <h2>Finance Management</h2>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "2px solid #3e0994" }}>
        <button
          onClick={() => setActiveTab("profit")}
          style={{
            padding: "10px 20px",
            background: activeTab === "profit" ? "#3e0994" : "transparent",
            color: activeTab === "profit" ? "white" : "#3e0994",
            border: "none",
            borderRadius: "8px 8px 0 0",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          Profit Overview
        </button>
        <button
          onClick={() => setActiveTab("overview")}
          style={{
            padding: "10px 20px",
            background: activeTab === "overview" ? "#3e0994" : "transparent",
            color: activeTab === "overview" ? "white" : "#3e0994",
            border: "none",
            borderRadius: "8px 8px 0 0",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("earnings")}
          style={{
            padding: "10px 20px",
            background: activeTab === "earnings" ? "#3e0994" : "transparent",
            color: activeTab === "earnings" ? "white" : "#3e0994",
            border: "none",
            borderRadius: "8px 8px 0 0",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          Earnings
        </button>
        <button
          onClick={() => setActiveTab("expenses")}
          style={{
            padding: "10px 20px",
            background: activeTab === "expenses" ? "#3e0994" : "transparent",
            color: activeTab === "expenses" ? "white" : "#3e0994",
            border: "none",
            borderRadius: "8px 8px 0 0",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          Expenses
        </button>
      </div>

      {activeTab === "profit" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            <div style={{
              background: netProfit >= 0 
                ? "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)"
                : "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
              padding: "2rem",
              borderRadius: "12px",
              color: "white",
              textAlign: "center"
            }}>
              <p style={{ fontSize: "1rem", marginBottom: "0.5rem", opacity: 0.9 }}>Net Profit</p>
              <h2 style={{ fontSize: "2.5rem", margin: 0 }}>₹{netProfit.toLocaleString()}</h2>
              <p style={{ fontSize: "0.9rem", marginTop: "0.5rem", opacity: 0.9 }}>
                {netProfit >= 0 ? "Profit" : "Loss"}
              </p>
            </div>

            <div style={{
              background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
              padding: "2rem",
              borderRadius: "12px",
              color: "white",
              textAlign: "center"
            }}>
              <p style={{ fontSize: "1rem", marginBottom: "0.5rem", opacity: 0.9 }}>Total Earnings</p>
              <h2 style={{ fontSize: "2.5rem", margin: 0 }}>₹{totalEarnings.toLocaleString()}</h2>
              <p style={{ fontSize: "0.9rem", marginTop: "0.5rem", opacity: 0.9 }}>Revenue</p>
            </div>

            <div style={{
              background: "linear-gradient(135deg, #ef4444 0%, #f87171 100%)",
              padding: "2rem",
              borderRadius: "12px",
              color: "white",
              textAlign: "center"
            }}>
              <p style={{ fontSize: "1rem", marginBottom: "0.5rem", opacity: 0.9 }}>Total Expenses</p>
              <h2 style={{ fontSize: "2.5rem", margin: 0 }}>₹{totalExpenses.toLocaleString()}</h2>
              <p style={{ fontSize: "0.9rem", marginTop: "0.5rem", opacity: 0.9 }}>Costs</p>
            </div>
          </div>

          <div style={{ background: "#f8f8ff", padding: "20px", borderRadius: "12px" }}>
            <h3 style={{ color: "#3e0994", marginBottom: "15px" }}>Profit Analysis</h3>
            <div style={{ display: "grid", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "white", borderRadius: "8px" }}>
                <span>Profit Margin:</span>
                <strong style={{ color: netProfit >= 0 ? "#16a34a" : "#ef4444" }}>
                  {totalEarnings > 0 ? ((netProfit / totalEarnings) * 100).toFixed(2) : 0}%
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "white", borderRadius: "8px" }}>
                <span>Expense Ratio:</span>
                <strong>{totalEarnings > 0 ? ((totalExpenses / totalEarnings) * 100).toFixed(2) : 0}%</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "white", borderRadius: "8px" }}>
                <span>Completed Payments:</span>
                <strong>{payments.filter(p => p.status === "Completed").length}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "overview" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            <div style={{
              background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
              padding: "1.5rem",
              borderRadius: "12px",
              color: "white"
            }}>
              <p style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>Total Earnings</p>
              <h3 style={{ fontSize: "1.8rem", margin: 0 }}>₹{totalEarnings.toLocaleString()}</h3>
            </div>

            <div style={{
              background: "linear-gradient(135deg, #ef4444 0%, #f87171 100%)",
              padding: "1.5rem",
              borderRadius: "12px",
              color: "white"
            }}>
              <p style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>Total Expenses</p>
              <h3 style={{ fontSize: "1.8rem", margin: 0 }}>₹{totalExpenses.toLocaleString()}</h3>
            </div>

            <div style={{
              background: netProfit >= 0 
                ? "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)"
                : "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
              padding: "1.5rem",
              borderRadius: "12px",
              color: "white"
            }}>
              <p style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>Net Profit</p>
              <h3 style={{ fontSize: "1.8rem", margin: 0 }}>₹{netProfit.toLocaleString()}</h3>
            </div>
          </div>

          <div style={{ background: "#f8f8ff", padding: "20px", borderRadius: "12px" }}>
            <h3 style={{ color: "#3e0994", marginBottom: "15px" }}>Monthly Summary</h3>
            <div style={{ display: "grid", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "white", borderRadius: "8px" }}>
                <span>Profit Margin:</span>
                <strong>{totalEarnings > 0 ? ((netProfit / totalEarnings) * 100).toFixed(2) : 0}%</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "white", borderRadius: "8px" }}>
                <span>Total Transactions:</span>
                <strong>{earnings.length + expenses.length}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "white", borderRadius: "8px" }}>
                <span>Completed Payments:</span>
                <strong>{payments.filter(p => p.status === "Completed").length}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "earnings" && (
        <div>
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
                  <th style={{ padding: "1rem", textAlign: "left" }}>Source</th>
                  <th style={{ padding: "1rem", textAlign: "left" }}>Amount</th>
                  <th style={{ padding: "1rem", textAlign: "left" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {earnings.map((earning) => (
                  <tr key={earning.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "1rem" }}>
                      {earning.source}
                      {earning.count && <span style={{ fontSize: "0.8rem", color: "#666", marginLeft: "8px" }}>({earning.count} payments)</span>}
                    </td>
                    <td style={{ padding: "1rem", fontWeight: "bold", color: "#16a34a" }}>₹{earning.amount.toLocaleString()}</td>
                    <td style={{ padding: "1rem" }}>{earning.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "expenses" && (
        <div>
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
                  <th style={{ padding: "1rem", textAlign: "left" }}>Category</th>
                  <th style={{ padding: "1rem", textAlign: "left" }}>Description</th>
                  <th style={{ padding: "1rem", textAlign: "left" }}>Amount</th>
                  <th style={{ padding: "1rem", textAlign: "left" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "1rem" }}>{expense.category}</td>
                    <td style={{ padding: "1rem" }}>{expense.description}</td>
                    <td style={{ padding: "1rem", fontWeight: "bold", color: "#ef4444" }}>₹{expense.amount.toLocaleString()}</td>
                    <td style={{ padding: "1rem" }}>{expense.date}</td>
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
