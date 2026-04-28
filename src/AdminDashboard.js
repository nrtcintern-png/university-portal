import React, { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Bell, LogOut, GraduationCap, Menu } from 'lucide-react';
import AdminOverview from "./AdminOverview";
import AdminStudents from "./AdminStudents";
import AdminNotifications from "./AdminNotifications";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [screenWidth, setScreenWidth] = useState(() => window.innerWidth);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const u1 = onSnapshot(
      query(collection(db, "students"), orderBy("name")),
      snap => setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    const u2 = onSnapshot(
      query(collection(db, "notifications"), orderBy("timestamp", "desc")),
      snap => setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return () => { u1(); u2(); };
  }, []);

  const showMsg = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(""), 3500);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/admin");
  };

  // ✅ Mobile Block — screen size AND user agent dono check
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (screenWidth < 1024 || isMobileDevice) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a237e 0%, #0d1b3e 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px', fontFamily: 'Segoe UI, Arial, sans-serif'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '24px', padding: '44px 32px',
          textAlign: 'center', maxWidth: '360px', width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
        }}>
          <div style={{ fontSize: '56px', marginBottom: '20px' }}>🔒</div>
          <h2 style={{ color: 'white', fontSize: '22px', fontWeight: '800', margin: '0 0 14px', letterSpacing: '-0.3px' }}>
            Access Restricted
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.8', margin: '0 0 24px' }}>
            Admin Portal صرف University کے<br/>
            <strong style={{ color: 'rgba(255,255,255,0.85)' }}>Desktop یا Laptop</strong> پر access کیا جا سکتا ہے۔
            <br/><br/>
            Please switch to a desktop computer to manage the portal.
          </p>
          <div style={{
            background: 'rgba(255,71,87,0.12)',
            border: '1px solid rgba(255,71,87,0.3)',
            borderRadius: '12px', padding: '12px 18px',
            color: '#ff8a95', fontSize: '12px', fontWeight: '600',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}>
            ⚠️ Minimum screen width required: 1024px
          </div>
          <div style={{ marginTop: '28px', fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>
            University Admin Portal — Authorized Access Only
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { tab:'overview',      Icon:LayoutDashboard, label:'Overview'      },
    { tab:'students',      Icon:Users,           label:'Students'      },
    { tab:'notifications', Icon:Bell,            label:'Notifications' },
  ];

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Segoe UI', Arial, sans-serif; }
        .adm-shell { display:flex; min-height:100vh; background:#f4f6fb; }
        .adm-sidebar { width:240px; background:#fff; display:flex; flex-direction:column; position:fixed; height:100vh; z-index:200; border-right:1px solid #e8eaf6; box-shadow: 2px 0 8px rgba(0,0,0,0.04); }
        .adm-logo { padding:22px 20px; font-size:15px; font-weight:800; border-bottom:1px solid #f0f4ff; display:flex; align-items:center; gap:10px; color:#1a237e; }
        .adm-nav { padding:12px 20px; display:flex; align-items:center; gap:12px; cursor:pointer; font-size:14px; color:#64748b; border-left:3px solid transparent; transition:all 0.2s; margin:2px 0; text-decoration:none; }
        .adm-nav:hover { background:#f8fafc; color:#1a237e; }
        .adm-nav.active { background:#eef2ff; color:#1a237e; border-left:3px solid #1a237e; font-weight:600; }
        .adm-nav.logout { color:#ef4444; margin-top:auto; }
        .adm-nav.logout:hover { background:#fff5f5; }
        .adm-main { margin-left:240px; flex:1; display:flex; flex-direction:column; min-height:100vh; }
        .adm-header { height:64px; background:#fff; display:flex; align-items:center; justify-content:space-between; padding:0 28px; border-bottom:1px solid #e8eaf6; position:sticky; top:0; z-index:100; box-shadow:0 1px 4px rgba(0,0,0,0.04); }
        .adm-body { padding:24px; flex:1; }
        .adm-hamburger { display:none; }
        .adm-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:199; }
      `}</style>

      {/* Toast Message */}
      {msg && (
        <div style={{ position:'fixed', top:'20px', right:'20px', background:'#1a237e', color:'white', padding:'12px 20px', borderRadius:'10px', zIndex:9999, fontSize:'14px', fontWeight:'600', boxShadow:'0 4px 20px rgba(26,35,126,0.3)', maxWidth:'320px' }}>
          {msg}
        </div>
      )}

      <div className="adm-shell">
        {/* SIDEBAR */}
        <div className="adm-sidebar">
          <div className="adm-logo">
            <GraduationCap size={22}/> Admin Portal
          </div>
          <div style={{ flex:1, paddingTop:'8px', display:'flex', flexDirection:'column' }}>
            {navItems.map(({ tab, Icon, label }) => (
              <div key={tab}
                className={`adm-nav ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}>
                <Icon size={17}/> {label}
              </div>
            ))}
          </div>
          <div style={{ borderTop:'1px solid #f0f0f0', padding:'8px 0' }}>
            <div className="adm-nav logout" onClick={handleLogout}>
              <LogOut size={17}/> Logout
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="adm-main">
          <header className="adm-header">
            <h2 style={{ margin:0, color:'#1a237e', fontSize:'17px', fontWeight:'700' }}>
              {activeTab === 'overview'      && '📊 Overview'}
              {activeTab === 'students'      && '👥 Students Management'}
              {activeTab === 'notifications' && '🔔 Notifications'}
            </h2>
            <div style={{ background:'#eef2ff', color:'#1a237e', padding:'8px 16px', borderRadius:'8px', fontSize:'13px', fontWeight:'700', border:'1px solid #c7d2fe' }}>
              👤 Administrator
            </div>
          </header>

          <div className="adm-body">
            {activeTab === 'overview'      && <AdminOverview students={students} notifications={notifications} setActiveTab={setActiveTab}/>}
            {activeTab === 'students'      && <AdminStudents students={students} showMsg={showMsg}/>}
            {activeTab === 'notifications' && <AdminNotifications notifications={notifications} showMsg={showMsg}/>}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;