import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const MemberMonthlyReport = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();

  const [member, setMember] = useState(null);
  const [monthlyReports, setMonthlyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  const getEnhancedMemberData = (memberData) => ({
    ...memberData,
    age: new Date().getFullYear() - new Date(memberData.dob).getFullYear(),
    gender: 'Male',
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
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getReportData = (report) => ({
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
    attendance: {
      month: getMonthName(report?.month),
      totalDays: report?.totalPossibleDays || 30,
      attendedDays: report?.totalAttendanceDays || 22,
      absentDays: (report?.totalPossibleDays || 30) - (report?.totalAttendanceDays || 22),
      percentage: report?.attendancePercentage || '82%'
    },
    workout: {
      type: 'Mixed',
      exercises: ['Bench Press', 'Squats', 'Deadlifts', 'Pull-ups', 'Treadmill'],
      frequency: '4.2/week',
      duration: '65 minutes',
      totalHours: '17.2 hours'
    },
    strength: {
      benchPress: { prev: '32kg', current: '40kg', improvement: '+8kg' },
      squats: { prev: '45kg', current: '55kg', improvement: '+10kg' },
      deadlift: { prev: '60kg', current: '72kg', improvement: '+12kg' },
      pushups: { prev: 12, current: 20, improvement: '+8' },
      pullups: { prev: 5, current: 8, improvement: '+3' },
      plank: { prev: '90s', current: '135s', improvement: '+45s' }
    },
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
    cardio: {
      treadmill: '4.2km in 25min',
      running: '3km in 18min',
      cycling: '12km',
      calories: '2850 kcal',
      avgHeartRate: '145 bpm'
    },
    diet: {
      assigned: true,
      calories: '2400 kcal/day',
      protein: '140g/day',
      adherence: 'Good'
    },
    goals: {
      primary: 'Muscle Gain',
      target: '5kg muscle',
      progress: '3.2kg gained',
      completion: '64%'
    },
    feedback: {
      trainer: member?.trainer || 'Meera',
      rating: 4.2,
      strengths: 'Excellent lower body progress, consistent attendance',
      improvements: 'Increase cardio endurance',
      consistency: 'Very Good'
    },
    recommendations: [
      'Continue strength training 4x/week',
      'Add 10min cardio warm-up daily',
      'Focus on shoulder mobility',
      'Maintain protein intake >130g/day'
    ],
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

      const reportElement = document.querySelector('.mmr-report-wrapper');
      const buttons = document.querySelector('.mmr-report-actions');
      const sidebar = document.querySelector('.mmr-sidebar');

      if (buttons) buttons.style.display = 'none';
      if (sidebar) sidebar.style.position = 'absolute';

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

      if (buttons) buttons.style.display = '';
      if (sidebar) sidebar.style.position = 'fixed';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 190;
      const pageHeight = 277;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 20;

      pdf.setFontSize(24);
      pdf.text(`${member.name} - Monthly Report`, 105, 50, { align: 'center' });
      pdf.setFontSize(14);
      pdf.text(getMonthName(selectedReport.month), 105, 70, { align: 'center' });
      pdf.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 105, 85, { align: 'center' });

      pdf.addPage();

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 20;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

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
      <>
        <style>{inlineStyles}</style>
        <div className="mmr-loading-container">
          <div className="mmr-spinner-large"></div>
          <p>Loading comprehensive monthly report...</p>
        </div>
      </>
    );
  }

  if (!member) {
    return (
      <>
        <style>{inlineStyles}</style>
        <div className="mmr-error-container">
          <h2>Member not found</h2>
          <button onClick={() => navigate(-1)} className="mmr-back-btn">← Back</button>
        </div>
      </>
    );
  }

  const reportData = selectedReport ? getReportData(selectedReport) : null;

  return (
    <>
      <style>{inlineStyles}</style>

      <div className="mmr-container">
        {/* Video Background */}
        <div className="mmr-video-container">
          <video autoPlay loop muted playsInline>
            <source src="/videos/gym-bg.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="mmr-video-overlay"></div>

        {/* Sidebar */}
        <div className="mmr-sidebar">
          <div className="mmr-sidebar-header">
            <div className="mmr-sidebar-avatar">{(member.name || '').charAt(0)?.toUpperCase()}</div>
            <div className="mmr-sidebar-title">
              <h3>{member.name}</h3>
              <p>Monthly Progress</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mmr-main-content mmr-report-wrapper">

          {/* 1. MEMBER BASIC INFORMATION */}
          <div className="mmr-profile-header-card">
            <h2>1. Member Basic Information</h2>
            <div className="mmr-basic-info-grid">
              <div className="mmr-info-item"><strong>Member ID:</strong> {reportData?.memberInfo.memberId}</div>
              <div className="mmr-info-item"><strong>Name:</strong> {reportData?.memberInfo.name}</div>
              <div className="mmr-info-item"><strong>Age:</strong> {reportData?.memberInfo.age}</div>
              <div className="mmr-info-item"><strong>Gender:</strong> {reportData?.memberInfo.gender}</div>
              <div className="mmr-info-item"><strong>Contact:</strong> {reportData?.memberInfo.contact}</div>
              <div className="mmr-info-item"><strong>Email:</strong> {reportData?.memberInfo.email}</div>
              <div className="mmr-info-item"><strong>Joining Date:</strong> {reportData?.memberInfo.joiningDate}</div>
              <div className="mmr-info-item"><strong>Membership:</strong> {reportData?.memberInfo.plan}</div>
              <div className="mmr-info-item"><strong>Trainer:</strong> {reportData?.memberInfo.trainer}</div>
            </div>
          </div>

          {selectedReport && reportData && (
            <>
              {/* 2. ATTENDANCE DETAILS */}
              <div className="mmr-report-section">
                <h2>2. Attendance Details</h2>
                <div className="mmr-attendance-horizontal">
                  <div className="mmr-attendance-month">{reportData.attendance.month}</div>
                  <div className="mmr-attendance-percentage">{reportData.attendance.percentage}</div>
                  <div className="mmr-attendance-breakdown">
                    <span>{reportData.attendance.attendedDays}</span>
                    <span className="mmr-divider">/</span>
                    <span>{reportData.attendance.totalDays}</span>
                  </div>
                </div>
              </div>

              {/* 3. WORKOUT PERFORMANCE */}
              <div className="mmr-report-section">
                <h2>3. Workout Performance</h2>
                <div className="mmr-workout-grid">
                  <div className="mmr-workout-item"><strong>Type:</strong> {reportData.workout.type}</div>
                  <div className="mmr-workout-item"><strong>Exercises:</strong> {reportData.workout.exercises.join(', ')}</div>
                  <div className="mmr-workout-item"><strong>Frequency:</strong> {reportData.workout.frequency}</div>
                  <div className="mmr-workout-item"><strong>Avg Duration:</strong> {reportData.workout.duration}</div>
                  <div className="mmr-workout-item"><strong>Total Hours:</strong> {reportData.workout.totalHours}</div>
                </div>
              </div>

              {/* 4. STRENGTH PROGRESS */}
              <div className="mmr-report-section">
                <h2>4. Strength Progress</h2>
                <div className="mmr-progress-table">
                  <div className="mmr-progress-table-inner">
                    <div className="mmr-table-header">
                      <div className="mmr-table-cell">Exercise</div>
                      <div className="mmr-table-cell">Previous</div>
                      <div className="mmr-table-cell">Current</div>
                      <div className="mmr-table-cell">Improvement</div>
                    </div>
                    <div className="mmr-table-row">
                      <div className="mmr-table-cell"><strong>Bench Press</strong></div>
                      <div className="mmr-table-cell">{reportData.strength.benchPress.prev}</div>
                      <div className="mmr-table-cell">{reportData.strength.benchPress.current}</div>
                      <div className="mmr-table-cell mmr-improvement">{reportData.strength.benchPress.improvement}</div>
                    </div>
                    <div className="mmr-table-row">
                      <div className="mmr-table-cell"><strong>Squats</strong></div>
                      <div className="mmr-table-cell">{reportData.strength.squats.prev}</div>
                      <div className="mmr-table-cell">{reportData.strength.squats.current}</div>
                      <div className="mmr-table-cell mmr-improvement">{reportData.strength.squats.improvement}</div>
                    </div>
                    <div className="mmr-table-row">
                      <div className="mmr-table-cell"><strong>Deadlift</strong></div>
                      <div className="mmr-table-cell">{reportData.strength.deadlift.prev}</div>
                      <div className="mmr-table-cell">{reportData.strength.deadlift.current}</div>
                      <div className="mmr-table-cell mmr-improvement">{reportData.strength.deadlift.improvement}</div>
                    </div>
                    <div className="mmr-table-row">
                      <div className="mmr-table-cell"><strong>Pushups</strong></div>
                      <div className="mmr-table-cell">{reportData.strength.pushups.prev}</div>
                      <div className="mmr-table-cell">{reportData.strength.pushups.current}</div>
                      <div className="mmr-table-cell mmr-improvement">{reportData.strength.pushups.improvement}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. BODY MEASUREMENTS */}
              <div className="mmr-report-section">
                <h2>5. Body Measurements</h2>
                <div className="mmr-measurements-grid">
                  <div className="mmr-measurement-item">
                    <strong>Weight:</strong> {reportData.measurements.weight.start} → {reportData.measurements.weight.current}
                  </div>
                  <div className="mmr-measurement-item">
                    <strong>Body Fat:</strong> {reportData.measurements.bodyFat.start} → {reportData.measurements.bodyFat.current}
                  </div>
                  <div className="mmr-measurement-item"><strong>BMI:</strong> {reportData.measurements.bmi}</div>
                </div>
              </div>

              {/* 6. CARDIO PERFORMANCE */}
              <div className="mmr-report-section">
                <h2>6. Cardio Performance</h2>
                <div className="mmr-cardio-grid">
                  <div className="mmr-grid-item">Treadmill: {reportData.cardio.treadmill}</div>
                  <div className="mmr-grid-item">Running: {reportData.cardio.running}</div>
                  <div className="mmr-grid-item">Cycling: {reportData.cardio.cycling}</div>
                  <div className="mmr-grid-item">Calories: {reportData.cardio.calories}</div>
                </div>
              </div>

              {/* 7. DIET & NUTRITION */}
              <div className="mmr-report-section">
                <h2>7. Diet & Nutrition</h2>
                <div className="mmr-diet-grid">
                  <div className="mmr-grid-item"><strong>Calories:</strong> {reportData.diet.calories}</div>
                  <div className="mmr-grid-item"><strong>Protein:</strong> {reportData.diet.protein}</div>
                  <div className="mmr-grid-item"><strong>Adherence:</strong> {reportData.diet.adherence}</div>
                </div>
              </div>

              {/* 8. GOAL TRACKING */}
              <div className="mmr-report-section">
                <h2>8. Goal Tracking</h2>
                <div className="mmr-goal-card">
                  <div><strong>{reportData.goals.primary}</strong></div>
                  <div>{reportData.goals.target} → {reportData.goals.progress}</div>
                  <div className="mmr-goal-progress">{reportData.goals.completion}</div>
                </div>
              </div>

              {/* 9. TRAINER FEEDBACK */}
              <div className="mmr-report-section">
                <h2>9. Trainer Feedback</h2>
                <div className="mmr-feedback-card">
                  <div><strong>Trainer:</strong> {reportData.feedback.trainer}</div>
                  <div><strong>Rating:</strong> {reportData.feedback.rating}/5</div>
                  <div><em>{reportData.feedback.strengths}</em></div>
                  <div><em>{reportData.feedback.improvements}</em></div>
                </div>
              </div>

              {/* 10. RECOMMENDATIONS */}
              <div className="mmr-report-section">
                <h2>10. Recommendations</h2>
                <ul className="mmr-recommendations-list">
                  {reportData.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>

              {/* 11. REPORT SUMMARY */}
              <div className="mmr-report-section mmr-summary-section">
                <h2>11. Report Summary</h2>
                <div className="mmr-summary-grid">
                  <div className="mmr-summary-item"><strong>Attendance:</strong> {reportData.summary.attendanceScore}</div>
                  <div className="mmr-summary-item"><strong>Progress Level:</strong> {reportData.summary.progressLevel}</div>
                  <div className="mmr-summary-item"><strong>Overall Rating:</strong> {reportData.summary.overallRating}</div>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="mmr-report-actions">
            <button className="mmr-download-pdf-btn" onClick={generatePDFReport} disabled={loading || !selectedReport}>
              {loading ? '⏳ Generating...' : '📥 Download Complete PDF Report'}
            </button>
            <button className="mmr-back-to-dashboard" onClick={() => navigate(`/member-dashboard/${memberId}`)}>
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const inlineStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

  :root {
    --mmr-primary-gradient: linear-gradient(135deg, #3b82f6 0%, #1e40af 50%, #1e3a8a 100%);
    --mmr-success-green: #10b981;
    --mmr-warning-orange: #f59e0b;
    --mmr-danger-red: #ef4444;
    --mmr-card-white: #ffffff;
    --mmr-text-dark: #1e293b;
    --mmr-text-gray: #64748b;
    --mmr-border-light: rgba(59, 130, 246, 0.2);
  }

  /* Video Background */
  .mmr-video-container {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -3;
  }
  .mmr-video-container video { width: 100%; height: 100%; object-fit: cover; }
  .mmr-video-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(26, 26, 29, 0.7); z-index: -2;
  }

  /* Container */
  .mmr-container {
    display: flex;
    min-height: 100vh;
    font-family: 'Poppins', sans-serif;
  }

  /* Sidebar */
  .mmr-sidebar {
    width: 280px;
    background: linear-gradient(180deg, #1a1a1d 0%, #2d2d37 100%);
    border-right: 1px solid rgba(59, 130, 246, 0.3);
    position: fixed; height: 100vh; left: 0; top: 0; z-index: 100;
    box-shadow: 4px 0 30px rgba(59, 130, 246, 0.2);
  }
  .mmr-sidebar-header {
    padding: 2rem 1.5rem;
    border-bottom: 1px solid rgba(59, 130, 246, 0.3);
    color: white;
  }
  .mmr-sidebar-avatar {
    width: 60px; height: 60px; border-radius: 50%;
    background: var(--mmr-primary-gradient); color: white;
    display: flex; align-items: center; justify-content: center;
    font-size: 2rem; font-weight: 800; margin: 0 auto 1rem;
  }
  .mmr-sidebar-title h3 {
    color: white; font-size: 1.4rem; font-weight: 700;
    margin-bottom: 0.5rem; text-align: center;
  }
  .mmr-sidebar-title p { color: #94a3b8; font-size: 0.95rem; text-align: center; margin: 0; }

  /* Main Content */
  .mmr-main-content {
    margin-left: 280px; padding: 2rem; min-height: 100vh;
    background: rgba(255, 255, 255, 0.98);
    color: var(--mmr-text-dark);
    font-family: 'Poppins', sans-serif;
    flex: 1;
  }

  /* Loading & Error */
  .mmr-loading-container, .mmr-error-container {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; min-height: 100vh; gap: 1rem;
    font-family: 'Poppins', sans-serif; color: white;
  }
  .mmr-spinner-large {
    width: 50px; height: 50px; border-radius: 50%;
    border: 4px solid rgba(59, 130, 246, 0.3);
    border-top-color: #3b82f6;
    animation: mmrSpin 0.8s linear infinite;
  }
  @keyframes mmrSpin { to { transform: rotate(360deg); } }
  .mmr-back-btn {
    padding: 0.75rem 1.5rem; border-radius: 10px;
    background: var(--mmr-primary-gradient); color: white;
    border: none; cursor: pointer; font-size: 1rem;
  }

  /* 1. Member Basic Info Card */
  .mmr-profile-header-card {
    background: var(--mmr-card-white);
    border-radius: 24px; padding: 3rem; margin-bottom: 2rem;
    border: 1px solid var(--mmr-border-light);
    box-shadow: 0 25px 80px rgba(59, 130, 246, 0.15);
    position: relative;
  }
  .mmr-profile-header-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 6px;
    background: var(--mmr-primary-gradient); border-radius: 22px 22px 0 0;
  }
  .mmr-profile-header-card h2 {
    font-size: 2rem; font-weight: 800;
    background: var(--mmr-primary-gradient); -webkit-background-clip: text;
    -webkit-text-fill-color: transparent; background-clip: text;
    margin-bottom: 2rem; text-align: center;
  }
  .mmr-basic-info-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem; margin-top: 1rem;
  }
  .mmr-info-item {
    padding: 1rem; background: rgba(248, 250, 252, 0.8);
    border-radius: 12px; border-left: 4px solid #3b82f6;
    font-weight: 500;
  }

  /* Report Sections */
  .mmr-report-section {
    background: var(--mmr-card-white);
    border-radius: 24px; padding: 3rem; margin-bottom: 2rem;
    border: 1px solid var(--mmr-border-light);
    box-shadow: 0 25px 80px rgba(59, 130, 246, 0.15);
    position: relative;
  }
  .mmr-report-section h2 {
    font-size: 2rem; font-weight: 800;
    background: var(--mmr-primary-gradient); -webkit-background-clip: text;
    -webkit-text-fill-color: transparent; background-clip: text;
    margin-bottom: 2rem; text-align: center;
  }

  /* Attendance Horizontal */
  .mmr-attendance-horizontal {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    padding: 1.5rem;
    background: linear-gradient(145deg, #f8fafc, #e2e8f0);
    border-radius: 16px;
    border: 2px solid var(--mmr-border-light);
    max-width: 450px;
    margin: 1.5rem auto 0;
    box-shadow: 0 10px 30px rgba(59, 130, 246, 0.1);
  }
  .mmr-attendance-month {
    font-size: 1rem; color: var(--mmr-text-gray); font-weight: 600; white-space: nowrap;
  }
  .mmr-attendance-percentage {
    font-size: 2.2rem; font-weight: 800; color: var(--mmr-success-green); margin: 0 1rem;
  }
  .mmr-attendance-breakdown {
    display: flex; align-items: center; gap: 0.3rem;
    font-size: 1.3rem; font-weight: 700; color: var(--mmr-text-dark);
  }
  .mmr-divider { font-size: 1.2rem; color: var(--mmr-text-gray); font-weight: 400; }

  /* Workout Grid */
  .mmr-workout-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem; margin-top: 2rem;
  }
  .mmr-workout-item {
    padding: 1.5rem; background: rgba(248, 250, 252, 0.8);
    border-radius: 12px; border-left: 4px solid #3b82f6; font-weight: 500;
  }

  /* Progress Table */
  .mmr-progress-table {
    width: 100%; overflow-x: auto; margin-top: 2rem;
    border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  }
  .mmr-progress-table-inner {
    display: table; width: 100%; min-width: 600px;
  }
  .mmr-table-header, .mmr-table-row {
    display: table-row; width: 100%;
  }
  .mmr-table-cell {
    display: table-cell; padding: 1.5rem 1rem;
    text-align: left; vertical-align: middle;
    border-bottom: 1px solid rgba(59, 130, 246, 0.1);
  }
  .mmr-table-header .mmr-table-cell {
    background: linear-gradient(135deg, #3b82f6 0%, #1e40af 50%, #1e3a8a 100%) !important;
    color: white !important; font-weight: 700;
    text-transform: uppercase; font-size: 0.85rem;
    letter-spacing: 0.5px; padding: 1.2rem 1rem;
  }
  .mmr-table-row:nth-child(even) .mmr-table-cell { background: rgba(248, 250, 252, 0.8); }
  .mmr-table-row:hover .mmr-table-cell { background: rgba(59, 130, 246, 0.08); }
  .mmr-improvement { font-weight: 800; color: var(--mmr-success-green); text-align: center; }

  /* Measurements Grid */
  .mmr-measurements-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem; margin-top: 2rem;
  }
  .mmr-measurement-item {
    padding: 1.5rem; background: rgba(248, 250, 252, 0.8);
    border-radius: 12px; border-left: 4px solid #3b82f6; font-weight: 500;
  }

  /* Cardio & Diet Grids */
  .mmr-cardio-grid, .mmr-diet-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem; margin-top: 2rem;
  }
  .mmr-grid-item {
    padding: 1.5rem; background: rgba(248, 250, 252, 0.8);
    border-radius: 12px; border-left: 4px solid #3b82f6; font-weight: 500;
  }

  /* Goal Card */
  .mmr-goal-card {
    background: linear-gradient(145deg, #f0f9ff, #e0f2fe);
    border: 2px solid #3b82f6;
    border-radius: 20px; padding: 3rem; text-align: center; margin-top: 2rem;
  }
  .mmr-goal-progress {
    font-size: 3rem; font-weight: 800; color: var(--mmr-success-green); margin-top: 1rem;
  }

  /* Feedback Card */
  .mmr-feedback-card {
    background: linear-gradient(145deg, #f8fafc, #f1f5f9);
    border-radius: 20px; padding: 2.5rem; margin-top: 2rem;
    display: flex; flex-direction: column; gap: 0.75rem;
  }
  .mmr-feedback-card em { color: var(--mmr-warning-orange); font-style: italic; }

  /* Recommendations */
  .mmr-recommendations-list { margin-top: 2rem; padding-left: 0; list-style: none; }
  .mmr-recommendations-list li {
    padding: 1rem 1.5rem; margin-bottom: 1rem;
    background: rgba(16, 185, 129, 0.1);
    border-radius: 12px; border-left: 4px solid var(--mmr-success-green); font-weight: 500;
  }

  /* Summary Section */
  .mmr-summary-section {
    background: linear-gradient(145deg, #fef3c7, #fde68a) !important;
    border: 2px solid var(--mmr-warning-orange) !important;
  }
  .mmr-summary-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;
  }
  .mmr-summary-item {
    padding: 1.5rem; background: rgba(255, 255, 255, 0.6);
    border-radius: 12px; border-left: 4px solid var(--mmr-warning-orange); font-weight: 500;
  }

  /* Action Buttons */
  .mmr-report-actions {
    display: flex; gap: 1rem; justify-content: center;
    margin-top: 3rem; padding: 2rem;
    background: var(--mmr-card-white);
    border-radius: 24px;
    box-shadow: 0 25px 80px rgba(59, 130, 246, 0.15);
  }
  .mmr-download-pdf-btn {
    padding: 1.2rem 3rem; font-size: 1.1rem; font-weight: 600;
    border: none; border-radius: 16px; cursor: pointer;
    transition: all 0.3s ease;
    background: linear-gradient(135deg, #3b82f6 0%, #1e40af 50%, #1e3a8a 100%); color: white;
    font-family: 'Poppins', sans-serif;
  }
  .mmr-download-pdf-btn:hover:not(:disabled) {
    transform: translateY(-3px); box-shadow: 0 20px 40px rgba(59, 130, 246, 0.4);
  }
  .mmr-download-pdf-btn:disabled { opacity: 0.65; cursor: not-allowed; }
  .mmr-back-to-dashboard {
    padding: 1.2rem 3rem; font-size: 1.1rem; font-weight: 600;
    border: none; border-radius: 16px; cursor: pointer;
    transition: all 0.3s ease;
    background: #6b7280; color: white;
    font-family: 'Poppins', sans-serif;
  }
  .mmr-back-to-dashboard:hover { background: #4b5563; }

  /* Responsive */
  @media (max-width: 1024px) {
    .mmr-sidebar {
      width: 100%; max-width: 100%; position: relative;
      height: auto; box-shadow: none; border-right: none; margin-bottom: 1rem;
    }
    .mmr-main-content { margin-left: 0; padding: 1.5rem; }
    .mmr-report-actions { flex-direction: column; align-items: stretch; }
    .mmr-download-pdf-btn, .mmr-back-to-dashboard { width: 100%; padding: 1rem; }
    .mmr-basic-info-grid, .mmr-summary-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 768px) {
    .mmr-sidebar { display: none; }
    .mmr-main-content { margin-left: 0; padding: 0.75rem; }
    .mmr-profile-header-card, .mmr-report-section { padding: 2rem 1.5rem; }
    .mmr-report-section h2, .mmr-profile-header-card h2 { font-size: 1.5rem; }
    .mmr-report-actions { flex-direction: column; }
    .mmr-attendance-horizontal {
      flex-direction: column; text-align: center; gap: 0.8rem; max-width: 300px;
    }
    .mmr-attendance-percentage { margin: 0; order: -1; }
    .mmr-progress-table-inner { min-width: 320px; }
    .mmr-table-cell { padding: 1rem 0.8rem; font-size: 0.9rem; }
  }
`;

export default MemberMonthlyReport;
