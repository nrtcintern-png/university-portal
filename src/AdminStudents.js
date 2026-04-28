import React, { useState } from "react";
import { db } from "./firebase";
import { doc, deleteDoc } from "firebase/firestore";
import { Search, UserPlus, Edit3, Trash2 } from 'lucide-react';
import AdminStudentForm from "./AdminStudentForm";

const AdminStudents = ({ students, showMsg }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editStudent, setEditStudent] = useState(null);

  const handleEdit = (student) => {
    setEditStudent(student);
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`"${name}" ko delete karna chahte hain?`)) return;
    try {
      await deleteDoc(doc(db, "students", id));
      showMsg("🗑️ Student deleted!");
    } catch(e) {
      showMsg("❌ Delete failed!");
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditStudent(null);
  };

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.regNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showForm) {
    return (
      <AdminStudentForm
        students={students}
        editStudent={editStudent}
        showMsg={showMsg}
        onClose={handleFormClose}
      />
    );
  }

  return (
    <>
      {/* Top Bar */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px', flexWrap:'wrap', gap:'12px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'#fff', padding:'10px 16px', borderRadius:'10px', border:'1px solid #e8eaf6', minWidth:'260px' }}>
          <Search size={15} color="#94a3b8"/>
          <input
            placeholder="Search by name, reg no, dept..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ border:'none', outline:'none', fontSize:'13px', width:'100%', color:'#374151', background:'transparent' }}
          />
        </div>
        <button
          onClick={() => { setEditStudent(null); setShowForm(true); }}
          style={{ display:'flex', alignItems:'center', gap:'8px', background:'#1a237e', color:'white', border:'none', borderRadius:'10px', padding:'10px 20px', cursor:'pointer', fontWeight:'700', fontSize:'13px' }}>
          <UserPlus size={16}/> Add New Student
        </button>
      </div>

      {/* Table Card */}
      <div style={{ background:'#fff', borderRadius:'12px', border:'1px solid #e8eaf6', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #f0f4ff', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontWeight:'700', color:'#1a237e', fontSize:'14px' }}>All Students</span>
          <span style={{ background:'#eef2ff', color:'#1a237e', padding:'4px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'700' }}>
            {filtered.length} records
          </span>
        </div>

        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f8fafc' }}>
                {['Reg No', 'Student', 'Department', 'Email', 'Sem', 'GPA', 'Att%', 'Actions'].map(h => (
                  <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:'11px', fontWeight:'700', color:'#64748b', textTransform:'uppercase', letterSpacing:'0.5px', borderBottom:'1px solid #f0f0f0', whiteSpace:'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(s => (
                <tr key={s.id}
                  style={{ borderBottom:'1px solid #f8fafc', transition:'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafbff'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}>

                  <td style={{ padding:'13px 16px', fontWeight:'700', color:'#1a237e', fontSize:'13px', whiteSpace:'nowrap' }}>
                    {s.regNo || '—'}
                  </td>

                  <td style={{ padding:'13px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      <img
                        src={s.profilePic || 'https://via.placeholder.com/34x34?text=S'}
                        style={{ width:'34px', height:'34px', borderRadius:'50%', objectFit:'cover', border:'2px solid #e8eaf6', flexShrink:0 }}
                        alt=""
                        onError={e => { e.target.src = 'https://via.placeholder.com/34x34?text=S'; }}
                      />
                      <div>
                        <div style={{ fontWeight:'600', color:'#1e293b', fontSize:'13px', whiteSpace:'nowrap' }}>{s.name}</div>
                        <div style={{ fontSize:'11px', color:'#94a3b8' }}>{s.phone || '—'}</div>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding:'13px 16px' }}>
                    <span style={{ background:'#eef2ff', color:'#1a237e', padding:'4px 10px', borderRadius:'6px', fontSize:'11px', fontWeight:'600', whiteSpace:'nowrap' }}>
                      {s.department || '—'}
                    </span>
                  </td>

                  <td style={{ padding:'13px 16px', fontSize:'12px', color:'#64748b', whiteSpace:'nowrap' }}>
                    {s.email}
                  </td>

                  <td style={{ padding:'13px 16px', fontSize:'13px', textAlign:'center', color:'#374151', fontWeight:'600' }}>
                    {s.semester || '—'}
                  </td>

                  <td style={{ padding:'13px 16px', fontSize:'13px', fontWeight:'700', color: Number(s.gpa) >= 3 ? '#059669' : Number(s.gpa) >= 2 ? '#d97706' : '#dc2626' }}>
                    {s.gpa || '—'}
                  </td>

                  <td style={{ padding:'13px 16px', fontSize:'13px', fontWeight:'700', color: Number(s.attendance) >= 75 ? '#059669' : '#dc2626' }}>
                    {s.attendance ? s.attendance + '%' : '—'}
                  </td>

                  <td style={{ padding:'13px 16px' }}>
                    <div style={{ display:'flex', gap:'8px' }}>
                      <button
                        onClick={() => handleEdit(s)}
                        style={{ background:'#eef2ff', border:'1px solid #c7d2fe', borderRadius:'7px', padding:'7px 12px', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px', fontSize:'12px', color:'#1a237e', fontWeight:'600' }}>
                        <Edit3 size={13}/> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(s.id, s.name)}
                        style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'7px', padding:'7px 12px', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px', fontSize:'12px', color:'#dc2626', fontWeight:'600' }}>
                        <Trash2 size={13}/> Del
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" style={{ padding:'50px', textAlign:'center', color:'#94a3b8', fontSize:'14px' }}>
                    <Search size={32} style={{ opacity:0.3, marginBottom:'10px', display:'block', margin:'0 auto 10px' }}/>
                    Koi student nahi mila
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AdminStudents;