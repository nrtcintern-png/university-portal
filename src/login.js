import React, { useState } from "react";
import { auth, db } from "./firebase";
import { signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, X, ScrollText } from 'lucide-react';
import { doc, getDoc } from "firebase/firestore";

const Login = () => {
  const [isAdminView, setIsAdminView] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const navigate = useNavigate();

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email first to reset password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("Password reset link sent to your email!");
      setError("");
    } catch (err) {
      setError("Failed to send reset email. Verify your email address.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!termsAccepted) {
      setError("Please accept the Terms & Conditions to proceed.");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (isAdminView) {
        const adminDocRef = doc(db, "admins", user.email);
        const adminDoc = await getDoc(adminDocRef);
        if (adminDoc.exists() && adminDoc.data().role === "Admin") {
          localStorage.setItem("userRole", "Admin");
          navigate("/admin-dashboard");
        } else {
          await signOut(auth);
          setError("Access Denied: Administrative privileges required.");
          setLoading(false);
          return;
        }
      } else {
        const studentDocRef = doc(db, "students", user.email);
        const studentDoc = await getDoc(studentDocRef);
        if (studentDoc.exists()) {
          localStorage.setItem("userRole", "Student");
          navigate("/dashboard");
        } else {
          await signOut(auth);
          setError("Access Denied: Use Admin portal for staff login.");
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError("Yeh email registered nahi hai.");
      } else if (err.code === 'auth/wrong-password') {
        setError("Password galat hai.");
      } else if (err.code === 'auth/invalid-credential') {
        setError("Email ya password galat hai. Dobara check karein.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Email format galat hai.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Bahut zyada attempts! Thodi der baad try karein.");
      } else if (err.code === 'auth/network-request-failed') {
        setError("Network error! Internet connection check karein.");
      } else {
        setError("Error: " + err.code);
      }
    }
    setLoading(false);
  };

  const TermsModal = () => (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.5)',
      zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center',
      padding:'20px'
    }}>
      <div style={{
        background:'white', borderRadius:'16px', width:'100%', maxWidth:'540px',
        maxHeight:'85vh', display:'flex', flexDirection:'column',
        boxShadow:'0 20px 60px rgba(0,0,0,0.3)', overflow:'hidden'
      }}>
        <div style={{
          background: isAdminView ? '#0f172a' : '#1a237e',
          padding:'20px 24px', display:'flex', justifyContent:'space-between', alignItems:'center'
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <ScrollText size={20} color="white"/>
            <div>
              <h3 style={{ margin:0, color:'white', fontSize:'16px', fontWeight:'700' }}>Terms & Conditions</h3>
              <p style={{ margin:0, color:'rgba(255,255,255,0.7)', fontSize:'12px' }}>University of Haripur — Student Portal</p>
            </div>
          </div>
          <button onClick={() => setShowTermsModal(false)}
            style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:'8px', padding:'6px', cursor:'pointer', color:'white', display:'flex' }}>
            <X size={18}/>
          </button>
        </div>

        <div style={{ overflowY:'auto', padding:'24px', flex:1 }}>
          <p style={{ fontSize:'12px', color:'#94a3b8', marginTop:0, marginBottom:'20px' }}>
            Last updated: January 2026 &nbsp;|&nbsp; University of Haripur, Registrar Office
          </p>

          {[
            {
              title: "1. Portal Access & Eligibility",
              content: "This portal is exclusively for enrolled students and authorized staff of the University of Haripur. Access is granted upon successful admission and registration. Sharing of login credentials is strictly prohibited. Unauthorized access attempts will result in immediate account suspension and may lead to disciplinary action as per university regulations."
            },
            {
              title: "2. Student Responsibilities",
              content: "Students are responsible for maintaining the confidentiality of their login credentials. You must immediately report any unauthorized access to your account to the IT department. Students must use this portal only for legitimate academic purposes including checking grades, attendance, course registration, and fee payment."
            },
            {
              title: "3. Academic Integrity",
              content: "All information accessed through this portal is confidential and intended solely for the registered user. Misuse of academic records, tampering with grades or attendance data, or any attempt to manipulate portal information is a violation of the University of Haripur's academic integrity policy and is subject to expulsion under HEC regulations."
            },
            {
              title: "4. Data Privacy & Security",
              content: "The University of Haripur collects and stores student data in accordance with applicable data protection laws of Pakistan. Your personal information including name, contact details, academic records, and financial information is stored securely. The university does not sell or share your data with third parties without your consent, except as required by law or HEC directives."
            },
            {
              title: "5. Fee & Financial Records",
              content: "Fee information displayed on this portal is for reference purposes. Students must verify payment status with the Accounts Office. The University of Haripur reserves the right to restrict portal access for students with outstanding dues. All financial disputes must be raised with the Accounts Department within 30 days of the invoice date."
            },
            {
              title: "6. Attendance Policy",
              content: "Attendance records are updated regularly by respective faculty members. Students must maintain a minimum of 75% attendance per semester to be eligible for final examinations as per University of Haripur policy. Discrepancies in attendance records must be reported to the relevant department within 7 working days."
            },
            {
              title: "7. Portal Usage Policy",
              content: "This portal must not be used for any unlawful activity. Students must not attempt to hack, disrupt, or interfere with the portal's functionality. Any detected misuse will result in immediate suspension of portal access and referral to the university's disciplinary committee under PECA 2016."
            },
            {
              title: "8. Examination & Results",
              content: "Examination schedules, results, and related notifications published on this portal are official communications from the University of Haripur Examination Department. Students are responsible for regularly checking the portal for updates. Result disputes must be filed within 15 days of result announcement through the official rechecking process."
            },
            {
              title: "9. Changes to Terms",
              content: "The University of Haripur reserves the right to update these Terms & Conditions at any time. Students will be notified of major changes via their registered university email. Continued use of the portal after changes constitutes acceptance of the updated terms."
            },
            {
              title: "10. Contact & Support",
              content: "For portal-related queries, contact the IT Helpdesk at helpdesk@uoh.edu.pk or visit the IT Support Office. For academic queries, contact your respective department. For fee-related queries, contact the Accounts Office at accounts@uoh.edu.pk."
            },
          ].map(({ title, content }) => (
            <div key={title} style={{ marginBottom:'20px' }}>
              <h4 style={{ color:'#1a237e', fontSize:'13px', fontWeight:'700', margin:'0 0 6px' }}>{title}</h4>
              <p style={{ color:'#475569', fontSize:'13px', lineHeight:'1.7', margin:0 }}>{content}</p>
            </div>
          ))}

          <div style={{ background:'#f8fafc', borderRadius:'10px', padding:'14px', border:'1px solid #e2e8f0', marginTop:'10px' }}>
            <p style={{ margin:0, fontSize:'12px', color:'#64748b', lineHeight:'1.6' }}>
              By checking the <strong>"I agree to the Terms & Conditions"</strong> box on the login page, you confirm that you have read, understood, and agreed to all the above terms. If you do not agree, please contact the Registrar Office at <strong>registrar@uoh.edu.pk</strong>
            </p>
          </div>
        </div>

        <div style={{ padding:'16px 24px', borderTop:'1px solid #f0f0f0', display:'flex', gap:'10px', justifyContent:'flex-end' }}>
          <button onClick={() => setShowTermsModal(false)}
            style={{ padding:'10px 20px', background:'#f1f5f9', color:'#64748b', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'600', fontSize:'13px' }}>
            Close
          </button>
          <button onClick={() => { setTermsAccepted(true); setShowTermsModal(false); }}
            style={{ padding:'10px 20px', background: isAdminView ? '#0f172a' : '#1a237e', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'700', fontSize:'13px' }}>
            ✓ I Accept
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={containerStyle}>
      {showTermsModal && <TermsModal/>}
      <div style={cardStyle}>
        <div style={{ ...headerStyle, background: isAdminView ? '#0f172a' : '#1a237e' }}>
          <h1 style={titleStyle}>University Portal</h1>
          <p style={subtitleStyle}>{isAdminView ? "Secure Admin Login" : "Secure Student Login"}</p>
        </div>
        <div style={formContainerStyle}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom:'20px' }}>
              <label style={labelStyle}>{isAdminView ? "Admin Email" : "University Email"}</label>
              <input
                type="email" name="email" autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                required style={inputStyle}
                placeholder="email@uoh.edu.pk"
              />
            </div>
            <div style={{ marginBottom:'15px' }}>
              <label style={labelStyle}>Password</label>
              <div style={{ position:'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password" autoComplete="current-password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  required style={inputStyle}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={eyeBtnStyle}>
                  {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>
            <div style={linksRowStyle}>
              <span onClick={() => { setIsAdminView(!isAdminView); setError(""); setSuccess(""); }} style={adminLinkStyle}>
                {isAdminView ? "← Student Login" : "Admin Access?"}
              </span>
              <span onClick={handleForgotPassword} style={forgotLinkStyle}>Forgot Password?</span>
            </div>
            <div style={checkboxWrapperStyle}>
              <input type="checkbox" id="terms" checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)} style={{ cursor:'pointer' }}/>
              <label htmlFor="terms" style={termsLabelStyle}>
                I agree to the{' '}
                <span onClick={() => setShowTermsModal(true)}
                  style={{ fontWeight:'700', color: isAdminView ? '#0f172a' : '#1a237e', cursor:'pointer', textDecoration:'underline' }}>
                  Terms & Conditions
                </span>
              </label>
            </div>
            {error   && <div style={errorBoxStyle}>{error}</div>}
            {success && <div style={successBoxStyle}>{success}</div>}
            <button type="submit" disabled={loading}
              style={{ ...submitBtnStyle, background: isAdminView ? '#0f172a' : '#1a237e', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
        <div style={footerStyle}>© 2026 Registrar Office — University of Haripur</div>
      </div>
    </div>
  );
};

const containerStyle = { minHeight:'100vh', background:'#f4f7fe', display:'flex', justifyContent:'center', alignItems:'center', padding:'20px' };
const cardStyle = { backgroundColor:'white', borderRadius:'20px', boxShadow:'0 12px 50px rgba(0,0,0,0.1)', width:'100%', maxWidth:'420px', overflow:'hidden' };
const headerStyle = { padding:'40px 20px', textAlign:'center', color:'white' };
const titleStyle = { margin:0, fontSize:'24px', fontWeight:'700' };
const subtitleStyle = { opacity:0.8, fontSize:'14px', marginTop:'5px' };
const formContainerStyle = { padding:'30px' };
const labelStyle = { display:'block', fontSize:'13px', fontWeight:'600', color:'#444', marginBottom:'8px' };
const inputStyle = { width:'100%', padding:'12px', borderRadius:'10px', border:'1px solid #e0e4ec', outline:'none', boxSizing:'border-box', background:'#fcfcfc' };
const eyeBtnStyle = { position:'absolute', right:'15px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#94a3b8' };
const linksRowStyle = { display:'flex', justifyContent:'space-between', marginBottom:'15px' };
const adminLinkStyle = { fontSize:'12px', color:'#1a237e', cursor:'pointer', fontWeight:'600' };
const forgotLinkStyle = { fontSize:'12px', color:'#64748b', cursor:'pointer', fontWeight:'500', textDecoration:'underline' };
const checkboxWrapperStyle = { display:'flex', alignItems:'center', gap:'8px', marginBottom:'20px', width:'100%' };
const termsLabelStyle = { fontSize:'13px', color:'#64748b', cursor:'pointer' };
const errorBoxStyle = { background:'#fef2f2', color:'#dc2626', fontSize:'12px', padding:'10px', borderRadius:'8px', marginBottom:'20px', textAlign:'center', border:'1px solid #fee2e2' };
const successBoxStyle = { background:'#f0fdf4', color:'#16a34a', fontSize:'12px', padding:'10px', borderRadius:'8px', marginBottom:'20px', textAlign:'center', border:'1px solid #dcfce7' };
const submitBtnStyle = { width:'100%', padding:'14px', color:'white', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:'700', fontSize:'16px' };
const footerStyle = { textAlign:'center', padding:'15px', fontSize:'11px', color:'#94a3b8', borderTop:'1px solid #f1f5f9' };

export default Login;