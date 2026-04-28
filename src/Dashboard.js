import React, { useState, useEffect } from "react";
import { db, auth } from './firebase';
import { doc, getDoc, collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { User, BookOpen, Clock, CreditCard, LayoutDashboard, LogOut, Menu, X, Bell } from 'lucide-react';
import FeeDetails from './FeeDetails';
import Profile from './Profile';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [readNotifs, setReadNotifs] = useState(() => {
    const saved = localStorage.getItem('readNotifs');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedNotif, setSelectedNotif] = useState(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !readNotifs.includes(n.id)).length;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "students", user.email);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) setStudentData(docSnap.data());

          const q = query(collection(db, "notifications"), orderBy("timestamp", "desc"));
          onSnapshot(q, (snapshot) => {
            setNotifications(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
          });
        } catch (err) { console.error(err); }
      } else { navigate("/"); }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try { await signOut(auth); navigate("/"); }
    catch (err) { console.error(err); }
  };

  const handleNav = (tab) => { setActiveTab(tab); setSidebarOpen(false); };

  const handleNotifClick = (notif) => {
    setSelectedNotif(notif);
    const updated = [...new Set([...readNotifs, notif.id])];
    setReadNotifs(updated);
    localStorage.setItem('readNotifs', JSON.stringify(updated));
  };

  // ✅ Helper: slot ko normalize karo — string ya object dono handle karo
  const parseSlot = (ci) => {
    if (!ci) return { subject:'', time:'', room:'' };
    // New object format
    if (typeof ci === 'object' && !Array.isArray(ci)) {
      return {
        subject: ci.subject || '',
        time:    ci.time    || '',
        room:    ci.room    || '',
      };
    }
    // Old string format: "Subject | Time | Room"
    const clean = String(ci).replace(/^"+|"+$/g, '').trim();
    const parts = clean.split('|');
    return {
      subject: parts[0]?.trim() || '',
      time:    parts[1]?.trim() || '',
      room:    parts[2]?.trim() || '',
    };
  };

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh' }}>
      <h2>Loading Profile...</h2>
    </div>
  );

  const ProgressBar = ({ percent }) => (
    <div style={{ width:'100%', backgroundColor:'#e8eaf6', height:'8px', borderRadius:'10px', marginTop:'8px' }}>
      <div style={{ width:`${percent}%`, backgroundColor: percent < 60 ? '#f44336' : '#4caf50', height:'100%', borderRadius:'10px', transition:'0.5s' }} />
    </div>
  );

  const navItems = [
    { tab:'dashboard',  Icon:LayoutDashboard, label:'Dashboard'  },
    { tab:'courses',    Icon:BookOpen,         label:'My Courses' },
    { tab:'timetable',  Icon:Clock,            label:'Time Table' },
    { tab:'attendance', Icon:User,             label:'Attendance' },
    { tab:'fee',        Icon:CreditCard,       label:'Fee Details'},
    { tab:'profile',    Icon:User,             label:'My Profile' },
  ];

  return (
    <>
      <style>{`
        .dp-shell { position:fixed; inset:0; display:flex; font-family:Arial,sans-serif; background:#f0f2f5; }
        .dp-sidebar { width:240px; flex-shrink:0; background:#1a237e; color:white; display:flex; flex-direction:column; height:100%; overflow-y:auto; z-index:999; }
        .dp-logo { padding:22px 20px; font-size:20px; font-weight:bold; border-bottom:2px solid #283593; display:flex; justify-content:space-between; align-items:center; }
        .dp-close { display:none; background:none; border:none; color:white; cursor:pointer; }
        .dp-nav { padding:14px 20px; display:flex; align-items:center; gap:14px; cursor:pointer; border-bottom:1px solid #283593; font-size:14px; }
        .dp-nav:hover, .dp-nav.active { background:#283593; }
        .dp-overlay { display:none; }
        .dp-hamburger { display:none; background:none; border:1px solid #ddd; border-radius:8px; padding:7px; cursor:pointer; align-items:center; }
        .dp-uinfo { text-align:right; }
        .dp-avatar { width:40px; height:40px; border-radius:50%; border:2px solid #1a237e; object-fit:cover; cursor:pointer; }
        .dp-header { height:64px; flex-shrink:0; background:white; display:flex; align-items:center; justify-content:space-between; padding:0 24px; box-shadow:0 2px 6px rgba(0,0,0,0.1); gap:12px; }
        .dp-body { flex:1; overflow-y:auto; padding:24px; }
        .dp-cards { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
        .dp-card { background:white; padding:18px; border-radius:10px; box-shadow:0 4px 6px rgba(0,0,0,0.05); border-left:5px solid #1a237e; }
        .dp-main { flex:1; display:flex; flex-direction:column; min-width:0; height:100%; overflow:hidden; }
        .notif-card { padding:14px; margin-bottom:10px; background:#f8f9ff; border-radius:12px; border-left:4px solid #1a237e; cursor:pointer; transition:0.2s; }
        .notif-card:hover { background:#e8eaf6; transform:translateY(-1px); }
        .notif-card.unread { border-left:4px solid #f44336; background:#fff8f8; }
        @media (max-width:860px) {
          .dp-sidebar { position:fixed; top:0; left:0; bottom:0; transform:translateX(-240px); transition:transform 0.3s ease; }
          .dp-sidebar.open { transform:translateX(0); }
          .dp-overlay.open { display:block; position:fixed; top:0; left:240px; right:0; bottom:0; background:rgba(0,0,0,0.6); z-index:998; }
          .dp-hamburger { display:flex; }
          .dp-close { display:block; }
          .dp-uinfo { display:none; }
          .dp-header { height:56px; padding:0 14px; }
          .dp-body { padding:14px; }
          .dp-cards { grid-template-columns:repeat(2,1fr); gap:10px; }
        }
        @media (max-width:400px) { .dp-cards { grid-template-columns:1fr; } }
      `}</style>

      <div className="dp-overlay" onClick={() => setSidebarOpen(false)} style={{ display: sidebarOpen ? undefined : 'none' }} />

      <div className="dp-shell">
        {/* SIDEBAR */}
        <div className={`dp-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="dp-logo">
            Student Portal
            <button className="dp-close" onClick={() => setSidebarOpen(false)}><X size={18}/></button>
          </div>
          <div style={{ flex:1 }}>
            {navItems.map(({ tab, Icon, label }) => (
              <div key={tab} className={`dp-nav ${activeTab===tab?'active':''}`} onClick={() => handleNav(tab)}>
                <Icon size={18}/> {label}
              </div>
            ))}
          </div>
          <div style={{ borderTop:'1px solid #283593', padding:'10px 0' }}>
            <div className="dp-nav" onClick={handleLogout} style={{ color:'#ff8a80', borderBottom:'none' }}>
              <LogOut size={18}/> Logout
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div className="dp-main">
          <header className="dp-header">
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <button className="dp-hamburger" onClick={() => setSidebarOpen(true)}><Menu size={20}/></button>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'14px', flexShrink:0 }}>
              <div className="dp-uinfo">
                <div style={{ fontWeight:'bold', fontSize:'14px' }}>{studentData?.name}</div>
                <div style={{ fontSize:'12px', color:'#666' }}>{studentData?.regNo}</div>
              </div>
              <div style={{ position:'relative', cursor:'pointer' }} onClick={() => handleNav('notifications')}>
                <Bell size={22} color="#1a237e"/>
                {unreadCount > 0 && (
                  <span style={{ position:'absolute', top:'-6px', right:'-6px', background:'red', color:'white', borderRadius:'50%', width:'18px', height:'18px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:'bold' }}>
                    {unreadCount}
                  </span>
                )}
              </div>
              <img
                src={studentData?.profilePic || studentData?.['profilePic '] || "https://via.placeholder.com/150"}
                className="dp-avatar" alt="profile"
                onClick={() => handleNav('profile')}
              />
            </div>
          </header>

          <div className="dp-body">

            {/* PROFILE */}
            {activeTab === 'profile' && <Profile studentData={studentData} />}

            {/* NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div style={{ background:'white', padding:'22px', borderRadius:'15px' }}>
                {selectedNotif ? (
                  <>
                    <button onClick={() => setSelectedNotif(null)}
                      style={{ display:'flex', alignItems:'center', gap:'6px', color:'#1a237e', border:'1px solid #1a237e', background:'none', cursor:'pointer', fontSize:'14px', padding:'6px 14px', borderRadius:'8px', marginBottom:'20px' }}>
                      ← Back
                    </button>
                    <div style={{ padding:'22px', background:'#f8f9ff', borderRadius:'12px', borderLeft:'4px solid #1a237e' }}>
                      <h2 style={{ color:'#1a237e', marginTop:0 }}>📢 {selectedNotif.title}</h2>
                      <p style={{ fontSize:'15px', color:'#444', lineHeight:'1.7' }}>{selectedNotif.message}</p>
                      <div style={{ fontSize:'12px', color:'#999', marginTop:'16px' }}>
                        🕐 {selectedNotif.timestamp?.toDate().toLocaleDateString('en-PK', { year:'numeric', month:'long', day:'numeric' })}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 style={{ color:'#1a237e', marginTop:0, marginBottom:'20px', display:'flex', alignItems:'center', gap:'10px' }}>
                      <Bell size={24} color="#1a237e"/> Announcements
                    </h2>
                    {notifications.length > 0 ? notifications.map(n => (
                      <div key={n.id} className={`notif-card ${!readNotifs.includes(n.id) ? 'unread' : ''}`} onClick={() => handleNotifClick(n)}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <div style={{ fontWeight:'bold', fontSize:'14px', color:'#1a237e' }}>📢 {n.title}</div>
                          {!readNotifs.includes(n.id) && <span style={{ background:'red', color:'white', borderRadius:'10px', padding:'2px 8px', fontSize:'10px', fontWeight:'bold' }}>NEW</span>}
                        </div>
                        <p style={{ fontSize:'12px', color:'#666', margin:'6px 0 0', lineHeight:'1.4' }}>
                          {n.message?.length > 80 ? n.message.substring(0,80)+'...' : n.message}
                        </p>
                        <div style={{ fontSize:'10px', color:'#999', marginTop:'6px' }}>
                          🕐 {n.timestamp?.toDate().toLocaleDateString('en-PK', { year:'numeric', month:'long', day:'numeric' })}
                        </div>
                      </div>
                    )) : (
                      <div style={{ padding:'40px', textAlign:'center', color:'#999' }}>
                        <Bell size={40} style={{ marginBottom:'10px', opacity:0.3 }}/>
                        <p>No announcements yet.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* DASHBOARD */}
            {activeTab==='dashboard' && (<>
              <div className="dp-cards">
                {[
                  { label:'SEMESTER',   value:studentData?.semester,        color:'#333'    },
                  { label:'TOTAL CGPA', value:studentData?.gpa,             color:'#3f51b5' },
                  { label:'ATTENDANCE', value:`${studentData?.attendance}%`, color:'#4caf50', bar:true },
                  {
                    label:'FEE STATUS',
                    value: studentData?.feeHistory?.some(f => f.status?.toLowerCase()==='pending') ? 'Pending' : 'Paid',
                    color: studentData?.feeHistory?.some(f => f.status?.toLowerCase()==='pending') ? 'red' : 'green'
                  },
                ].map(({ label, value, color, bar }) => (
                  <div key={label} className="dp-card">
                    <p style={{ color:'#666', fontSize:'12px', margin:'0 0 6px' }}>{label}</p>
                    <h3 style={{ color, margin:0 }}>{value}</h3>
                    {bar && <ProgressBar percent={studentData?.attendance}/>}
                  </div>
                ))}
              </div>

              <div style={{ background:'white', padding:'20px', borderRadius:'10px', marginTop:'16px' }}>
                <h4 style={{ borderBottom:'1px solid #eee', paddingBottom:'10px', margin:'0 0 12px' }}>Quick Course Links</h4>
                <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
                  {studentData?.courses?.map((c,i) => (
                    <span key={i} onClick={() => { setSelectedCourse(c); setActiveTab('courses'); }}
                      style={{ padding:'9px 16px', background:'#e8eaf6', color:'#1a237e', borderRadius:'20px', fontSize:'13px', fontWeight:'bold', cursor:'pointer' }}>
                      {c.name} (Click for Detail)
                    </span>
                  ))}
                </div>
              </div>

              {notifications.length > 0 && (
                <div style={{ background:'white', padding:'20px', borderRadius:'10px', marginTop:'16px' }}>
                  <h4 style={{ borderBottom:'1px solid #eee', paddingBottom:'10px', margin:'0 0 12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ display:'flex', alignItems:'center', gap:'8px' }}><Bell size={16} color="#1a237e"/> Latest Announcements</span>
                    <span onClick={() => handleNav('notifications')} style={{ fontSize:'12px', color:'#1a237e', cursor:'pointer', fontWeight:'normal' }}>View All →</span>
                  </h4>
                  {notifications.slice(0,2).map(n => (
                    <div key={n.id} className={`notif-card ${!readNotifs.includes(n.id) ? 'unread' : ''}`}
                      onClick={() => { handleNotifClick(n); handleNav('notifications'); }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div style={{ fontWeight:'bold', fontSize:'13px', color:'#1a237e' }}>📢 {n.title}</div>
                        {!readNotifs.includes(n.id) && <span style={{ background:'red', color:'white', borderRadius:'10px', padding:'2px 8px', fontSize:'10px', fontWeight:'bold' }}>NEW</span>}
                      </div>
                      <p style={{ fontSize:'12px', color:'#666', margin:'5px 0 0' }}>
                        {n.message?.length > 60 ? n.message.substring(0,60)+'...' : n.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>)}

            {/* COURSES */}
            {activeTab==='courses' && (
              <div style={{ background:'white', padding:'22px', borderRadius:'15px' }}>
                <h2 style={{ color:'#1a237e', marginBottom:'18px', marginTop:0 }}>Course Analytics</h2>
                {selectedCourse ? (
                  <div style={{ padding:'18px', background:'#f8f9ff', borderRadius:'12px', border:'2px solid #3f51b5' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'8px' }}>
                      <h3 style={{ margin:0 }}>{selectedCourse.name}</h3>
                      <button onClick={() => { setSelectedCourse(null); setActiveTab('dashboard'); }}
                        style={{ display:'flex', alignItems:'center', gap:'6px', color:'#1a237e', border:'1px solid #1a237e', background:'none', cursor:'pointer', fontSize:'14px', padding:'6px 14px', borderRadius:'8px' }}>
                        ← Back
                      </button>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginTop:'14px' }}>
                      <div>
                        <p style={{ marginBottom:'8px' }}><strong>Instructor:</strong> {selectedCourse.instructor}</p>
                        <p style={{ marginBottom:'8px' }}><strong>Credit Hours:</strong> {selectedCourse.creditHours || selectedCourse.credits || '—'}</p>
                        <p><strong>Status:</strong>{' '}
                          <span style={{
                            color: selectedCourse.status?.toLowerCase()==='excellent' ? '#4caf50' :
                                   selectedCourse.status?.toLowerCase()==='good' ? '#059669' :
                                   selectedCourse.status?.toLowerCase()==='poor' ? '#f44336' : '#1a237e',
                            fontWeight:'bold'
                          }}>
                            {selectedCourse.status}
                          </span>
                        </p>
                      </div>
                      <div style={{ textAlign:'center', background:'white', padding:'14px', borderRadius:'10px' }}>
                        <p style={{ marginBottom:'4px' }}>Course Attendance</p>
                        <h2 style={{ color:'#4caf50' }}>{selectedCourse.attendance||'80'}%</h2>
                        <ProgressBar percent={selectedCourse.attendance||80}/>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding:'40px', textAlign:'center', color:'#999' }}>
                    <BookOpen size={40} style={{ marginBottom:'10px' }}/>
                    <p>Please select a course from the Dashboard to see its details.</p>
                  </div>
                )}
              </div>
            )}

            {/* TIMETABLE ✅ FIXED */}
            {activeTab==='timetable' && (
              <div style={{ background:'white', padding:'22px', borderRadius:'15px' }}>
                <h2 style={{ color:'#1a237e', marginTop:0, marginBottom:'20px', display:'flex', alignItems:'center', gap:'10px', borderBottom:'2px solid #f0f2f5', paddingBottom:'14px' }}>
                  <Clock size={24} color="#1a237e"/> Academic Weekly Schedule
                </h2>
                {['monday','tuesday','wednesday','thursday','friday'].map(day => {
                  // ✅ Support both "timetable" and "time table" (with space)
                  const dayData = studentData?.timetable?.[day] || studentData?.['time table']?.[day] || [];
                  return (
                    <div key={day} style={{ display:'grid', gridTemplateColumns:'110px 1fr', gap:'12px', padding:'14px', background:'#f8f9ff', borderRadius:'12px', marginBottom:'14px' }}>
                      <div style={{ fontWeight:'800', fontSize:'13px', color:'#1a237e', display:'flex', alignItems:'center', textTransform:'uppercase' }}>
                        {day}
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', gap:'10px' }}>
                        {Array.isArray(dayData) && dayData.length > 0 ? dayData.map((ci, idx) => {
                          // ✅ parseSlot handles both object and string format
                          const slot = parseSlot(ci);
                          return (
                            <div key={idx} style={{ background:'white', padding:'11px', borderRadius:'10px', borderLeft:'4px solid #3f51b5' }}>
                              <div style={{ fontWeight:'bold', fontSize:'13px', color:'#333', marginBottom:'3px' }}>
                                {slot.subject || '—'}
                              </div>
                              <div style={{ fontSize:'11px', color:'#666', display:'flex', alignItems:'center', gap:'3px', marginBottom:'3px' }}>
                                <Clock size={11}/> {slot.time || '—'}
                              </div>
                              <div style={{ fontSize:'10px', color:'#1a237e', background:'#e8eaf6', padding:'2px 7px', borderRadius:'4px', width:'fit-content' }}>
                                {slot.room || 'Classroom'}
                              </div>
                            </div>
                          );
                        }) : (
                          <div style={{ color:'#999', fontStyle:'italic', fontSize:'13px' }}>No sessions scheduled.</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ATTENDANCE */}
            {activeTab==='attendance' && (
              <div style={{ background:'white', padding:'22px', borderRadius:'15px' }}>
                <h2 style={{ marginTop:0, marginBottom:'20px', display:'flex', alignItems:'center', gap:'10px' }}><User size={24}/> Attendance Analytics</h2>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:'16px' }}>
                  {studentData?.courses?.map((course,idx) => (
                    <div key={idx} style={{ padding:'18px', background:'#f8f9ff', borderRadius:'12px', borderLeft:'5px solid #4caf50' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontWeight:'bold' }}>
                        <span>{course.name}</span>
                        <span style={{ color:'#4caf50' }}>{course.attendance||'80'}%</span>
                      </div>
                      <ProgressBar percent={course.attendance||80}/>
                      <p style={{ fontSize:'12px', color:'#777', marginTop:'8px', marginBottom:0 }}>Instructor: {course.instructor}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FEE */}
            {activeTab==='fee' && (
              <FeeDetails studentEmail={auth.currentUser?.email} />
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;