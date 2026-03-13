/* import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import './MemberMonthlyReport.css';

const MemberMonthlyReport = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  
  const [member, setMember] = useState(null);
  const [monthlyReports, setMonthlyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  // ✅ PERFECTLY MATCHES YOUR db.json STRUCTURE
  useEffect(() => {
    fetchMemberData();
  }, [memberId]);

  const fetchMemberData = async () => {
    try {
      setLoading(true);
      
      // ✅ Fetch SPECIFIC member by ID from http://localhost:3001/users/{id}
      const memberRes = await fetch(`http://localhost:3001/users/${memberId}`);
      if (!memberRes.ok) throw new Error('Member not found');
      
      const memberData = await memberRes.json();
      
      // ✅ Fetch ALL monthly reports and filter for this member
      const reportsRes = await fetch('http://localhost:3001/monthlyReports');
      const allReports = await reportsRes.json();
      
      // ✅ Fetch memberships for plan name
      const membershipRes = await fetch('http://localhost:3001/memberships');
      const memberships = await membershipRes.json();
      
      const membership = memberships.find(m => m.id === memberData.membershipId);
      
      // ✅ Filter reports WHERE memberId matches (string comparison)
      const memberReports = allReports.filter(report => 
        String(report.memberId) === memberId
      );
      
      // ✅ ENRICH member data with plan name
      const enrichedMember = {
        ...memberData,
        plan: membership?.name || 'Unknown Plan',
        membershipStatus: memberData.membershipStatus || 'Active'
      };
      
      setMember(enrichedMember);
      setMonthlyReports(memberReports);
      
      // ✅ Auto-select LATEST report (matches db.json structure)
      if (memberReports.length > 0) {
        setSelectedReport(memberReports[memberReports.length - 1]);
      }
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ USE db.json FIELDS DIRECTLY
  const getMonthName = (monthStr) => {
    if (!monthStr) return 'Unknown Month';
    const date = new Date(`${monthStr}-01`);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };
  // 🆕 ADD THIS FUNCTION - Creates downloadable PDF
const generatePDFReport = async () => {
  if (!selectedReport) {
    alert('Please select a monthly report first');
    return;
  }

  try {
    // Capture the selected report section
    const reportElement = document.querySelector('.selected-report');
    if (!reportElement) {
      alert('Report content not found');
      return;
    }

    setLoading(true);
    
    // Generate PDF
    const canvas = await html2canvas(reportElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: reportElement.scrollWidth,
      height: reportElement.scrollHeight
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Calculate dimensions
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    let position = 20; // Top margin

    // Add cover page
    pdf.setFontSize(24);
    pdf.setFont(undefined, 'bold');
    pdf.text(`${member.name} - ${getMonthName(selectedReport.month)}`, 105, 40, { align: 'center' });
    pdf.setFontSize(16);
    pdf.text('Monthly Progress Report', 105, 55, { align: 'center' });
    pdf.setFontSize(12);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 70, { align: 'center' });
    
    pdf.addPage();
    position = 20;

    // Add report content
    let remainingHeight = heightLeft;
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight + 20;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save PDF
    pdf.save(`${member.name}_${getMonthName(selectedReport.month).replace(' ', '_')}_Report.pdf`);
    setLoading(false);
  } catch (error) {
    console.error('PDF generation failed:', error);
    alert('Failed to generate PDF');
    setLoading(false);
  }
};
  // 🆕 ADD THIS FUNCTION - Browser print dialog
const printReport = () => {
  if (!selectedReport) {
    alert('Please select a monthly report first');
    return;
  }

  const printContent = `
    <html>
      <head>
        <title>${member.name} Monthly Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; }
          .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
          .metric { text-align: center; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; }
          .metric h3 { color: #3b82f6; margin: 0 0 10px 0; }
          .progress-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; }
          .progress-item { display: flex; justify-content: space-between; padding: 10px 0; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${member.name}</h1>
          <h2>${getMonthName(selectedReport.month)}</h2>
          <p>Generated: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="metrics">
          <div class="metric">
            <h3>📊 Attendance</h3>
            <div style="font-size: 24px; font-weight: bold; color: #10b981;">
              ${formatAttendance(selectedReport.attendancePercentage, selectedReport.totalAttendanceDays, selectedReport.totalPossibleDays)}
            </div>
          </div>
          <div class="metric">
            <h3>⚖️ Weight</h3>
            <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">
              ${selectedReport.weightChange >= 0 ? `+${selectedReport.weightChange}kg` : `${selectedReport.weightChange}kg`}
            </div>
          </div>
          <div class="metric">
            <h3>💪 Bench Press</h3>
            <div style="font-size: 24px; font-weight: bold; color: #f59e0b;">
              ${selectedReport.benchPressProgress}
            </div>
          </div>
          <div class="metric">
            <h3>💰 Payment</h3>
            <div style="font-size: 24px; font-weight: bold; color: ${selectedReport.paymentStatus === 'Paid' ? '#10b981' : '#ef4444'};">
              ${selectedReport.paymentStatus}
            </div>
          </div>
        </div>

        <div class="progress-grid">
          <div class="progress-item"><strong>Squat:</strong> ${selectedReport.squatProgress}</div>
          <div class="progress-item"><strong>Current Weight:</strong> ${selectedReport.currentWeight}kg</div>
          <div class="progress-item"><strong>Attendance Days:</strong> ${selectedReport.totalAttendanceDays}/${selectedReport.totalPossibleDays}</div>
          <div class="progress-item"><strong>Payment:</strong> ₹${selectedReport.paymentAmount}</div>
        </div>

        <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
          <p>${member.name} - Member ID: ${member.id}</p>
          <p>Trainer: ${member.trainer || 'N/A'}</p>
        </div>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.print();
};

  const formatAttendance = (percentage, totalDays, possibleDays) => {
    if (!percentage) return 'N/A';
    if (totalDays && possibleDays) {
      return `${percentage} (${totalDays}/${possibleDays})`;
    }
    return percentage;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-large"></div>
        <p>Loading your monthly reports...</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="error-container">
        <h2>Member not found</h2>
        <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
      </div>
    );
  }

  return (
    <div className="member-report-container">

      <div className="video-container">
        <video autoPlay loop muted playsInline>
          <source src="/videos/gym-bg.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div className="video-overlay"></div>

   
      <div className="member-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-avatar">
            {(member.name || '').charAt(0)?.toUpperCase() || 'M'}
          </div>
          <div className="sidebar-title">
            <h3>{member.name}</h3>
            <p>Monthly Progress</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          <button className="nav-item active">
            📊 My Monthly Reports
          </button>
        </nav>
      </div>


      <div className="main-content member-report-wrapper">
        
        <div className="profile-header-card">
          <div className="profile-left">
            <div className="profile-avatar">
              {(member.name || '').charAt(0)?.toUpperCase() || 'M'}
            </div>
          </div>
          <div className="profile-right">
            <h1 className="profile-name">{member.name}</h1>
            <div className="profile-meta">
              <span className="meta-item"><strong>ID:</strong> {member.id}</span>
              <span className="meta-item"><strong>Trainer:</strong> {member.trainer || 'N/A'}</span>
              <span className="meta-item">
                <strong>Plan:</strong> {member.plan}
              </span>
              <span className="meta-item">
                <strong>Status:</strong>
                <span className={`status-badge status-${(member.membershipStatus || 'Active').toLowerCase()}`}>
                  {member.membershipStatus}
                </span>
              </span>
              <span className="meta-item">
                <strong>Goal:</strong> {member.fitnessGoal}
              </span>
            </div>
          </div>
        </div>

      
        {monthlyReports.length > 0 ? (
          <div className="reports-list-section">
            <h2 className="section-title">Your Monthly Reports</h2>
            <div className="month-selector">
              {monthlyReports.map((report) => (
                <div 
                  key={report.id}
                  className={`month-card ${selectedReport?.id === report.id ? 'active' : ''}`}
                  onClick={() => setSelectedReport(report)}
                >
                  <h3>{getMonthName(report.month)}</h3>
                  <div className="month-stats">
                    <span>Attendance: {report.attendancePercentage}</span>
                    <span>Weight: {report.weightChange > 0 ? `+${report.weightChange}kg` : `${report.weightChange}kg`}</span>
                  </div>
                  <div className={`payment-dot ${report.paymentStatus?.toLowerCase()}`}>
                    {report.paymentStatus === 'Paid' ? '✅' : '⏳'}
                  </div>
                </div>
              ))}
            </div>

        
            {selectedReport && (
              <div className="selected-report">
                <div className="report-header">
                  <h2>{getMonthName(selectedReport.month)} Report</h2>
                  <div className="report-meta">
                    <span>Generated: {selectedReport.paymentDate || 'N/A'}</span>
                    <span>Payment: ₹{selectedReport.paymentAmount || 0}</span>
                  </div>
                </div>

              
                <div className="metrics-dashboard">
                  <div className="metric-card attendance-metric">
                    <div className="metric-icon">📊</div>
                    <h3>Attendance</h3>
                    <div className="metric-value">
                      {formatAttendance(
                        selectedReport.attendancePercentage,
                        selectedReport.totalAttendanceDays,
                        selectedReport.totalPossibleDays
                      )}
                    </div>
                  </div>

                  <div className="metric-card weight-metric">
                    <div className="metric-icon">⚖️</div>
                    <h3>Weight Change</h3>
                    <div className="metric-value">
                      {selectedReport.weightChange >= 0 ? `+${selectedReport.weightChange}kg` : `${selectedReport.weightChange}kg`}
                    </div>
                  </div>

                  <div className="metric-card strength-metric">
                    <div className="metric-icon">💪</div>
                    <h3>Bench Press</h3>
                    <div className="metric-value">{selectedReport.benchPressProgress}</div>
                  </div>

                  <div className="metric-card payment-metric">
                    <div className="metric-icon">💰</div>
                    <h3>Payment Status</h3>
                    <div className={`status-badge payment-${selectedReport.paymentStatus?.toLowerCase()}`}>
                      {selectedReport.paymentStatus}
                    </div>
                  </div>
                </div>

           
                <div className="progress-details-section">
                  <h3>📈 Detailed Progress</h3>
                  <div className="progress-grid">
                    <div className="progress-item">
                      <span>Squat Progress</span>
                      <span>{selectedReport.squatProgress}</span>
                    </div>
                    <div className="progress-item">
                      <span>Total Attendance Days</span>
                      <span>{selectedReport.totalAttendanceDays}/{selectedReport.totalPossibleDays}</span>
                    </div>
                    <div className="progress-item">
                      <span>Current Weight</span>
                      <span>{selectedReport.currentWeight}kg</span>
                    </div>
                    <div className="progress-item highlight">
                      <span>Payment Amount</span>
                      <span>₹{selectedReport.paymentAmount}</span>
                    </div>
                  </div>
                </div>

        
                <div className="member-stats-section">
                  <h3>📊 Your Profile Stats</h3>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-value">{member.height}cm</div>
                      <div className="stat-label">Height</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{member.bodyFat}</div>
                      <div className="stat-label">Body Fat</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{member.targetWeight}kg</div>
                      <div className="stat-label">Target Weight</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{member.attendance}</div>
                      <div className="stat-label">Overall Attendance</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="no-reports">
            <h2>No Monthly Reports Yet</h2>
            <p>Your trainer will generate your first monthly report soon.</p>
            <div className="profile-preview">
              <h3>Your Current Stats</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{member.currentWeight}kg</div>
                  <div className="stat-label">Current Weight</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{member.targetWeight}kg</div>
                  <div className="stat-label">Target Weight</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{member.height}cm</div>
                  <div className="stat-label">Height</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{member.bodyFat}</div>
                  <div className="stat-label">Body Fat</div>
                </div>
              </div>
            </div>
          </div>
        )}

  
        <div className="report-actions">
  <button 
    className="download-pdf-btn" 
    onClick={generatePDFReport}
    disabled={loading || !selectedReport}
  >
    {loading ? '⏳ Generating...' : '📥 Download PDF Report'}
  </button>
  <button 
    className="print-report-btn" 
    onClick={printReport}
    disabled={!selectedReport}
  >
    🖨️ Print Report
  </button>
  <button 
    className="back-to-dashboard" 
    onClick={() => navigate(`/member-dashboard/${memberId}`)}
  >
    ← Back to Dashboard
  </button>
</div>

      </div>
    </div>
  );
};

export default MemberMonthlyReport;   */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './MemberMonthlyReport.css';

const MemberMonthlyReport = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  
  const [member, setMember] = useState(null);
  const [monthlyReports, setMonthlyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  // Enhanced member data with all required fields (populated from db.json + sample data)
  const getEnhancedMemberData = (memberData) => ({
    ...memberData,
    age: new Date().getFullYear() - new Date(memberData.dob).getFullYear(),
    gender: 'Male', // Add to db.json later
    joiningDate: memberData.joinDate,
    plan: memberData.membershipId === '1' ? 'Monthly' : 'Quarterly',
    trainerAssigned: memberData.trainer
  });

  useEffect(() => {
    fetchMemberData();
  }, [memberId]);

  const fetchMemberData = async () => {
    try {
      setLoading(true);
      
      const memberRes = await fetch(`http://localhost:3001/users/${memberId}`);
      if (!memberRes.ok) throw new Error('Member not found');
      
      const memberData = await memberRes.json();
      const reportsRes = await fetch('http://localhost:3001/monthlyReports');
      const allReports = await reportsRes.json();
      
      const membershipsRes = await fetch('http://localhost:3001/memberships');
      const memberships = await membershipsRes.json();
      
      const membership = memberships.find(m => m.id === memberData.membershipId);
      
      const memberReports = allReports.filter(report => 
        String(report.memberId) === memberId
      );
      
      const enrichedMember = getEnhancedMemberData({
        ...memberData,
        plan: membership?.name || 'Monthly Plan',
        membershipStatus: memberData.membershipStatus || 'Active'
      });
      
      setMember(enrichedMember);
      setMonthlyReports(memberReports);
      
      if (memberReports.length > 0) {
        setSelectedReport(memberReports[memberReports.length - 1]);
      }
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (monthStr) => {
    if (!monthStr) return 'Unknown Month';
    const date = new Date(`${monthStr}-01`);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // ALL 11 SECTIONS DATA - Enhanced with sample data matching your requirements
  const getReportData = (report) => ({
    // 1. Member Basic Information
    memberInfo: {
      memberId: member?.id,
      name: member?.name,
      age: member?.age || 28,
      gender: member?.gender || 'Male',
      contact: member?.contact,
      email: member?.email,
      joiningDate: member?.joinDate,
      plan: member?.plan,
      trainer: member?.trainer
    },
    
    // 2. Attendance Details
    attendance: {
      month: getMonthName(report?.month),
      totalDays: report?.totalPossibleDays || 30,
      attendedDays: report?.totalAttendanceDays || 22,
      absentDays: (report?.totalPossibleDays || 30) - (report?.totalAttendanceDays || 22),
      percentage: report?.attendancePercentage || '82%'
    },
    
    // 3. Workout Performance
    workout: {
      type: 'Mixed',
      exercises: ['Bench Press', 'Squats', 'Deadlifts', 'Pull-ups', 'Treadmill'],
      frequency: '4.2/week',
      duration: '65 minutes',
      totalHours: '17.2 hours'
    },
    
    // 4. Strength Progress
    strength: {
      benchPress: { prev: '32kg', current: '40kg', improvement: '+8kg' },
      squats: { prev: '45kg', current: '55kg', improvement: '+10kg' },
      deadlift: { prev: '60kg', current: '72kg', improvement: '+12kg' },
      pushups: { prev: 12, current: 20, improvement: '+8' },
      pullups: { prev: 5, current: 8, improvement: '+3' },
      plank: { prev: '90s', current: '135s', improvement: '+45s' }
    },
    
    // 5. Body Measurements
    measurements: {
      weight: { start: '77kg', current: '75kg' },
      height: member?.height || 175,
      bmi: '24.5',
      bodyFat: { start: '20%', current: '18%' },
      muscleMass: { start: '55kg', current: '57kg' },
      chest: { start: '102cm', current: '104cm' },
      waist: { start: '86cm', current: '84cm' },
      hip: { start: '98cm', current: '97cm' },
      arm: { start: '32cm', current: '34cm' },
      thigh: { start: '55cm', current: '57cm' }
    },
    
    // 6. Cardio Performance
    cardio: {
      treadmill: '4.2km in 25min',
      running: '3km in 18min',
      cycling: '12km',
      calories: '2850 kcal',
      avgHeartRate: '145 bpm'
    },
    
    // 7. Diet & Nutrition
    diet: {
      assigned: true,
      calories: '2400 kcal/day',
      protein: '140g/day',
      adherence: 'Good'
    },
    
    // 8. Goal Tracking
    goals: {
      primary: 'Muscle Gain',
      target: '5kg muscle',
      progress: '3.2kg gained',
      completion: '64%'
    },
    
    // 9. Trainer Feedback
    feedback: {
      trainer: member?.trainer || 'Meera',
      rating: 4.2,
      strengths: 'Excellent lower body progress, consistent attendance',
      improvements: 'Increase cardio endurance',
      consistency: 'Very Good'
    },
    
    // 10. Recommendations
    recommendations: [
      'Continue strength training 4x/week',
      'Add 10min cardio warm-up daily',
      'Focus on shoulder mobility',
      'Maintain protein intake >130g/day'
    ],
    
    // 11. Report Summary
    summary: {
      attendanceScore: '82%',
      progressLevel: 'Improving',
      overallRating: '4.2/5'
    }
  });

  const generatePDFReport = async () => {
  if (!selectedReport || !member) {
    alert('Please select a monthly report first');
    return;
  }

  try {
    setLoading(true);
    
    // ✅ Target ONLY the report content (exclude sidebar)
    const reportElement = document.querySelector('.member-report-wrapper');
    
    // Hide buttons temporarily for clean PDF
    const buttons = document.querySelector('.report-actions');
    const sidebar = document.querySelector('.member-sidebar');
    
    if (buttons) buttons.style.display = 'none';
    if (sidebar) sidebar.style.position = 'absolute'; // Move sidebar out of view
    
    // ✅ Generate high-quality canvas
    const canvas = await html2canvas(reportElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: reportElement.scrollWidth,
      height: reportElement.scrollHeight,
      logging: false,
      allowTaint: true,
      scrollX: 0,
      scrollY: 0
    });

    // Restore UI
    if (buttons) buttons.style.display = '';
    if (sidebar) sidebar.style.position = 'fixed';

    // ✅ Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 190;
    const pageHeight = 277;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 20;

    // Cover page
    pdf.setFontSize(24);
    pdf.text(`${member.name} - Monthly Report`, 105, 50, { align: 'center' });
    pdf.setFontSize(14);
    pdf.text(getMonthName(selectedReport.month), 105, 70, { align: 'center' });
    pdf.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 105, 85, { align: 'center' });
    
    pdf.addPage();
    
    // Add content
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight + 20;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save
    pdf.save(`${member.name}_${getMonthName(selectedReport.month)}_Report.pdf`);
    
    setLoading(false);
    alert('✅ PDF Downloaded Successfully!');
    
  } catch (error) {
    console.error('PDF Error:', error);
    setLoading(false);
    alert('Failed to generate PDF');
  }
};

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-large"></div>
        <p>Loading comprehensive monthly report...</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="error-container">
        <h2>Member not found</h2>
        <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
      </div>
    );
  }

  const reportData = selectedReport ? getReportData(selectedReport) : null;

  return (
    <div className="member-report-container">
      {/* Video Background */}
      <div className="video-container">
        <video autoPlay loop muted playsInline>
          <source src="/videos/gym-bg.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div className="video-overlay"></div>

      {/* Sidebar */}
      <div className="member-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-avatar">{(member.name || '').charAt(0)?.toUpperCase()}</div>
          <div className="sidebar-title">
            <h3>{member.name}</h3>
            <p>Monthly Progress</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content member-report-wrapper">
        {/* 1. MEMBER BASIC INFORMATION */}
        <div className="profile-header-card">
          <h2>1. Member Basic Information</h2>
          <div className="basic-info-grid">
            <div className="info-item"><strong>Member ID:</strong> {reportData?.memberInfo.memberId}</div>
            <div className="info-item"><strong>Name:</strong> {reportData?.memberInfo.name}</div>
            <div className="info-item"><strong>Age:</strong> {reportData?.memberInfo.age}</div>
            <div className="info-item"><strong>Gender:</strong> {reportData?.memberInfo.gender}</div>
            <div className="info-item"><strong>Contact:</strong> {reportData?.memberInfo.contact}</div>
            <div className="info-item"><strong>Email:</strong> {reportData?.memberInfo.email}</div>
            <div className="info-item"><strong>Joining Date:</strong> {reportData?.memberInfo.joiningDate}</div>
            <div className="info-item"><strong>Membership:</strong> {reportData?.memberInfo.plan}</div>
            <div className="info-item"><strong>Trainer:</strong> {reportData?.memberInfo.trainer}</div>
          </div>
        </div>

        {selectedReport && reportData && (
          <>
            {/* 2. ATTENDANCE DETAILS */}
{/* 2. ATTENDANCE DETAILS - HORIZONTAL LAYOUT */}
<div className="report-section">
  <h2>2. Attendance Details</h2>
  <div className="attendance-horizontal">
    <div className="attendance-month">{reportData.attendance.month}</div>
    <div className="attendance-percentage">{reportData.attendance.percentage}</div>
    <div className="attendance-breakdown">
      <span>{reportData.attendance.attendedDays}</span>
      <span className="divider">/</span>
      <span>{reportData.attendance.totalDays}</span>
    </div>
  </div>
</div>

{/* 3. WORKOUT PERFORMANCE */}
            <div className="report-section">
              <h2>3. Workout Performance</h2>
              <div className="workout-grid">
                <div className="workout-item">
                  <strong>Type:</strong> {reportData.workout.type}
                </div>
                <div className="workout-item">
                  <strong>Exercises:</strong> {reportData.workout.exercises.join(', ')}
                </div>
                <div className="workout-item">
                  <strong>Frequency:</strong> {reportData.workout.frequency}
                </div>
                <div className="workout-item">
                  <strong>Avg Duration:</strong> {reportData.workout.duration}
                </div>
                <div className="workout-item">
                  <strong>Total Hours:</strong> {reportData.workout.totalHours}
                </div>
              </div>
            </div>

            {/* 4. STRENGTH PROGRESS */}
           {/* 4. STRENGTH PROGRESS - ✅ FIXED TABLE */}
<div className="report-section">
  <h2>4. Strength Progress</h2>
  <div className="progress-table">
    <div className="progress-table-inner">
      {/* Header */}
      <div className="table-header">
        <div className="table-cell">Exercise</div>
        <div className="table-cell">Previous</div>
        <div className="table-cell">Current</div>
        <div className="table-cell">Improvement</div>
      </div>
      
      {/* Bench Press */}
      <div className="table-row">
        <div className="table-cell"><strong>Bench Press</strong></div>
        <div className="table-cell">{reportData.strength.benchPress.prev}</div>
        <div className="table-cell">{reportData.strength.benchPress.current}</div>
        <div className="table-cell improvement">{reportData.strength.benchPress.improvement}</div>
      </div>
      
      {/* Squats */}
      <div className="table-row">
        <div className="table-cell"><strong>Squats</strong></div>
        <div className="table-cell">{reportData.strength.squats.prev}</div>
        <div className="table-cell">{reportData.strength.squats.current}</div>
        <div className="table-cell improvement">{reportData.strength.squats.improvement}</div>
      </div>
      
      {/* Deadlift */}
      <div className="table-row">
        <div className="table-cell"><strong>Deadlift</strong></div>
        <div className="table-cell">{reportData.strength.deadlift.prev}</div>
        <div className="table-cell">{reportData.strength.deadlift.current}</div>
        <div className="table-cell improvement">{reportData.strength.deadlift.improvement}</div>
      </div>
      
      {/* Pushups */}
      <div className="table-row">
        <div className="table-cell"><strong>Pushups</strong></div>
        <div className="table-cell">{reportData.strength.pushups.prev}</div>
        <div className="table-cell">{reportData.strength.pushups.current}</div>
        <div className="table-cell improvement">{reportData.strength.pushups.improvement}</div>
      </div>
    </div>
  </div>
</div>


            {/* 5-11. ALL OTHER SECTIONS (Body Measurements, Cardio, Diet, Goals, Feedback, Recommendations, Summary) */}
            <div className="report-section">
              <h2>5. Body Measurements</h2>
              <div className="measurements-grid">
                <div className="measurement-item">
                  <strong>Weight:</strong> {reportData.measurements.weight.start} → {reportData.measurements.weight.current}
                </div>
                <div className="measurement-item">
                  <strong>Body Fat:</strong> {reportData.measurements.bodyFat.start} → {reportData.measurements.bodyFat.current}
                </div>
                <div className="measurement-item"><strong>BMI:</strong> {reportData.measurements.bmi}</div>
              </div>
            </div>

            <div className="report-section">
              <h2>6. Cardio Performance</h2>
              <div className="cardio-grid">
                <div>Treadmill: {reportData.cardio.treadmill}</div>
                <div>Running: {reportData.cardio.running}</div>
                <div>Cycling: {reportData.cardio.cycling}</div>
                <div>Calories: {reportData.cardio.calories}</div>
              </div>
            </div>

            <div className="report-section">
              <h2>7. Diet & Nutrition</h2>
              <div className="diet-grid">
                <div><strong>Calories:</strong> {reportData.diet.calories}</div>
                <div><strong>Protein:</strong> {reportData.diet.protein}</div>
                <div><strong>Adherence:</strong> {reportData.diet.adherence}</div>
              </div>
            </div>

            <div className="report-section">
              <h2>8. Goal Tracking</h2>
              <div className="goal-card">
                <div><strong>{reportData.goals.primary}</strong></div>
                <div>{reportData.goals.target} → {reportData.goals.progress}</div>
                <div className="goal-progress">{reportData.goals.completion}</div>
              </div>
            </div>

            <div className="report-section">
              <h2>9. Trainer Feedback</h2>
              <div className="feedback-card">
                <div><strong>Trainer:</strong> {reportData.feedback.trainer}</div>
                <div><strong>Rating:</strong> {reportData.feedback.rating}/5</div>
                <div><em>{reportData.feedback.strengths}</em></div>
                <div><em>{reportData.feedback.improvements}</em></div>
              </div>
            </div>

            <div className="report-section">
              <h2>10. Recommendations</h2>
              <ul className="recommendations-list">
                {reportData.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>

            <div className="report-section summary-section">
              <h2>11. Report Summary</h2>
              <div className="summary-grid">
                <div className="summary-item">
                  <strong>Attendance:</strong> {reportData.summary.attendanceScore}
                </div>
                <div className="summary-item">
                  <strong>Progress Level:</strong> {reportData.summary.progressLevel}
                </div>
                <div className="summary-item">
                  <strong>Overall Rating:</strong> {reportData.summary.overallRating}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="report-actions">
          <button className="download-pdf-btn" onClick={generatePDFReport} disabled={loading || !selectedReport}>
            {loading ? '⏳ Generating...' : '📥 Download Complete PDF Report'}
          </button>
          <button className="back-to-dashboard" onClick={() => navigate(`/member-dashboard/${memberId}`)}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberMonthlyReport;

