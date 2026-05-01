import React, { useEffect, useMemo, useRef, useState } from 'react';
import { addEquipment, deleteEquipment, getEquipments, updateEquipment } from '../api/authAdminService';
import './Gymequipment.css';

const EQUIPMENT_FIELDS = [
  ['name', 'Equipment Name', 'text'],
  ['quantity', 'Quantity', 'number'],
  ['amount', 'Amount (₹)', 'number'],
  ['vendor', 'Vendor', 'text'],
  ['address', 'Address', 'text'],
  ['contact', 'Contact', 'tel'],
  ['purchasedDate', 'Purchased Date', 'date'],
];

function EquipmentForm({
  onSubmit,
  onClose,
  title,
  submitLabel,
  formData,
  handleInputChange,
  submitting,
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button type="button" className="close-btn" onClick={onClose}><i className="fas fa-times" /></button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="form-grid">
            {EQUIPMENT_FIELDS.map(([n, l, t]) => (
              <div className="form-field" key={n}>
                <label>{l}</label>
                <input type={t} name={n} value={formData[n]} onChange={handleInputChange} required={['name', 'quantity', 'amount', 'vendor'].includes(n)} />
              </div>
            ))}
            <div className="form-field full-width">
              <label>Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="submit-btn" disabled={submitting} style={{ opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}>
              {submitting ? 'Saving...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function GymEquipment() {
  const [searchTerm, setSearchTerm]       = useState('');
  const [showAddModal, setShowAddModal]   = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExpenseInsights, setShowExpenseInsights] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [actionMode, setActionMode] = useState(null); // null | 'edit' | 'delete'
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [formData, setFormData] = useState({ name:'', description:'', quantity:'', amount:'', vendor:'', address:'', contact:'', purchasedDate:'' });
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const didInitLoad = useRef(false);

  useEffect(() => {
    if (didInitLoad.current) return;
    didInitLoad.current = true;
    loadEquipments();
  }, []);

  const loadEquipments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getEquipments();
      setEquipments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load equipment');
    } finally {
      setLoading(false);
    }
  };

  const filtered = equipments.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.vendor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const parseAmount = value => Number(String(value || '').replace(/[^0-9.]/g, '')) || 0;

  const normalizeEquipment = data => ({
    ...data,
    quantity: Number(data.quantity) || 0,
    amount: parseAmount(data.amount),
  });

  const expenseSeries = useMemo(
    () => equipments
      .map(eq => ({
        id: eq.id,
        name: eq.name,
        expense: (Number(eq.amount) || 0) * (Number(eq.quantity) || 0),
      }))
      .filter(item => item.expense > 0)
      .sort((a, b) => b.expense - a.expense),
    [equipments]
  );

  const totalEquipmentExpense = useMemo(
    () => expenseSeries.reduce((sum, item) => sum + item.expense, 0),
    [expenseSeries]
  );

  const resetActionMode = () => {
    setActionMode(null);
    setSelectedIds(new Set());
  };

  const startEditMode = () => {
    setActionMode('edit');
    setSelectedIds(new Set());
  };

  const startDeleteMode = () => {
    setActionMode('delete');
    setSelectedIds(new Set());
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => {
      if (actionMode === 'edit') {
        return new Set([id]);
      }
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openSelectedForEdit = () => {
    const [selectedId] = Array.from(selectedIds);
    const eq = equipments.find(item => item.id === selectedId);
    if (!eq) return;
    openEdit(eq);
  };

  const deleteSelected = async () => {
    if (!selectedIds.size) return;
    if (!window.confirm(`Delete ${selectedIds.size} selected equipment item(s)?`)) return;
    try {
      await Promise.all(Array.from(selectedIds).map(id => deleteEquipment(id)));
      await loadEquipments();
      resetActionMode();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Failed to delete selected equipment');
    }
  };

  const handleSubmitAdd = async e => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await addEquipment({ ...normalizeEquipment(formData), recordedBy: 'ADMIN' });
      setShowAddModal(false);
      setFormData({ name:'', description:'', quantity:'', amount:'', vendor:'', address:'', contact:'', purchasedDate:'' });
      await loadEquipments();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Failed to add equipment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async e => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await updateEquipment(selectedEquipment.id, { ...normalizeEquipment(formData), recordedBy: 'ADMIN' });
      setShowEditModal(false);
      setSelectedEquipment(null);
      resetActionMode();
      await loadEquipments();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Failed to update equipment');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = eq => {
    setSelectedEquipment(eq);
    setFormData({ name:eq.name, description:eq.description, quantity:eq.quantity, amount:eq.amount, vendor:eq.vendor, address:eq.address, contact:eq.contact, purchasedDate:eq.purchasedDate });
    setShowEditModal(true);
  };

  return (
    <div style={{ fontFamily:"'Poppins',sans-serif" }}>
      <div className="equipment-card">
        <div className="card-header">
          <div className="card-title"><i className="fas fa-list" /><span>Equipment List</span></div>
          <div className="header-actions">
            <button
              type="button"
              className="add-btn"
              onClick={() => setShowExpenseInsights(prev => !prev)}
              style={{ marginRight: 8, background: '#0f766e' }}
            >
              <i className="fas fa-chart-pie" />
              {`Equipment Expense: ₹${totalEquipmentExpense.toLocaleString('en-IN')}`}
            </button>
            <button type="button" className="add-btn" onClick={startEditMode} style={{ marginRight: 8, background: '#2563eb' }}>
              <i className="fas fa-pen" /> Edit
            </button>
            <button type="button" className="add-btn" onClick={startDeleteMode} style={{ marginRight: 8, background: '#dc2626' }}>
              <i className="fas fa-trash" /> Delete
            </button>
            {actionMode && (
              <button type="button" className="add-btn" onClick={resetActionMode} style={{ marginRight: 8, background: '#6b7280' }}>
                <i className="fas fa-times" /> Cancel
              </button>
            )}
            {actionMode === 'edit' && (
              <button type="button" className="add-btn" onClick={openSelectedForEdit} disabled={selectedIds.size !== 1} style={{ marginRight: 8, opacity: selectedIds.size === 1 ? 1 : 0.6 }}>
                <i className="fas fa-edit" /> Edit Selected
              </button>
            )}
            {actionMode === 'delete' && (
              <button type="button" className="add-btn" onClick={deleteSelected} disabled={!selectedIds.size} style={{ marginRight: 8, background: '#b91c1c', opacity: selectedIds.size ? 1 : 0.6 }}>
                <i className="fas fa-trash" /> Delete Selected
              </button>
            )}
            <div className="search-wrapper">
              <input type="text" className="search-input" placeholder="Search equipment or vendor…"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              <i className="fas fa-search search-icon" />
            </div>
            <button type="button" className="add-btn" onClick={() => { setFormData({ name:'',description:'',quantity:'',amount:'',vendor:'',address:'',contact:'',purchasedDate:'' }); setShowAddModal(true); }}>
              <i className="fas fa-plus" /> Add Equipment
            </button>
          </div>
        </div>
        {showExpenseInsights && (
          <div className="expense-panel">
            <div className="expense-header">
              <h3><i className="fas fa-coins" /> Equipment Expense Breakdown</h3>
              <div className="expense-total">
                Total: ₹{totalEquipmentExpense.toLocaleString('en-IN')}
              </div>
            </div>
            {expenseSeries.length === 0 ? (
              <div className="expense-empty">No equipment expenses available yet.</div>
            ) : (
              <div className="expense-chart">
                {expenseSeries.map(item => {
                  const percent = totalEquipmentExpense > 0 ? (item.expense / totalEquipmentExpense) * 100 : 0;
                  return (
                    <div className="expense-row" key={item.id}>
                      <div className="expense-name" title={item.name}>{item.name}</div>
                      <div className="expense-bar-wrap">
                        <div className="expense-bar" style={{ width: `${Math.max(percent, 2)}%` }} />
                      </div>
                      <div className="expense-value">
                        <div>₹{item.expense.toLocaleString('en-IN')}</div>
                        <small>{percent.toFixed(1)}%</small>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {error && <div style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</div>}
        <div className="table-wrapper">
          <table className="equipment-table">
            <thead>
              <tr>
                {actionMode && <th>Select</th>}
                <th>#</th><th>Name</th><th>Description</th><th>Qty</th><th>Amount</th><th>Vendor</th><th>Contact</th><th>Purchased</th><th>Expense</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={actionMode ? 10 : 9} style={{ textAlign:'center', padding:'2rem' }}>Loading equipment…</td></tr>
              ) : filtered.map((eq, i) => (
                <tr key={eq.id} style={{ background: selectedIds.has(eq.id) ? 'rgba(37,99,235,0.08)' : 'transparent' }}>
                  {actionMode && (
                    <td>
                      <input
                        type={actionMode === 'edit' ? 'radio' : 'checkbox'}
                        checked={selectedIds.has(eq.id)}
                        onChange={() => toggleSelection(eq.id)}
                      />
                    </td>
                  )}
                  <td>{i+1}</td>
                  <td className="equipment-name">{eq.name}</td>
                  <td className="description">{eq.description}</td>
                  <td>{eq.quantity}</td>
                  <td className="amount">₹{Number(eq.amount || 0).toLocaleString('en-IN')}</td>
                  <td>{eq.vendor}</td>
                  <td>{eq.contact}</td>
                  <td>{eq.purchasedDate}</td>
                  <td>{eq.expenseId ? `#${eq.expenseId}` : 'Auto-linked'}</td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={actionMode ? 10 : 9} style={{ textAlign:"center", color:"#94a3b8", padding:"2rem" }}>No equipment found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal  && <EquipmentForm onSubmit={handleSubmitAdd}  onClose={() => setShowAddModal(false)}  title="Add New Equipment" submitLabel="Add Equipment" formData={formData} handleInputChange={handleInputChange} submitting={submitting} />}
      {showEditModal && <EquipmentForm onSubmit={handleSubmitEdit} onClose={() => setShowEditModal(false)} title="Edit Equipment"     submitLabel="Save Changes" formData={formData} handleInputChange={handleInputChange} submitting={submitting} />}
    </div>
  );
}
