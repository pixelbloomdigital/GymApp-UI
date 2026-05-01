import { useEffect, useMemo, useState } from "react";
import "./App.css";
import {
  addExpense,
  deleteExpense,
  getExpenses,
  getMonthlyFinance,
  getTransactions,
  getAllStaff,
} from "./api/authAdminService";
import api from "./api/axios";

const toCurrency = (value) => `Rs ${Number(value || 0).toLocaleString()}`;

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const getMonthBounds = (year, monthIndex) => {
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  return {
    from: firstDay.toISOString().split("T")[0],
    to: lastDay.toISOString().split("T")[0],
  };
};

export function FinanceManagement() {
  const now = new Date();
  const [activeTab, setActiveTab] = useState("profit");
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [expenseActionMode, setExpenseActionMode] = useState(null); // null | 'delete'
  const [expenseActionsOpen, setExpenseActionsOpen] = useState(false);
  const [selectedExpenseIds, setSelectedExpenseIds] = useState(new Set());

  // ── Staff Payments state ──────────────────────────────────────────────────
  const [staff, setStaff] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [payingId, setPayingId] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [generatingPayroll, setGeneratingPayroll] = useState(false);
  const [paymentModal, setPaymentModal] = useState(null); // { payroll, staffRecord }
  const [paymentRef, setPaymentRef] = useState("");
  const [staffToast, setStaffToast] = useState({ msg: "", type: "" });

  const notifyStaff = (msg, type = "success") => {
    setStaffToast({ msg, type });
    setTimeout(() => setStaffToast({ msg: "", type: "" }), 3500);
  };

  const payrollMonth = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;

  const loadStaffPayments = async () => {
    setStaffLoading(true);
    try {
      const [staffRes, payrollRes] = await Promise.all([
        getAllStaff(),
        api.get(`/api/trainer-payroll?month=${payrollMonth}`),
      ]);
      setStaff(Array.isArray(staffRes.data) ? staffRes.data : []);
      setPayrolls(Array.isArray(payrollRes.data) ? payrollRes.data : []);
    } catch {
      setStaff([]);
      setPayrolls([]);
    } finally {
      setStaffLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "staff-payments") loadStaffPayments();
  }, [activeTab, selectedMonth, selectedYear]);

  const staffById = useMemo(() => staff.reduce((acc, s) => {
    acc[String(s.memberId ?? s.id)] = s;
    return acc;
  }, {}), [staff]);

  const payrollByTrainerId = useMemo(() => payrolls.reduce((acc, p) => {
    acc[String(p.trainerId)] = p;
    return acc;
  }, {}), [payrolls]);

  const handleGeneratePayroll = async () => {
    setGeneratingPayroll(true);
    try {
      await api.post("/api/trainer-payroll/generate", { month: payrollMonth, trainerId: null });
      notifyStaff("Payroll generated for all trainers");
      await loadStaffPayments();
    } catch (err) {
      notifyStaff(err.response?.data?.message || "Failed to generate payroll", "error");
    } finally {
      setGeneratingPayroll(false);
    }
  };

  const handleApprove = async (payrollId) => {
    const adminId = localStorage.getItem("id") || 1;
    setApprovingId(payrollId);
    try {
      await api.patch(`/api/trainer-payroll/${payrollId}/approve?approvedBy=${adminId}`);
      notifyStaff("Payroll approved");
      await loadStaffPayments();
    } catch (err) {
      notifyStaff(err.response?.data?.message || "Failed to approve", "error");
    } finally {
      setApprovingId(null);
    }
  };

  const handleMarkPaid = async () => {
    if (!paymentModal) return;
    const { payroll, staffRecord } = paymentModal;
    setPayingId(payroll.payrollId);
    try {
      await api.patch(`/api/trainer-payroll/${payroll.payrollId}/paid`, {
        paidOn: new Date().toISOString().split("T")[0],
        paymentReference: paymentRef.trim() || `SAL-${payrollMonth}-${payroll.trainerId}`,
      });
      // Also record as expense so it shows in finance
      await addExpense({
        topic: "SALARY",
        description: `Salary paid to ${staffRecord?.name || "Trainer #" + payroll.trainerId} for ${payrollMonth}`,
        amount: Number(payroll.totalEarnings || 0),
        paidTo: staffRecord?.name || `Trainer #${payroll.trainerId}`,
        expenseDate: new Date().toISOString().split("T")[0],
        recordedBy: "ADMIN",
      });
      notifyStaff(`Salary paid to ${staffRecord?.name || "Trainer #" + payroll.trainerId}`);
      setPaymentModal(null);
      setPaymentRef("");
      await loadStaffPayments();
    } catch (err) {
      notifyStaff(err.response?.data?.message || "Failed to mark as paid", "error");
    } finally {
      setPayingId(null);
    }
  };

  const handleManualPay = async (staffMember) => {
    const amount = window.prompt(`Enter salary amount for ${staffMember.name}:`);
    if (!amount || isNaN(Number(amount))) return;
    try {
      await addExpense({
        topic: "SALARY",
        description: `Manual salary payment to ${staffMember.name} (${staffMember.role}) for ${payrollMonth}`,
        amount: Number(amount),
        paidTo: staffMember.name,
        expenseDate: new Date().toISOString().split("T")[0],
        recordedBy: "ADMIN",
      });
      notifyStaff(`Payment of Rs ${Number(amount).toLocaleString()} recorded for ${staffMember.name}`);
    } catch (err) {
      notifyStaff(err.response?.data?.message || "Failed to record payment", "error");
    }
  };

  const [showAddExpenseForm, setShowAddExpenseForm] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    topic: "",
    description: "",
    amount: "",
    paidTo: "",
    expenseDate: new Date().toISOString().split("T")[0],
    recordedBy: "ADMIN",
  });

  const loadFinanceData = async () => {
    setLoading(true);
    setError("");
    try {
      const monthIndex = Math.max(0, selectedMonth - 1);
      const { from, to } = getMonthBounds(selectedYear, monthIndex);

      const [summaryRes, txRes, expenseRes] = await Promise.all([
        getMonthlyFinance(selectedYear, selectedMonth),
        getTransactions(from, to),
        getExpenses(from, to),
      ]);

      setSummary(summaryRes.data || null);
      setTransactions(Array.isArray(txRes.data) ? txRes.data : []);
      setExpenses(Array.isArray(expenseRes.data) ? expenseRes.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load finance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinanceData();
  }, [selectedMonth, selectedYear]);

  const totalIncome = Number(summary?.totalIncome || 0);
  const totalExpenses = Number(summary?.totalExpenses || 0);
  const netProfit = Number(summary?.netProfit || 0);

  const earningsRows = useMemo(() => (
    transactions.map((t, idx) => ({
      id: t.id || t.paymentId || idx,
      source: t.purpose || "PAYMENT",
      amount: Number(t.amount || 0),
      date: t.createdAt || t.paymentDate || t.date,
      status: t.status || "SUCCESS",
      orderNumber: t.orderNumber || "-",
    }))
  ), [transactions]);

  const toggleExpenseSelection = (expenseId) => {
    setSelectedExpenseIds((prev) => {
      const next = new Set(prev);
      if (next.has(expenseId)) next.delete(expenseId);
      else next.add(expenseId);
      return next;
    });
  };

  const clearExpenseSelection = () => setSelectedExpenseIds(new Set());

  const selectAllVisibleExpenses = () => {
    setSelectedExpenseIds(new Set(expenses.map((e) => e.id)));
  };

  const handleCancelExpenseAction = () => {
    setExpenseActionMode(null);
    clearExpenseSelection();
  };

  const handleApplyExpenseAction = async () => {
    if (expenseActionMode !== "delete") return;
    if (!selectedExpenseIds.size) {
      window.alert("Select at least one expense");
      return;
    }
    if (!window.confirm(`Delete ${selectedExpenseIds.size} selected expense(s)?`)) return;

    try {
      await Promise.all(Array.from(selectedExpenseIds).map((id) => deleteExpense(id)));
      clearExpenseSelection();
      setExpenseActionMode(null);
      await loadFinanceData();
      window.alert("Selected expenses deleted successfully");
    } catch (err) {
      window.alert(err?.response?.data?.message || "Failed to delete selected expenses");
    }
  };

  const handleCreateExpense = async () => {
    if (!expenseForm.topic.trim() || !expenseForm.description.trim() || !expenseForm.amount || !expenseForm.expenseDate) {
      window.alert("Topic, description, amount, and date are required");
      return;
    }

    try {
      await addExpense({
        topic: expenseForm.topic.trim().toUpperCase(),
        description: expenseForm.description.trim(),
        amount: Number(expenseForm.amount),
        paidTo: expenseForm.paidTo.trim() || null,
        expenseDate: expenseForm.expenseDate,
        recordedBy: expenseForm.recordedBy.trim() || "ADMIN",
      });

      setExpenseForm({
        topic: "",
        description: "",
        amount: "",
        paidTo: "",
        expenseDate: new Date().toISOString().split("T")[0],
        recordedBy: "ADMIN",
      });
      setShowAddExpenseForm(false);
      await loadFinanceData();
      window.alert("Expense added successfully");
    } catch (err) {
      window.alert(err?.response?.data?.message || "Failed to add expense");
    }
  };

  return (
    <div className="page-view">
      <h2>Finance Management</h2>

      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", alignItems: "center", flexWrap: "wrap" }}>
        <label style={{ color: "#3e0994", fontWeight: 600 }}>Year</label>
        <input
          type="number"
          min={2020}
          max={2100}
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value || now.getFullYear()))}
          style={{ width: 110, padding: "8px", borderRadius: 8, border: "1px solid #ddd" }}
        />
        <label style={{ color: "#3e0994", fontWeight: 600 }}>Month</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          style={{ padding: "8px", borderRadius: 8, border: "1px solid #ddd" }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i + 1} value={i + 1}>{i + 1}</option>
          ))}
        </select>
        <button
          onClick={loadFinanceData}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "none",
            background: "#3e0994",
            color: "white",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Refresh
        </button>
      </div>

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
        <button
          onClick={() => setActiveTab("staff-payments")}
          style={{
            padding: "10px 20px",
            background: activeTab === "staff-payments" ? "#3e0994" : "transparent",
            color: activeTab === "staff-payments" ? "white" : "#3e0994",
            border: "none",
            borderRadius: "8px 8px 0 0",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          💸 Staff Payments
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: "14px", color: "#b91c1c", background: "#fee2e2", border: "1px solid #fecaca", padding: "10px", borderRadius: 8 }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ marginBottom: "14px", color: "#1d4ed8", background: "#dbeafe", border: "1px solid #bfdbfe", padding: "10px", borderRadius: 8 }}>
          Loading finance data...
        </div>
      )}

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
              <h2 style={{ fontSize: "2.5rem", margin: 0 }}>{toCurrency(netProfit)}</h2>
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
              <h2 style={{ fontSize: "2.5rem", margin: 0 }}>{toCurrency(totalIncome)}</h2>
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
              <h2 style={{ fontSize: "2.5rem", margin: 0 }}>{toCurrency(totalExpenses)}</h2>
              <p style={{ fontSize: "0.9rem", marginTop: "0.5rem", opacity: 0.9 }}>Costs</p>
            </div>
          </div>

          <div style={{ background: "#f8f8ff", padding: "20px", borderRadius: "12px" }}>
            <h3 style={{ color: "#3e0994", marginBottom: "15px" }}>Profit Analysis</h3>
            <div style={{ display: "grid", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "white", borderRadius: "8px" }}>
                <span>Profit Margin:</span>
                <strong style={{ color: netProfit >= 0 ? "#16a34a" : "#ef4444" }}>
                  {totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(2) : 0}%
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "white", borderRadius: "8px" }}>
                <span>Expense Ratio:</span>
                <strong>{totalIncome > 0 ? ((totalExpenses / totalIncome) * 100).toFixed(2) : 0}%</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "white", borderRadius: "8px" }}>
                <span>Successful Transactions:</span>
                <strong>{earningsRows.length}</strong>
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
              <h3 style={{ fontSize: "1.8rem", margin: 0 }}>{toCurrency(totalIncome)}</h3>
            </div>

            <div style={{
              background: "linear-gradient(135deg, #ef4444 0%, #f87171 100%)",
              padding: "1.5rem",
              borderRadius: "12px",
              color: "white"
            }}>
              <p style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>Total Expenses</p>
              <h3 style={{ fontSize: "1.8rem", margin: 0 }}>{toCurrency(totalExpenses)}</h3>
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
              <h3 style={{ fontSize: "1.8rem", margin: 0 }}>{toCurrency(netProfit)}</h3>
            </div>
          </div>

          <div style={{ background: "#f8f8ff", padding: "20px", borderRadius: "12px" }}>
            <h3 style={{ color: "#3e0994", marginBottom: "15px" }}>Monthly Summary</h3>
            <div style={{ display: "grid", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "white", borderRadius: "8px" }}>
                <span>Profit Margin:</span>
                <strong>{totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(2) : 0}%</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "white", borderRadius: "8px" }}>
                <span>Total Transactions:</span>
                <strong>{earningsRows.length + expenses.length}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "white", borderRadius: "8px" }}>
                <span>Recorded Expenses:</span>
                <strong>{expenses.length}</strong>
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
                  <th style={{ padding: "1rem", textAlign: "left" }}>Order</th>
                  <th style={{ padding: "1rem", textAlign: "left" }}>Amount</th>
                  <th style={{ padding: "1rem", textAlign: "left" }}>Status</th>
                  <th style={{ padding: "1rem", textAlign: "left" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {earningsRows.map((earning) => (
                  <tr key={earning.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "1rem" }}>{earning.source}</td>
                    <td style={{ padding: "1rem" }}>{earning.orderNumber}</td>
                    <td style={{ padding: "1rem", fontWeight: "bold", color: "#16a34a" }}>{toCurrency(earning.amount)}</td>
                    <td style={{ padding: "1rem" }}>{earning.status}</td>
                    <td style={{ padding: "1rem" }}>{formatDate(earning.date)}</td>
                  </tr>
                ))}
                {!earningsRows.length && (
                  <tr>
                    <td colSpan={5} style={{ padding: "1rem", textAlign: "center", color: "#64748b" }}>No transactions found for this month.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "expenses" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", gap: "10px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {!expenseActionMode ? (
                <div style={{ position: "relative" }}>
                  <button
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "none",
                      background: "#3e0994",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                    onClick={() => setExpenseActionsOpen((prev) => !prev)}
                  >
                    Actions
                  </button>
                  {expenseActionsOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 6px)",
                        left: 0,
                        minWidth: 220,
                        background: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: 8,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                        zIndex: 10,
                        overflow: "hidden",
                      }}
                      onMouseLeave={() => setExpenseActionsOpen(false)}
                    >
                      <button
                        style={{ width: "100%", textAlign: "left", border: "none", padding: "10px 12px", background: "white", cursor: "pointer" }}
                        onClick={() => {
                          setShowAddExpenseForm(true);
                          setExpenseActionsOpen(false);
                        }}
                      >
                        Add Expense
                      </button>
                      <button
                        style={{ width: "100%", textAlign: "left", border: "none", padding: "10px 12px", background: "white", cursor: "pointer" }}
                        onClick={() => {
                          setExpenseActionMode("delete");
                          clearExpenseSelection();
                          setExpenseActionsOpen(false);
                        }}
                      >
                        Delete Expense
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "none",
                      background: "#f59e0b",
                      color: "white",
                      fontWeight: 600,
                    }}
                  >
                    Delete Mode ({selectedExpenseIds.size})
                  </button>
                  <button
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "none",
                      background: "#dc2626",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                    onClick={handleApplyExpenseAction}
                  >
                    Delete Selected
                  </button>
                  <button
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1px solid #cbd5e1",
                      background: "white",
                      color: "#334155",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                    onClick={handleCancelExpenseAction}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>

            {expenseActionMode === "delete" && (
              <button
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  background: "white",
                  color: "#334155",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
                onClick={selectAllVisibleExpenses}
              >
                Select All
              </button>
            )}
          </div>

          {showAddExpenseForm && (
            <div style={{ background: "#f8f8ff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px", marginBottom: "14px" }}>
              <h4 style={{ marginTop: 0, color: "#3e0994" }}>Add Expense</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
                <input
                  placeholder="Topic (e.g. SALARY)"
                  value={expenseForm.topic}
                  onChange={(e) => setExpenseForm((p) => ({ ...p, topic: e.target.value }))}
                  style={{ padding: "8px", borderRadius: 8, border: "1px solid #d1d5db" }}
                />
                <input
                  placeholder="Amount"
                  type="number"
                  min="0"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm((p) => ({ ...p, amount: e.target.value }))}
                  style={{ padding: "8px", borderRadius: 8, border: "1px solid #d1d5db" }}
                />
                <input
                  placeholder="Paid To"
                  value={expenseForm.paidTo}
                  onChange={(e) => setExpenseForm((p) => ({ ...p, paidTo: e.target.value }))}
                  style={{ padding: "8px", borderRadius: 8, border: "1px solid #d1d5db" }}
                />
                <input
                  type="date"
                  value={expenseForm.expenseDate}
                  onChange={(e) => setExpenseForm((p) => ({ ...p, expenseDate: e.target.value }))}
                  style={{ padding: "8px", borderRadius: 8, border: "1px solid #d1d5db" }}
                />
                <input
                  placeholder="Recorded By"
                  value={expenseForm.recordedBy}
                  onChange={(e) => setExpenseForm((p) => ({ ...p, recordedBy: e.target.value }))}
                  style={{ padding: "8px", borderRadius: 8, border: "1px solid #d1d5db" }}
                />
                <input
                  placeholder="Description"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm((p) => ({ ...p, description: e.target.value }))}
                  style={{ padding: "8px", borderRadius: 8, border: "1px solid #d1d5db", gridColumn: "1 / -1" }}
                />
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  onClick={handleCreateExpense}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "none",
                    background: "#16a34a",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Save Expense
                </button>
                <button
                  onClick={() => setShowAddExpenseForm(false)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    background: "white",
                    color: "#334155",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

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
                  {expenseActionMode === "delete" && (
                    <th style={{ padding: "1rem", textAlign: "left" }}>
                      <input
                        type="checkbox"
                        checked={expenses.length > 0 && expenses.every((e) => selectedExpenseIds.has(e.id))}
                        onChange={(e) => {
                          if (e.target.checked) selectAllVisibleExpenses();
                          else clearExpenseSelection();
                        }}
                      />
                    </th>
                  )}
                  <th style={{ padding: "1rem", textAlign: "left" }}>Category</th>
                  <th style={{ padding: "1rem", textAlign: "left" }}>Description</th>
                  <th style={{ padding: "1rem", textAlign: "left" }}>Paid To</th>
                  <th style={{ padding: "1rem", textAlign: "left" }}>Amount</th>
                  <th style={{ padding: "1rem", textAlign: "left" }}>Date</th>
                  <th style={{ padding: "1rem", textAlign: "left" }}>Recorded By</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    {expenseActionMode === "delete" && (
                      <td style={{ padding: "1rem" }}>
                        <input
                          type="checkbox"
                          checked={selectedExpenseIds.has(expense.id)}
                          onChange={() => toggleExpenseSelection(expense.id)}
                        />
                      </td>
                    )}
                    <td style={{ padding: "1rem" }}>{expense.topic}</td>
                    <td style={{ padding: "1rem" }}>{expense.description}</td>
                    <td style={{ padding: "1rem" }}>{expense.paidTo || "-"}</td>
                    <td style={{ padding: "1rem", fontWeight: "bold", color: "#ef4444" }}>{toCurrency(expense.amount)}</td>
                    <td style={{ padding: "1rem" }}>{formatDate(expense.expenseDate)}</td>
                    <td style={{ padding: "1rem" }}>{expense.recordedBy || "-"}</td>
                  </tr>
                ))}
                {!expenses.length && (
                  <tr>
                    <td colSpan={expenseActionMode === "delete" ? 7 : 6} style={{ padding: "1rem", textAlign: "center", color: "#64748b" }}>
                      No expenses found for this month.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab === "staff-payments" && (
        <div>
          {/* Toast */}
          {staffToast.msg && (
            <div style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 8, background: staffToast.type === "error" ? "#fee2e2" : "#dcfce7", color: staffToast.type === "error" ? "#b91c1c" : "#166534", fontWeight: 600 }}>
              {staffToast.type === "error" ? "❌" : "✅"} {staffToast.msg}
            </div>
          )}

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <div>
              <h3 style={{ margin: 0, color: "#3e0994" }}>Staff & Trainer Payments</h3>
              <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "0.88rem" }}>Month: <strong>{payrollMonth}</strong> — {staff.length} staff members</p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={loadStaffPayments}
                style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #d1d5db", background: "white", cursor: "pointer", fontWeight: 600 }}
              >
                🔄 Refresh
              </button>
              <button
                onClick={handleGeneratePayroll}
                disabled={generatingPayroll}
                style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "#6366f1", color: "white", cursor: "pointer", fontWeight: 600, opacity: generatingPayroll ? 0.7 : 1 }}
              >
                {generatingPayroll ? "Generating..." : "⚙️ Generate Payroll"}
              </button>
            </div>
          </div>

          {staffLoading ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>Loading staff data…</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", background: "white", borderRadius: 8, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <thead>
                  <tr style={{ background: "linear-gradient(135deg,#3e0994,#6d28d9)", color: "white" }}>
                    {["#", "Name", "Role", "Phone", "Payroll Status", "Sessions", "Hours", "Earnings", "Paid On", "Actions"].map(h => (
                      <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: "0.8rem", fontWeight: 700, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {staff.map((s, i) => {
                    const payroll = payrollByTrainerId[String(s.memberId ?? s.id)];
                    const statusColor = { PAID: "#166534", APPROVED: "#1d4ed8", DRAFT: "#92400e" };
                    const statusBg   = { PAID: "#dcfce7",  APPROVED: "#dbeafe",  DRAFT: "#fef3c7" };
                    return (
                      <tr key={s.memberId ?? s.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px 14px", color: "#64748b" }}>{i + 1}</td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ fontWeight: 700 }}>{s.name}</div>
                          <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{s.email}</div>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ padding: "3px 8px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 700, background: s.role === "TRAINER" ? "#dbeafe" : "#ede9fe", color: s.role === "TRAINER" ? "#1d4ed8" : "#6d28d9" }}>
                            {s.role}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px", fontSize: "0.88rem" }}>{s.phone || "—"}</td>
                        <td style={{ padding: "12px 14px" }}>
                          {payroll ? (
                            <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 700, background: statusBg[payroll.status] || "#f1f5f9", color: statusColor[payroll.status] || "#334155" }}>
                              {payroll.status}
                            </span>
                          ) : (
                            <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>No payroll</span>
                          )}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center" }}>{payroll?.totalSessionsConducted ?? "—"}</td>
                        <td style={{ padding: "12px 14px", textAlign: "center" }}>{payroll ? Number(payroll.totalHoursWorked).toFixed(1) : "—"}</td>
                        <td style={{ padding: "12px 14px", fontWeight: 700, color: "#16a34a" }}>
                          {payroll ? toCurrency(payroll.totalEarnings) : "—"}
                        </td>
                        <td style={{ padding: "12px 14px", fontSize: "0.82rem", color: "#64748b" }}>
                          {payroll?.paidOn ? formatDate(payroll.paidOn) : "—"}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {/* Approve button for DRAFT payroll */}
                            {payroll?.status === "DRAFT" && (
                              <button
                                onClick={() => handleApprove(payroll.payrollId)}
                                disabled={approvingId === payroll.payrollId}
                                style={{ padding: "5px 10px", borderRadius: 6, border: "none", background: "#6366f1", color: "white", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600 }}
                              >
                                {approvingId === payroll.payrollId ? "..." : "✔ Approve"}
                              </button>
                            )}
                            {/* Pay button for APPROVED payroll */}
                            {payroll?.status === "APPROVED" && (
                              <button
                                onClick={() => { setPaymentModal({ payroll, staffRecord: s }); setPaymentRef(""); }}
                                style={{ padding: "5px 10px", borderRadius: 6, border: "none", background: "#16a34a", color: "white", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600 }}
                              >
                                💸 Pay Salary
                              </button>
                            )}
                            {/* PAID badge */}
                            {payroll?.status === "PAID" && (
                              <span style={{ padding: "5px 10px", borderRadius: 6, background: "#dcfce7", color: "#166534", fontSize: "0.78rem", fontWeight: 700 }}>
                                ✅ Paid
                              </span>
                            )}
                            {/* Manual pay for non-trainer staff or no payroll */}
                            {(!payroll || payroll.status === "PAID") && s.role !== "TRAINER" && (
                              <button
                                onClick={() => handleManualPay(s)}
                                style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #d1d5db", background: "white", color: "#334155", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600 }}
                              >
                                💵 Manual Pay
                              </button>
                            )}
                            {!payroll && s.role === "TRAINER" && (
                              <button
                                onClick={() => handleManualPay(s)}
                                style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #d1d5db", background: "white", color: "#334155", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600 }}
                              >
                                💵 Manual Pay
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {staff.length === 0 && (
                    <tr><td colSpan={10} style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>No staff found. Make sure the auth service is running.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Payroll summary stats */}
          {payrolls.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginTop: 20 }}>
              {[
                { label: "Total Payrolls",  val: payrolls.length,                                                          color: "#3e0994" },
                { label: "Draft",           val: payrolls.filter(p => p.status === "DRAFT").length,                        color: "#92400e" },
                { label: "Approved",        val: payrolls.filter(p => p.status === "APPROVED").length,                     color: "#1d4ed8" },
                { label: "Paid",            val: payrolls.filter(p => p.status === "PAID").length,                         color: "#166534" },
                { label: "Total Payout",    val: toCurrency(payrolls.reduce((s, p) => s + Number(p.totalEarnings || 0), 0)), color: "#ef4444" },
              ].map(stat => (
                <div key={stat.label} style={{ background: "white", borderRadius: 10, padding: "14px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", borderLeft: `4px solid ${stat.color}` }}>
                  <div style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 800, color: stat.color, marginTop: 4 }}>{stat.val}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pay Salary Modal */}
      {paymentModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "white", borderRadius: 16, padding: "2rem", width: "100%", maxWidth: 440, boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }}>
            <h3 style={{ margin: "0 0 1rem", color: "#1e293b" }}>💸 Confirm Salary Payment</h3>
            <div style={{ background: "#f8fafc", borderRadius: 10, padding: "1rem", marginBottom: "1rem", fontSize: "0.9rem", lineHeight: 1.8 }}>
              <div><strong>Staff:</strong> {paymentModal.staffRecord?.name}</div>
              <div><strong>Role:</strong> {paymentModal.staffRecord?.role}</div>
              <div><strong>Month:</strong> {paymentModal.payroll.payrollMonth}</div>
              <div><strong>Sessions:</strong> {paymentModal.payroll.totalSessionsConducted}</div>
              <div><strong>Hours:</strong> {Number(paymentModal.payroll.totalHoursWorked).toFixed(1)}</div>
              <div><strong>Amount:</strong> <span style={{ color: "#16a34a", fontWeight: 700, fontSize: "1.1rem" }}>{toCurrency(paymentModal.payroll.totalEarnings)}</span></div>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontWeight: 600, fontSize: "0.85rem", marginBottom: 6 }}>Payment Reference (optional)</label>
              <input
                value={paymentRef}
                onChange={e => setPaymentRef(e.target.value)}
                placeholder={`e.g. NEFT-${payrollMonth}-${paymentModal.payroll.trainerId}`}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", boxSizing: "border-box", fontSize: "0.9rem" }}
              />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleMarkPaid}
                disabled={payingId === paymentModal.payroll.payrollId}
                style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: "#16a34a", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem" }}
              >
                {payingId === paymentModal.payroll.payrollId ? "Processing..." : "✅ Confirm & Pay"}
              </button>
              <button
                onClick={() => { setPaymentModal(null); setPaymentRef(""); }}
                style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #d1d5db", background: "white", color: "#334155", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
