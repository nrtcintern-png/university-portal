import React, { useState } from "react";
import { db } from "./firebase";
import { collection, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { Bell, Trash2, Send, MessageSquare } from 'lucide-react';

const AdminNotifications = ({ notifications, showMsg }) => {
  const [form, setForm] = useState({ title:"", message:"" });
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!form.title.trim()) { showMsg("❌ Title required hai!"); return; }
    if (!form.message.trim()) { showMsg("❌ Message required hai!"); return; }
    setLoading(true);
    try {
      await addDoc(collection(db, "notifications"), {
        title: form.title.trim(),
        message: form.message.trim(),
        timestamp: serverTimestamp()
      });
      showMsg("✅ Announcement sent to all students!");
      setForm({ title:"", message:"" });
    } catch(e) {
      showMsg("❌ Error: " + e.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await deleteDoc(doc(db, "notifications", id));
      showMsg("🗑️ Announcement deleted!");
    } catch(e) {
      showMsg("❌ Delete failed!");
    }
  };

  const inp = {
    width:'100%', padding:'10px 14px', borderRadius:'8px',
    border:'1px solid #e2e8f0', fontSize:'13px',
    boxSizing:'border-box', outline:'none', color:'#1e293b', background:'white'
  };
  const lbl = {
    display:'block', fontSize:'11px', fontWeight:'700',
    color:'#64748b', marginBottom:'5px',
    textTransform:'uppercase', letterSpacing:'0.4px'
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '—';
    try {
      return timestamp.toDate().toLocaleDateString('en-PK', {
        year:'numeric', month:'long', day:'numeric',
        hour:'2-digit', minute:'2-digit'
      });
    } catch(e) { return '—'; }
  };

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', alignItems:'start' }}>

      {/* ── Send New Announcement ── */}
      <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', border:'1px solid #e8eaf6', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'20px', paddingBottom:'12px', borderBottom:'1px solid #f8fafc' }}>
          <Bell size={16} color="#1a237e"/>
          <h3 style={{ color:'#1e293b', margin:0, fontSize:'15px', fontWeight:'700' }}>New Announcement</h3>
        </div>

        <div style={{ marginBottom:'16px' }}>
          <label style={lbl}>Title *</label>
          <input
            style={inp}
            placeholder="e.g. Exam Schedule Update"
            value={form.title}
            onChange={e => setForm(p => ({ ...p, title:e.target.value }))}
          />
        </div>

        <div style={{ marginBottom:'20px' }}>
          <label style={lbl}>Message *</label>
          <textarea
            style={{ ...inp, height:'140px', resize:'vertical' }}
            placeholder="Write your announcement here..."
            value={form.message}
            onChange={e => setForm(p => ({ ...p, message:e.target.value }))}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={loading}
          style={{
            display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
            background: loading ? '#94a3b8' : '#1a237e',
            color:'white', border:'none', borderRadius:'10px',
            padding:'12px 24px', cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight:'700', fontSize:'14px', width:'100%'
          }}>
          <Send size={16}/> {loading ? 'Sending...' : 'Send to All Students'}
        </button>
      </div>

      {/* ── Sent Announcements List ── */}
      <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', border:'1px solid #e8eaf6', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', paddingBottom:'12px', borderBottom:'1px solid #f8fafc' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <MessageSquare size={16} color="#1a237e"/>
            <h3 style={{ color:'#1e293b', margin:0, fontSize:'15px', fontWeight:'700' }}>Sent Announcements</h3>
          </div>
          <span style={{ background:'#eef2ff', color:'#1a237e', padding:'4px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'700' }}>
            {notifications.length} total
          </span>
        </div>

        <div style={{ maxHeight:'500px', overflowY:'auto' }}>
          {notifications.length > 0 ? notifications.map(n => (
            <div key={n.id} style={{
              padding:'14px', background:'#f8fafc',
              borderRadius:'10px', marginBottom:'10px',
              borderLeft:'3px solid #1a237e',
              border:'1px solid #e8eaf6',
              borderLeftWidth:'3px', borderLeftColor:'#1a237e',
              display:'flex', justifyContent:'space-between',
              alignItems:'start', gap:'12px'
            }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:'700', color:'#1a237e', fontSize:'13px', marginBottom:'6px' }}>
                  📢 {n.title}
                </div>
                <p style={{ fontSize:'12px', color:'#64748b', margin:'0 0 8px', lineHeight:'1.6', wordBreak:'break-word' }}>
                  {n.message}
                </p>
                <div style={{ fontSize:'11px', color:'#94a3b8', display:'flex', alignItems:'center', gap:'4px' }}>
                  🕐 {formatDate(n.timestamp)}
                </div>
              </div>
              <button
                onClick={() => handleDelete(n.id)}
                style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'7px', padding:'7px', cursor:'pointer', flexShrink:0 }}>
                <Trash2 size={14} color="#dc2626"/>
              </button>
            </div>
          )) : (
            <div style={{ padding:'40px 20px', textAlign:'center', color:'#94a3b8' }}>
              <Bell size={36} color="#e2e8f0" style={{ marginBottom:'12px' }}/>
              <p style={{ margin:0, fontSize:'14px' }}>Koi announcement nahi abhi tak</p>
              <p style={{ margin:'4px 0 0', fontSize:'12px' }}>Upar form fill karke pehli announcement bhejein</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminNotifications;