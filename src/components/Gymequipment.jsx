import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './GymEquipment.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

export default function GymEquipment() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: '',
    amount: '',
    vendor: '',
    address: '',
    contact: '',
    purchasedDate: ''
  });

  const handleNavigateToDashboard = () => {
    navigate('/dashboard');
    console.log("Navigate to Dashboard");
  };

  const handleNavigateToMembers = () => {
    navigate('/members');
    console.log("Navigate to Members");
  };

  const handleNavigateToAnnouncements = () => {
    navigate('/announcements');
    console.log("Navigate to Announcements");
  };

   const handleNavigateToStaffList = () =>{
    navigate('/staff-list')
  };

  const handleLogout = () => {
    console.log("Logout");
    navigate('/');
  };

  
  const [equipments, setEquipments] = useState([
    {
      id: 1,
      name: 'Treadmill',
      description: 'Edited Description',
      quantity: 4,
      amount: '₹75,000',
      vendor: 'DnS',
      address: '7 Sample Address',
      contact: '11111111111',
      purchasedDate: '2019-03-07'
    },
    {
      id: 2,
      name: 'Vertical Press Machine',
      description: 'For Biceps And Triceps, Upper Back, Chest',
      quantity: 3,
      amount: '₹78,000',
      vendor: 'SS Industries',
      address: '77 Sample Address',
      contact: '1212121212',
      purchasedDate: '2020-03-19'
    },
    {
      id: 3,
      name: 'Dumbbell - Adjustable',
      description: 'Material: Steel, Rubber Plastic, Concrete',
      quantity: 26,
      amount: '₹8,500',
      vendor: 'Uptown Suppliers',
      address: '7 Sample Address',
      contact: '0010000000',
      purchasedDate: '2020-03-29'
    },
    {
      id: 4,
      name: 'Multi Bench Press Machine',
      description: '6 In 1 Multi Bench With Incline, Flat, Decline Ben',
      quantity: 2,
      amount: '₹18,000',
      vendor: 'DnS Suppliers',
      address: '7 Sample Address',
      contact: '0300000000',
      purchasedDate: '2020-04-05'
    },
    {
      id: 5,
      name: 'Demo',
      description: 'This is a demo test.',
      quantity: 5,
      amount: '₹22,000',
      vendor: 'Demo',
      address: '77 Demo Lane',
      contact: '0500000000',
      purchasedDate: '2020-04-03'
    }
  ]);

  const filteredEquipments = equipments.filter((equipment) =>
    equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipment.vendor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddEquipment = () => {
    setFormData({
      name: '',
      description: '',
      quantity: '',
      amount: '',
      vendor: '',
      address: '',
      contact: '',
      purchasedDate: ''
    });
    setShowAddModal(true);
  };

  const handleEditEquipment = (equipment) => {
    setSelectedEquipment(equipment);
    setFormData({
      name: equipment.name,
      description: equipment.description,
      quantity: equipment.quantity,
      amount: equipment.amount.replace('₹', '').replace(/,/g, ''),
      vendor: equipment.vendor,
      address: equipment.address,
      contact: equipment.contact,
      purchasedDate: equipment.purchasedDate
    });
    setShowEditModal(true);
  };

  const handleDeleteEquipment = (id) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      setEquipments(equipments.filter(eq => eq.id !== id));
    }
  };

  const handleSubmitAdd = (e) => {
    e.preventDefault();
    const newEquipment = {
      id: equipments.length + 1,
      name: formData.name,
      description: formData.description,
      quantity: parseInt(formData.quantity),
      amount: `₹${parseInt(formData.amount).toLocaleString('en-IN')}`,
      vendor: formData.vendor,
      address: formData.address,
      contact: formData.contact,
      purchasedDate: formData.purchasedDate
    };
    setEquipments([...equipments, newEquipment]);
    setShowAddModal(false);
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    setEquipments(equipments.map(eq => 
      eq.id === selectedEquipment.id 
        ? {
            ...eq,
            name: formData.name,
            description: formData.description,
            quantity: parseInt(formData.quantity),
            amount: `₹${parseInt(formData.amount).toLocaleString('en-IN')}`,
            vendor: formData.vendor,
            address: formData.address,
            contact: formData.contact,
            purchasedDate: formData.purchasedDate
          }
        : eq
    ));
    setShowEditModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="equipment-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-title">Fit Nexus</h1>
          <div className="admin-info">
            <div className="admin-avatar">
              <img src="/assets/admin-avatar.jpg" alt="Admin" />
            </div>
            <div className="admin-text">
              <p className="admin-greeting">Good Evening 👋</p>
              <p className="admin-name">admin</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item" onClick={handleNavigateToDashboard}>
            <i className="fas fa-home"></i>
            <span>Dashboard</span>
          </button>
          <button className="nav-item" onClick={handleNavigateToMembers}>
            <i className="fas fa-users"></i>
            <span>Members</span>
          </button>
          <button className="nav-item active">
            <i className="fas fa-dumbbell"></i>
            <span>Gym Equipment</span>
          </button>
          <button className="nav-item" onClick={handleNavigateToAnnouncements}>
            <i className="fas fa-bullhorn"></i>
            <span>Announcements</span>
          </button>
          <button className="nav-item" onClick={handleNavigateToStaffList}>
                <i className="fas fa-user-tie"></i>
                <span>Staff Management</span>
          </button>
          <button className="nav-item" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="equipment-header">
          <div className="breadcrumb">
            <button className="breadcrumb-btn" onClick={handleNavigateToDashboard}>
              <i className="fas fa-home"></i>
              <span>Home</span>
            </button>
            <i className="fas fa-chevron-right"></i>
            <span>Equipment List</span>
          </div>
        </div>

        {/* Title Section */}
        <div className="page-title-section">
          <h1 className="page-title">
            Fit Nexus's Equipment List
            <i className="fas fa-cog"></i>
          </h1>
        </div>

        {/* Equipment Table Card */}
        <div className="equipment-card">
          <div className="card-header">
            <div className="card-title">
              <i className="fas fa-list"></i>
              <span>Equipment table</span>
            </div>
            <div className="header-actions">
              <div className="search-wrapper">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <i className="fas fa-search search-icon"></i>
              </div>
              <button className="add-btn" onClick={handleAddEquipment}>
                <i className="fas fa-plus"></i>
                Add Equipment
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="table-wrapper">
            <table className="equipment-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>E. Name</th>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Amount</th>
                  <th>Vendor</th>
                  <th>Address</th>
                  <th>Contact</th>
                  <th>Purchased Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEquipments.map((equipment, index) => (
                  <tr key={equipment.id}>
                    <td>{index + 1}</td>
                    <td className="equipment-name">{equipment.name}</td>
                    <td className="description">{equipment.description}</td>
                    <td>{equipment.quantity}</td>
                    <td className="amount">{equipment.amount}</td>
                    <td>{equipment.vendor}</td>
                    <td>{equipment.address}</td>
                    <td>{equipment.contact}</td>
                    <td>{equipment.purchasedDate}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn edit-btn"
                          onClick={() => handleEditEquipment(equipment)}
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteEquipment(equipment.id)}
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Equipment Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Equipment</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmitAdd}>
              <div className="form-grid">
                <div className="form-field">
                  <label>Equipment Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-field full-width">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>
                <div className="form-field">
                  <label>Amount (₹)</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Vendor</label>
                  <input
                    type="text"
                    name="vendor"
                    value={formData.vendor}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-field">
                  <label>Contact</label>
                  <input
                    type="tel"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-field">
                  <label>Purchased Date</label>
                  <input
                    type="date"
                    name="purchasedDate"
                    value={formData.purchasedDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Equipment Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Equipment</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmitEdit}>
              <div className="form-grid">
                <div className="form-field">
                  <label>Equipment Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-field full-width">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>
                <div className="form-field">
                  <label>Amount (₹)</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Vendor</label>
                  <input
                    type="text"
                    name="vendor"
                    value={formData.vendor}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-field">
                  <label>Contact</label>
                  <input
                    type="tel"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-field">
                  <label>Purchased Date</label>
                  <input
                    type="date"
                    name="purchasedDate"
                    value={formData.purchasedDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}