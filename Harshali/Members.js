import { useState, useEffect } from "react";
import { useMemberships } from "./MembershipContext";
import "./App.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function Members() {
  const { getMembershipStats } = useMemberships();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showMembershipPlans, setShowMembershipPlans] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({ name: "", phone: "", nextBill: "", status: "active" });

  const membershipPlans = [
    { id: 1, name: "1 Month Basic", price: 1000, duration: "30 days" },
    { id: 2, name: "3 Months Standard", price: 2500, duration: "90 days" },
    { id: 3, name: "6 Months Premium", price: 5000, duration: "180 days" },
    { id: 4, name: "12 Months Elite", price: 9000, duration: "365 days" }
  ];

  const stats = getMembershipStats();

  useEffect(() => {
    fetch('/members.json')
      .then(res => res.json())
      .then(data => setMembers(data.members))
      .catch(err => console.error('Error loading members:', err));
  }, []);

  const saveToJSON = (updatedMembers) => {
    setMembers(updatedMembers);
    localStorage.setItem('members', JSON.stringify(updatedMembers));
  };

  useEffect(() => {
    const saved = localStorage.getItem('members');
    if (saved) {
      setMembers(JSON.parse(saved));
    }
  }, []);

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm)
  );

  const handleAdd = () => {
    if (!formData.name || !formData.phone || !formData.nextBill) {
      alert("Please fill all fields");
      return;
    }
    const newMember = {
      id: Date.now(),
      ...formData,
      img: "/assets/member1.jpg"
    };
    saveToJSON([...members, newMember]);
    setFormData({ name: "", phone: "", nextBill: "", status: "active" });
    setShowAddForm(false);
  };

  const handleUpdate = () => {
    if (!formData.name || !formData.phone || !formData.nextBill) {
      alert("Please fill all fields");
      return;
    }
    const updated = members.map(m => m.id === selectedMember.id ? { ...selectedMember, ...formData } : m);
    saveToJSON(updated);
    setEditMode(false);
    setSelectedMember({ ...selectedMember, ...formData });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      saveToJSON(members.filter(m => m.id !== id));
      setSelectedMember(null);
    }
  };

  if (showMembershipPlans) {
    return (
      <div>
        <div className="hero">
          <img src="/assets/gym.jpeg" alt="Gym" />
          <div className="overlay"></div>
          <div className="hero-text">
            <h1 className="gradient-text">Membership Plans</h1>
            <p>Choose the perfect plan</p>
          </div>
        </div>
        <div className="page-view">
          <div className="page-header">
            <h2>Available Plans</h2>
            <button className="home-btn" onClick={() => setShowMembershipPlans(false)}>
              <i className="fas fa-arrow-left"></i> Back
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginTop: "2rem" }}>
            {membershipPlans.map((plan) => (
              <div key={plan.id} style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "2rem", borderRadius: "16px", color: "white", textAlign: "center" }}>
                <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>{plan.name}</h3>
                <p style={{ fontSize: "2.5rem", fontWeight: "bold", margin: "1rem 0" }}>₹{plan.price}</p>
                <p style={{ fontSize: "1rem", opacity: 0.9, marginBottom: "0.5rem" }}>{plan.duration}</p>
                <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>Sold: {stats[plan.name] || 0}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showAddForm) {
    return (
      <div>
        <div className="hero">
          <img src="/assets/gym.jpeg" alt="Gym" />
          <div className="overlay"></div>
          <div className="hero-text">
            <h1 className="gradient-text">Add New Member</h1>
          </div>
        </div>
        <div className="page-view">
          <div className="page-header">
            <h2>Member Details</h2>
            <button className="home-btn" onClick={() => { setShowAddForm(false); setFormData({ name: "", phone: "", nextBill: "", status: "active" }); }}>
              <i className="fas fa-times"></i> Cancel
            </button>
          </div>
          <div style={{ marginTop: "2rem" }}>
            <input className="login-input" placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ width: "100%", marginBottom: "1rem" }} />
            <input className="login-input" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ width: "100%", marginBottom: "1rem" }} />
            <input className="login-input" type="date" placeholder="Next Bill Date" value={formData.nextBill} onChange={(e) => setFormData({ ...formData, nextBill: e.target.value })} style={{ width: "100%", marginBottom: "1rem" }} />
            <select className="login-input" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} style={{ width: "100%", marginBottom: "1rem" }}>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="inactive">Inactive</option>
            </select>
            <button className="login-btn" onClick={handleAdd} style={{ width: "100%" }}>Add Member</button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedMember) {
    return (
      <div>
        <div className="hero">
          <img src="/assets/gym.jpeg" alt="Gym" />
          <div className="overlay"></div>
          <div className="hero-text">
            <h1 className="gradient-text">Member Details</h1>
            <p>{selectedMember.name}</p>
          </div>
        </div>
        <div className="page-view">
          <div className="page-header">
            <h2>{selectedMember.name}</h2>
            <button className="home-btn" onClick={() => { setSelectedMember(null); setEditMode(false); }}>
              <i className="fas fa-arrow-left"></i> Back
            </button>
          </div>
          <div className="page-content" style={{ textAlign: "center" }}>
            {!editMode ? (
              <>
                <img src={selectedMember.img} alt={selectedMember.name} style={{ width: "150px", borderRadius: "50%", marginBottom: "1rem" }} />
                <p><strong>Phone:</strong> {selectedMember.phone}</p>
                <p><strong>Status:</strong> {selectedMember.status}</p>
                <p><strong>Next Bill Date:</strong> {selectedMember.nextBill}</p>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "1rem" }}>
                  <button className="add-member-btn" onClick={() => { setEditMode(true); setFormData({ name: selectedMember.name, phone: selectedMember.phone, nextBill: selectedMember.nextBill, status: selectedMember.status }); }}>
                    <i className="fas fa-edit"></i> Edit
                  </button>
                  <button className="membership-btn" onClick={() => handleDelete(selectedMember.id)} style={{ background: "#ef4444" }}>
                    <i className="fas fa-trash"></i> Delete
                  </button>
                </div>
              </>
            ) : (
              <div style={{ maxWidth: "400px", margin: "0 auto" }}>
                <input className="login-input" placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ width: "100%", marginBottom: "1rem" }} />
                <input className="login-input" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ width: "100%", marginBottom: "1rem" }} />
                <input className="login-input" type="date" value={formData.nextBill} onChange={(e) => setFormData({ ...formData, nextBill: e.target.value })} style={{ width: "100%", marginBottom: "1rem" }} />
                <select className="login-input" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} style={{ width: "100%", marginBottom: "1rem" }}>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="inactive">Inactive</option>
                </select>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button className="login-btn" onClick={handleUpdate} style={{ flex: 1 }}>Save</button>
                  <button className="home-btn" onClick={() => setEditMode(false)} style={{ flex: 1 }}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="hero">
        <img src="/assets/gym.jpeg" alt="Gym" />
        <div className="overlay"></div>
        <div className="hero-text">
          <h1 className="gradient-text">Members Management</h1>
          <p>View & manage gym members</p>
        </div>
      </div>

      <div style={{ padding: "2rem" }}>
        <div className="members-header">
          <button className="add-member-btn" onClick={() => setShowAddForm(true)}>
            <i className="fas fa-plus"></i> Add Member
          </button>
          <button className="membership-btn" onClick={() => setShowMembershipPlans(true)}>
            Membership <i className="fas fa-plus"></i>
          </button>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search By Name or Mobile No"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button>
            <i className="fas fa-search"></i>
          </button>
        </div>

        <p>Total Members: {filteredMembers.length}</p>

        <div className="members-grid">
          {filteredMembers.map((member) => (
            <div 
              key={member.id} 
              className="member-card"
              onClick={() => setSelectedMember(member)}
              style={{ cursor: "pointer" }}
            >
              <div className={`status-dot ${member.status}`}></div>
              <img src={member.img} alt={member.name} />
              <p className="member-name">{member.name}</p>
              <p className="member-phone">{member.phone}</p>
              <p className="member-bill">Next Bill Date: {member.nextBill}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
