import React from "react";
import { Users, BookOpen, Building2, UserCheck, TrendingUp, ArrowRight } from 'lucide-react';

const DEPARTMENTS = [
  "Computer Science",
  "Software Engineering",
  "Electrical Engineering",
  "Business Administration"
];

const AdminOverview = ({ students, notifications, setActiveTab }) => {

  const deptStats = DEPARTMENTS.map(d => ({
    name: d,
    count: students.filter(s => s.department === d).length
  }));

  const avgAttendance = students.length
    ? Math.round(students.reduce((a, s) => a + (Number(s.attendance) || 0), 0) / students.length)
    : 0;

  const avgGPA = students.length
    ? (students.reduce((a, s) => a + (Number(s.gpa) || 0), 0) / students.length).toFixed(2)
    : '0.00';

  // New students this month
  const currentMonth = new Date().getMonth();
  const currentYear  = new Date().getFullYear();
  const newThisMonth = students.filter(s => {
    if (!s.createdAt) return false;
    try {
      const d = s.createdAt.toDate ? s.createdAt.toDate() : new Date(s.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    } catch { return false; }
  }).length;

  const totalCourses = students.reduce((a, s) => a + (s.courses?.length || 0), 0);

  const statCards = [
    {
      label: 'Total Students',
      value: students.length,
      sub: `${DEPARTMENTS.length} departments`,
      Icon: Users,
      color: '#1a237e',
      bg: '#eef2ff',
      trend: '+' + students.length,
    },
    {
      label: 'Attendance Rate',
      value: avgAttendance + '%',
      sub: avgAttendance >= 75 ? 'Good overall' : 'Needs attention',
      Icon: UserCheck,
      color: avgAttendance >= 75 ? '#065f46' : '#92400e',
      bg: avgAttendance >= 75 ? '#ecfdf5' : '#fffbeb',
      trend: avgAttendance >= 75 ? '▲ Good' : '▼ Low',
    },
    {
      label: 'Departments',
      value: DEPARTMENTS.length,
      sub: `${totalCourses} total courses`,
      Icon: Building2,
      color: '#1e40af',
      bg: '#eff6ff',
      trend: 'Active',
    },
    {
      label: 'New This Month',
      value: newThisMonth,
      sub: new Date().toLocaleString('default', { month:'long', year:'numeric' }),
      Icon: TrendingUp,
      color: '#6d28d9',
      bg: '#f5f3ff',
      trend: 'This month',
    },
  ];

  return (
    <>
      {/* ── Welcome Bar ── */}
      <div style={{
        background:'linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%)',
        borderRadius:'14px', padding:'24px 28px', marginBottom:'24px',
        display:'flex', justifyContent:'space-between', alignItems:'center',
        boxShadow:'0 4px 20px rgba(26,35,126,0.25)'
      }}>
        <div>
          <h2 style={{ color:'white', margin:'0 0 6px', fontSize:'20px', fontWeight:'800' }}>
            Welcome back, Administrator 👋
          </h2>
          <p style={{ color:'rgba(255,255,255,0.75)', margin:0, fontSize:'13px' }}>
            {new Date().toLocaleDateString('en-PK', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </p>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ color:'rgba(255,255,255,0.75)', fontSize:'12px', marginBottom:'4px' }}>Average GPA</div>
          <div style={{ color:'white', fontSize:'28px', fontWeight:'800' }}>{avgGPA}</div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'24px' }}>
        {statCards.map(({ label, value, sub, Icon, color, bg, trend }) => (
          <div key={label} style={{
            background:'#fff', borderRadius:'12px', padding:'20px',
            border:'1px solid #e8eaf6', boxShadow:'0 2px 8px rgba(0,0,0,0.05)',
            transition:'transform 0.2s, box-shadow 0.2s', cursor:'default'
          }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.05)'; }}
          >
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:'14px' }}>
              <div style={{ background:bg, padding:'10px', borderRadius:'10px' }}>
                <Icon size={20} color={color}/>
              </div>
              <span style={{ fontSize:'11px', color:color, background:bg, padding:'3px 8px', borderRadius:'20px', fontWeight:'600' }}>
                {trend}
              </span>
            </div>
            <div style={{ fontSize:'28px', fontWeight:'800', color:'#1e293b', marginBottom:'4px' }}>{value}</div>
            <div style={{ fontSize:'12px', fontWeight:'600', color:'#64748b', marginBottom:'2px' }}>{label}</div>
            <div style={{ fontSize:'11px', color:'#94a3b8' }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Bottom Row ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>

        {/* Department Distribution */}
        <div style={{ background:'#fff', borderRadius:'12px', padding:'22px', border:'1px solid #e8eaf6', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
            <h3 style={{ color:'#1e293b', margin:0, fontSize:'14px', fontWeight:'700' }}>Department Distribution</h3>
            <BookOpen size={15} color="#94a3b8"/>
          </div>
          {deptStats.map((d, idx) => {
            const colors = ['#1a237e', '#1e40af', '#1d4ed8', '#3b82f6'];
            const pct = students.length ? Math.round((d.count / students.length) * 100) : 0;
            return (
              <div key={d.name} style={{ marginBottom:'16px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', marginBottom:'6px' }}>
                  <span style={{ color:'#475569', fontWeight:'500' }}>{d.name}</span>
                  <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                    <span style={{ color:'#94a3b8', fontSize:'11px' }}>{pct}%</span>
                    <span style={{ color:'#1e293b', fontWeight:'700', minWidth:'16px', textAlign:'right' }}>{d.count}</span>
                  </div>
                </div>
                <div style={{ background:'#f1f5f9', borderRadius:'6px', height:'7px' }}>
                  <div style={{
                    width:`${pct}%`, background:colors[idx],
                    height:'100%', borderRadius:'6px',
                    transition:'width 0.8s ease',
                    minWidth: d.count > 0 ? '7px' : '0'
                  }}/>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions + Recent */}
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>

          {/* Quick Actions */}
          <div style={{ background:'#fff', borderRadius:'12px', padding:'20px', border:'1px solid #e8eaf6', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
            <h3 style={{ color:'#1e293b', margin:'0 0 14px', fontSize:'14px', fontWeight:'700' }}>Quick Actions</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              {[
                { label:'Add Student',      emoji:'➕', tab:'students'      },
                { label:'Send Announcement', emoji:'📢', tab:'notifications' },
                { label:'View All Students', emoji:'👥', tab:'students'      },
                { label:'Manage Notices',    emoji:'🔔', tab:'notifications' },
              ].map(({ label, emoji, tab }) => (
                <button key={label} onClick={() => setActiveTab(tab)}
                  style={{
                    background:'#f8fafc', border:'1px solid #e8eaf6',
                    borderRadius:'8px', padding:'10px 12px',
                    cursor:'pointer', display:'flex', alignItems:'center',
                    gap:'8px', fontSize:'12px', fontWeight:'600',
                    color:'#374151', transition:'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background='#eef2ff'; e.currentTarget.style.borderColor='#c7d2fe'; e.currentTarget.style.color='#1a237e'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='#f8fafc'; e.currentTarget.style.borderColor='#e8eaf6'; e.currentTarget.style.color='#374151'; }}>
                  {emoji} {label} <ArrowRight size={11} style={{ marginLeft:'auto' }}/>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Notifications */}
          <div style={{ background:'#fff', borderRadius:'12px', padding:'20px', border:'1px solid #e8eaf6', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', flex:1 }}>
            <h3 style={{ color:'#1e293b', margin:'0 0 14px', fontSize:'14px', fontWeight:'700' }}>Recent Announcements</h3>
            {notifications.slice(0, 3).length > 0 ? notifications.slice(0, 3).map(n => (
              <div key={n.id} style={{ display:'flex', gap:'10px', alignItems:'start', marginBottom:'12px', paddingBottom:'12px', borderBottom:'1px solid #f8fafc' }}>
                <div style={{ background:'#eef2ff', borderRadius:'8px', padding:'8px', flexShrink:0 }}>
                  📢
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:'600', color:'#1e293b', fontSize:'13px', marginBottom:'2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize:'11px', color:'#94a3b8' }}>
                    {n.timestamp?.toDate?.().toLocaleDateString('en-PK') || '—'}
                  </div>
                </div>
              </div>
            )) : (
              <p style={{ color:'#94a3b8', fontSize:'13px', margin:0, textAlign:'center', padding:'16px 0' }}>
                Koi announcement nahi abhi tak
              </p>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default AdminOverview;