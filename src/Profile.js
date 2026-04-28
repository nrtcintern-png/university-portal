import React, { useState, useEffect } from "react";
import { auth, db } from './firebase';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { Lock, Save, User as UserIcon, Phone, HeartPulse } from 'lucide-react';

const Profile = ({ studentData }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    cnic: "",
    dob: "",
    emergencyContact: "",
    oldPassword: "",
    newPassword: ""
  });

  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    if (studentData) {
      setFormData(prev => ({
        ...prev,
        name: studentData.name || "",
        phone: studentData.phone || "",
        address: studentData.address || "",
        cnic: studentData.cnic || "",
        dob: studentData.dob || "",
        emergencyContact: studentData.emergencyContact || ""
      }));
    }
  }, [studentData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "info", text: "Updating profile..." });

    try {
      const user = auth.currentUser;
      
      if (formData.newPassword) {
        if (!formData.oldPassword) {
          setMsg({ type: "error", text: "Please enter current password to change it." });
          return;
        }
        const credential = EmailAuthProvider.credential(user.email, formData.oldPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, formData.newPassword);
      }

      const studentRef = doc(db, "students", user.email);
      await updateDoc(studentRef, {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        cnic: formData.cnic,
        dob: formData.dob,
        emergencyContact: formData.emergencyContact
      });

      setMsg({ type: "success", text: "Profile updated successfully!" });
      setFormData(prev => ({ ...prev, oldPassword: "", newPassword: "" }));

    } catch (err) {
      setMsg({ type: "error", text: "Error: Could not update profile. Check credentials." });
    }
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h2 style={{margin:0, color:'#1a237e'}}>Profile Settings</h2>
          <p style={{margin:0, color:'#666', fontSize:'14px'}}>Update your official student records instantly</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={formStyle}>
        <h3 style={sectionTitle}><UserIcon size={18}/> Official Records</h3>
        <div style={gridStyle}>
          <div style={inputGroup}>
            <label style={labelStyle}>Full Name</label>
            <input name="name" style={inputStyle} value={formData.name} onChange={handleChange} />
          </div>
          <div style={inputGroup}>
            <label style={labelStyle}>CNIC / B-Form Number</label>
            <input name="cnic" style={inputStyle} value={formData.cnic} onChange={handleChange} />
          </div>
          <div style={inputGroup}>
            <label style={labelStyle}>Date of Birth</label>
            <input type="date" name="dob" style={inputStyle} value={formData.dob} onChange={handleChange} />
          </div>
          <div style={inputGroup}>
            <label style={labelStyle}>Primary Contact</label>
            <input name="phone" style={inputStyle} value={formData.phone} onChange={handleChange} />
          </div>
        </div>

        <div style={gridStyle}>
          <div style={inputGroup}>
            <label style={labelStyle}><HeartPulse size={14} style={{verticalAlign:'middle'}}/> Emergency Contact</label>
            <input name="emergencyContact" style={inputStyle} value={formData.emergencyContact} onChange={handleChange} />
          </div>
        </div>

        <div style={inputGroup}>
          <label style={labelStyle}>Permanent Address</label>
          <textarea name="address" style={{...inputStyle, height:'60px'}} value={formData.address} onChange={handleChange} />
        </div>

        <hr style={divider} />

        <h3 style={sectionTitle}><Lock size={18}/> Change Password (Optional)</h3>
        <div style={gridStyle}>
          <div style={inputGroup}>
            <label style={labelStyle}>Current Password</label>
            <input type="password" name="oldPassword" style={inputStyle} value={formData.oldPassword} onChange={handleChange} />
          </div>
          <div style={inputGroup}>
            <label style={labelStyle}>New Password</label>
            <input type="password" name="newPassword" style={inputStyle} value={formData.newPassword} onChange={handleChange} />
          </div>
        </div>

        {msg.text && (
          <div style={{...msgBox, background: msg.type==='error'?'#ffebee':'#e8f5e9', color: msg.type==='error'?'#c62828':'#2e7d32'}}>
            {msg.text}
          </div>
        )}

        <button type="submit" style={saveBtn}>
          <Save size={18}/> Save Changes
        </button>
      </form>
    </div>
  );
};

const containerStyle = { maxWidth: '900px', margin: '0 auto' };
const headerStyle = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px', background:'white', padding:'15px 25px', borderRadius:'12px', border:'1px solid #eee' };
const formStyle = { background: 'white', padding: '30px', borderRadius: '15px', border:'1px solid #eee' };
const sectionTitle = { fontSize: '15px', color: '#1a237e', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontWeight: 'bold', borderLeft: '4px solid #1a237e', paddingLeft: '10px' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' };
const inputGroup = { marginBottom: '15px' };
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '6px' };

// Updated inputStyle: Background white hai aur focus par blue tint nahi aaye ga
const inputStyle = { 
  width: '100%', 
  padding: '10px', 
  borderRadius: '8px', 
  border: '1px solid #e0e0e0', 
  fontSize: '14px', 
  boxSizing: 'border-box', 
  background: '#ffffff', // Light blue khatam kar diya
  outline: 'none' 
};

const divider = { border: 'none', borderTop: '1px solid #f0f0f0', margin: '25px 0' };
const saveBtn = { width: '100%', background: '#1a237e', color: 'white', border: 'none', padding: '14px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' };
const msgBox = { padding:'12px', borderRadius:'8px', marginBottom:'20px', fontSize:'13px', textAlign:'center' };

export default Profile;