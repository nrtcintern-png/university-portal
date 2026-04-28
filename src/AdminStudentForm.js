import React, { useState } from "react";
import { db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import { Save, X, ChevronDown, ChevronUp, Plus, Trash2, Minus, ArrowLeft } from 'lucide-react';

const DEPARTMENTS = [
  "Computer Science",
  "Software Engineering",
  "Electrical Engineering",
  "Business Administration"
];
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const YEARS = ['2023','2024','2025','2026','2027'];
const TIME_SLOTS = [
  '09:00 - 10:30',
  '10:30 - 12:00',
  '12:00 - 01:30',
  '01:30 - 03:00',
  '03:00 - 04:30',
  '04:30 - 05:00',
];

// Helper: Firestore timestamp ya string ko YYYY-MM-DD mein convert karo
const toDateString = (val) => {
  if (!val) return "";
  if (typeof val === 'string') {
    // Already date string
    if (val.match(/^\d{4}-\d{2}-\d{2}$/)) return val;
    // Try parse
    const d = new Date(val);
    if (!isNaN(d)) return d.toISOString().split('T')[0];
    return "";
  }
  // Firestore Timestamp object
  if (val?.toDate) {
    return val.toDate().toISOString().split('T')[0];
  }
  if (val?.seconds) {
    return new Date(val.seconds * 1000).toISOString().split('T')[0];
  }
  return "";
};

// Helper: timetable normalize — "time table" (space) bhi handle karo
const normalizeTimetable = (student) => {
  const raw = student?.timetable || student?.['time table'] || {};
  const result = { monday:[], tuesday:[], wednesday:[], thursday:[], friday:[] };
  DAYS.forEach(day => {
    const slots = raw[day] || [];
    result[day] = slots.map(slot => {
      if (typeof slot === 'string') {
        // Remove extra quotes
        const clean = slot.replace(/^"+|"+$/g, '').trim();
        const parts = clean.split('|');
        return {
          subject: parts[0]?.trim() || "",
          time:    parts[1]?.trim() || "",
          room:    parts[2]?.trim() || ""
        };
      }
      return slot;
    });
  });
  return result;
};

// Helper: normalize courses — "credits" -> "creditHours"
const normalizeCourses = (courses) => {
  if (!Array.isArray(courses)) return [];
  return courses.map(c => ({
    name:        (c.name || "").trim(),
    instructor:  c.instructor  || "",
    creditHours: c.creditHours || c.credits || "",
    status:      c.status      || "Average",
    attendance:  c.attendance  || 80,
  }));
};

// Helper: normalize feeHistory — timestamp dueDate -> string
const normalizeFeeHistory = (feeHistory) => {
  if (!Array.isArray(feeHistory)) return [];
  return feeHistory.map(f => ({
    month:   f.month   || "",
    amount:  f.amount  || "",
    dueDate: toDateString(f.dueDate),
    status:  f.status  || "Pending",
  }));
};

const AdminStudentForm = ({ students, editStudent, showMsg, onClose }) => {
  const isEdit = !!editStudent;

  // ✅ email: use editStudent.id (document ID) if email field missing
  const emailVal = editStudent?.email || editStudent?.id || "";

  const [formData, setFormData] = useState({
    name:             editStudent?.name             || "",
    email:            emailVal,
    regNo:            editStudent?.regNo            || "",
    department:       editStudent?.department       || "",
    semester:         editStudent?.semester         || "",
    gpa:              editStudent?.gpa              || "",
    attendance:       editStudent?.attendance       || "",
    phone:            editStudent?.phone            || "",
    address:          editStudent?.address          || "",
    cnic:             editStudent?.cnic             || "",
    dob:              toDateString(editStudent?.dob),
    emergencyContact: editStudent?.emergencyContact || "",
    profilePic:       editStudent?.profilePic || editStudent?.['profilePic '] || "",
    status:           editStudent?.status           || "Average",
    courses:          normalizeCourses(editStudent?.courses),
    feeHistory:       normalizeFeeHistory(editStudent?.feeHistory),
    timetable:        normalizeTimetable(editStudent),
  });

  const [loading, setLoading] = useState(false);
  const [section, setSection] = useState('basic');

  const set = (key, val) => setFormData(p => ({ ...p, [key]: val }));

  /* ── Core save ── */
  const doSave = async () => {
    if (!formData.name.trim()) {
      showMsg("❌ Student ka naam required hai!"); return false;
    }
    if (!isEdit) {
      if (!formData.email.trim())   { showMsg("❌ Email required hai!");      return false; }
      if (!formData.regNo.trim())   { showMsg("❌ Reg No required hai!");     return false; }
      if (!formData.department)     { showMsg("❌ Department required hai!"); return false; }
      if (students.some(s => (s.email||s.id) === formData.email.toLowerCase().trim())) {
        showMsg("❌ Yeh email already registered hai!"); return false;
      }
      const dupRegNo = students.some(s =>
        s.regNo?.toUpperCase().trim() === formData.regNo.toUpperCase().trim() &&
        s.department === formData.department
      );
      if (dupRegNo) {
        showMsg(`❌ Reg No "${formData.regNo.toUpperCase()}" already exists in ${formData.department}!`);
        return false;
      }
    }

    setLoading(true);
    try {
      // ✅ Use document ID (email) for edit mode
      const docId = isEdit
        ? (editStudent.email || editStudent.id || "").toLowerCase().trim()
        : formData.email.toLowerCase().trim();

      if (!docId) {
        showMsg("❌ Email/ID missing!"); setLoading(false); return false;
      }

      // Save with "timetable" (no space) — normalized
      await setDoc(doc(db, "students", docId), {
        ...formData,
        email:      docId,
        regNo:      formData.regNo.toUpperCase().trim(),
        semester:   formData.semester,
        gpa:        Number(formData.gpa)        || 0,
        attendance: Number(formData.attendance) || 0,
      });
      showMsg(isEdit ? "✅ Student updated successfully!" : "✅ Student added successfully!");
      setLoading(false);
      return true;
    } catch(e) {
      showMsg("❌ Error: " + e.message);
      setLoading(false);
      return false;
    }
  };

  const handleSave = () => doSave();
  const handleSaveAndBack = async () => {
    const ok = await doSave();
    if (ok) onClose();
  };

  /* ── Course helpers ── */
  const addCourse  = ()      => setFormData(p => ({ ...p, courses: [...p.courses, { name:"", instructor:"", creditHours:"", status:"Average", attendance:80 }] }));
  const delCourse  = (i)     => setFormData(p => ({ ...p, courses: p.courses.filter((_,idx) => idx !== i) }));
  const setCourse  = (i,k,v) => setFormData(p => { const c = [...p.courses]; c[i] = { ...c[i], [k]:v }; return { ...p, courses:c }; });

  /* ── Fee helpers ── */
  const addFee   = ()      => setFormData(p => ({ ...p, feeHistory: [...p.feeHistory, { month:"", amount:"", dueDate:"", status:"Pending" }] }));
  const delFee   = (i)     => setFormData(p => ({ ...p, feeHistory: p.feeHistory.filter((_,idx) => idx !== i) }));
  const setFee   = (i,k,v) => setFormData(p => { const f = [...p.feeHistory]; f[i] = { ...f[i], [k]:v }; return { ...p, feeHistory:f }; });

  /* ── Timetable helpers ── */
  const addSlot = (day)       => setFormData(p => ({ ...p, timetable: { ...p.timetable, [day]: [...(p.timetable[day]||[]), { subject:"", time:"", room:"" }] } }));
  const delSlot = (day,i)     => setFormData(p => ({ ...p, timetable: { ...p.timetable, [day]: p.timetable[day].filter((_,idx) => idx !== i) } }));
  const setSlot = (day,i,k,v) => setFormData(p => {
    const t = [...(p.timetable[day]||[])];
    t[i] = { ...(t[i]||{}), [k]: v };
    return { ...p, timetable: { ...p.timetable, [day]: t } };
  });

  const enrolledCourseNames = formData.courses.map(c => c.name).filter(n => n && n.trim() !== "");

  /* ── Styles ── */
  const inp = { width:'100%', padding:'9px 12px', borderRadius:'8px', border:'1px solid #e2e8f0', fontSize:'13px', boxSizing:'border-box', outline:'none', color:'#1e293b', background:'white' };
  const sel = { ...inp };
  const lbl = { display:'block', fontSize:'11px', fontWeight:'700', color:'#64748b', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.4px' };
  const secBtn = (open) => ({
    width:'100%', padding:'12px 16px',
    background: open ? '#1a237e' : '#f8fafc',
    color: open ? 'white' : '#374151',
    border:'1px solid #e2e8f0', borderRadius:'10px',
    cursor:'pointer', display:'flex', justifyContent:'space-between',
    alignItems:'center', fontWeight:'700', fontSize:'14px', marginBottom:'8px'
  });
  const readonlyStyle = { ...inp, background:'#f1f5f9', color:'#94a3b8', cursor:'not-allowed' };

  const SectionButtons = () => (
    <div style={{ display:'flex', gap:'10px', marginTop:'14px', paddingTop:'12px', borderTop:'1px solid #e2e8f0' }}>
      <button onClick={handleSave} disabled={loading}
        style={{ display:'flex', alignItems:'center', gap:'6px', background: loading?'#94a3b8':'#059669', color:'white', border:'none', borderRadius:'8px', padding:'9px 20px', cursor: loading?'not-allowed':'pointer', fontWeight:'700', fontSize:'13px' }}>
        <Save size={14}/> {loading ? 'Saving...' : 'Save'}
      </button>
      <button onClick={handleSaveAndBack} disabled={loading}
        style={{ display:'flex', alignItems:'center', gap:'6px', background: loading?'#94a3b8':'#1a237e', color:'white', border:'none', borderRadius:'8px', padding:'9px 20px', cursor: loading?'not-allowed':'pointer', fontWeight:'700', fontSize:'13px' }}>
        <ArrowLeft size={14}/> {loading ? '...' : 'Save & Back'}
      </button>
    </div>
  );

  return (
    <div style={{ background:'#fff', borderRadius:'14px', border:'1px solid #e8eaf6', overflowY:'auto', maxHeight:'90vh', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>

      {/* Header */}
      <div style={{ background:'#1a237e', padding:'18px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <button onClick={onClose}
            style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:'8px', padding:'6px 12px', cursor:'pointer', color:'white', display:'flex', alignItems:'center', gap:'6px', fontSize:'13px' }}>
            <ArrowLeft size={15}/> Back
          </button>
          <h3 style={{ margin:0, color:'white', fontSize:'16px' }}>
            {isEdit ? `✏️ Edit: ${editStudent.name}` : '➕ Add New Student'}
          </h3>
        </div>
        <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.7)' }}>
          <X size={20}/>
        </button>
      </div>

      <div style={{ padding:'24px' }}>

        {/* BASIC INFO */}
        <button style={secBtn(section==='basic')} onClick={() => setSection(section==='basic' ? '' : 'basic')}>
          <span>👤 Basic Information</span>
          {section==='basic' ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
        </button>

        {section==='basic' && (
          <div style={{ background:'#f8fafc', padding:'16px', borderRadius:'10px', marginBottom:'10px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px' }}>
              <div>
                <label style={lbl}>Full Name *</label>
                <input style={inp} value={formData.name} onChange={e => set('name', e.target.value)} placeholder="Student full name"/>
              </div>
              <div>
                <label style={lbl}>Email {!isEdit && '*'}</label>
                <input
                  style={isEdit ? readonlyStyle : inp}
                  readOnly={isEdit}
                  value={formData.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="student@university.edu.pk"
                />
              </div>
              <div>
                <label style={lbl}>Department {!isEdit && '*'}</label>
                <select style={sel} value={formData.department} onChange={e => set('department', e.target.value)}>
                  <option value="">-- Select Department --</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Reg No {!isEdit && '*'}</label>
                <input style={inp} value={formData.regNo} onChange={e => set('regNo', e.target.value)} placeholder="e.g. FA24-BCE-123"/>
              </div>
              <div>
                <label style={lbl}>Semester</label>
                <input style={inp} value={formData.semester} onChange={e => set('semester', e.target.value)} placeholder="e.g. 5 or 5th"/>
              </div>
              <div>
                <label style={lbl}>GPA (0.0 - 4.0)</label>
                <input type="number" step="0.1" min="0" max="4" style={inp} value={formData.gpa} onChange={e => set('gpa', e.target.value)}/>
              </div>
              <div>
                <label style={lbl}>Attendance %</label>
                <input type="number" min="0" max="100" style={inp} value={formData.attendance} onChange={e => set('attendance', e.target.value)}/>
              </div>
              <div>
                <label style={lbl}>Academic Status</label>
                <select style={sel} value={formData.status} onChange={e => set('status', e.target.value)}>
                  <option>Excellent</option>
                  <option>Good</option>
                  <option>Average</option>
                  <option>Poor</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Profile Pic URL</label>
                <input style={inp} value={formData.profilePic} onChange={e => set('profilePic', e.target.value)} placeholder="https://..."/>
              </div>
              <div>
                <label style={lbl}>Phone</label>
                <input style={inp} value={formData.phone} onChange={e => set('phone', e.target.value)} placeholder="03XXXXXXXXX"/>
              </div>
              <div>
                <label style={lbl}>CNIC / B-Form</label>
                <input style={inp} value={formData.cnic} onChange={e => set('cnic', e.target.value)} placeholder="XXXXX-XXXXXXX-X"/>
              </div>
              <div>
                <label style={lbl}>Date of Birth</label>
                <input type="date" style={inp} value={formData.dob} onChange={e => set('dob', e.target.value)}/>
              </div>
              <div>
                <label style={lbl}>Emergency Contact</label>
                <input style={inp} value={formData.emergencyContact} onChange={e => set('emergencyContact', e.target.value)}/>
              </div>
              <div style={{ gridColumn:'span 3' }}>
                <label style={lbl}>Address</label>
                <textarea style={{ ...inp, height:'65px', resize:'vertical' }} value={formData.address} onChange={e => set('address', e.target.value)}/>
              </div>
            </div>
          </div>
        )}

        {/* COURSES */}
        <button style={secBtn(section==='courses')} onClick={() => setSection(section==='courses' ? '' : 'courses')}>
          <span>📚 Courses ({formData.courses.length})</span>
          {section==='courses' ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
        </button>

        {section==='courses' && (
          <div style={{ background:'#f8fafc', padding:'16px', borderRadius:'10px', marginBottom:'10px' }}>
            {formData.courses.map((c, i) => (
              <div key={i} style={{ background:'white', padding:'12px', borderRadius:'8px', marginBottom:'10px', border:'1px solid #e2e8f0' }}>
                <div style={{ display:'grid', gridTemplateColumns:'2fr 2fr 1fr 1fr 1fr auto', gap:'10px', alignItems:'end' }}>
                  <div>
                    <label style={lbl}>Course Name</label>
                    <input style={inp} value={c.name} onChange={e => setCourse(i, 'name', e.target.value)} placeholder="e.g. Data Structures"/>
                  </div>
                  <div>
                    <label style={lbl}>Instructor</label>
                    <input style={inp} value={c.instructor} onChange={e => setCourse(i, 'instructor', e.target.value)} placeholder="Dr. Name"/>
                  </div>
                  <div>
                    <label style={lbl}>Credit Hours</label>
                    <input type="number" min="1" max="6" style={inp} value={c.creditHours||""} onChange={e => setCourse(i, 'creditHours', e.target.value)} placeholder="3"/>
                  </div>
                  <div>
                    <label style={lbl}>Status</label>
                    <select style={sel} value={c.status} onChange={e => setCourse(i, 'status', e.target.value)}>
                      <option>Excellent</option>
                      <option>Good</option>
                      <option>Average</option>
                      <option>Poor</option>
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Att %</label>
                    <input type="number" min="0" max="100" style={inp} value={c.attendance} onChange={e => setCourse(i, 'attendance', Number(e.target.value))}/>
                  </div>
                  <button onClick={() => delCourse(i)}
                    style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'7px', padding:'8px', cursor:'pointer', alignSelf:'end' }}>
                    <Trash2 size={14} color="#dc2626"/>
                  </button>
                </div>
              </div>
            ))}
            <button onClick={addCourse}
              style={{ display:'flex', alignItems:'center', gap:'6px', background:'#eef2ff', color:'#1a237e', border:'1px solid #c7d2fe', borderRadius:'8px', padding:'8px 16px', cursor:'pointer', fontWeight:'600', fontSize:'13px' }}>
              <Plus size={14}/> Add Course
            </button>
            <SectionButtons />
          </div>
        )}

        {/* TIMETABLE */}
        <button style={secBtn(section==='timetable')} onClick={() => setSection(section==='timetable' ? '' : 'timetable')}>
          <span>🗓️ Timetable</span>
          {section==='timetable' ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
        </button>

        {section==='timetable' && (
          <div style={{ background:'#f8fafc', padding:'16px', borderRadius:'10px', marginBottom:'10px' }}>
            {enrolledCourseNames.length === 0 && (
              <p style={{ fontSize:'12px', color:'#dc2626', margin:'0 0 12px', background:'#fef2f2', padding:'8px 12px', borderRadius:'6px', border:'1px solid #fecaca' }}>
                ⚠️ Pehle Courses section mein courses add karo — timetable mein unhi ka dropdown aayega.
              </p>
            )}
            {DAYS.map(day => (
              <div key={day} style={{ marginBottom:'12px', background:'white', padding:'12px', borderRadius:'8px', border:'1px solid #e2e8f0' }}>
                <div style={{ fontWeight:'700', color:'#1a237e', fontSize:'12px', marginBottom:'10px', textTransform:'uppercase', letterSpacing:'1px' }}>
                  📅 {day}
                </div>
                {(formData.timetable[day] || []).map((slot, i) => (
                  <div key={i} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr auto', gap:'8px', marginBottom:'8px', alignItems:'end' }}>
                    <div>
                      <label style={lbl}>Subject</label>
                      {enrolledCourseNames.length > 0 ? (
                        <select style={sel} value={slot.subject||""} onChange={e => setSlot(day, i, 'subject', e.target.value)}>
                          <option value="">-- Select Subject --</option>
                          {enrolledCourseNames.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      ) : (
                        <input style={inp} value={slot.subject||""} onChange={e => setSlot(day, i, 'subject', e.target.value)} placeholder="Subject name"/>
                      )}
                    </div>
                    <div>
                      <label style={lbl}>Time</label>
                      <select style={sel} value={slot.time||""} onChange={e => setSlot(day, i, 'time', e.target.value)}>
                        <option value="">-- Select Time --</option>
                        {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={lbl}>Room</label>
                      <input style={inp} value={slot.room||""} onChange={e => setSlot(day, i, 'room', e.target.value)} placeholder="Room 101"/>
                    </div>
                    <button onClick={() => delSlot(day, i)}
                      style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'7px', padding:'8px', cursor:'pointer', alignSelf:'end' }}>
                      <Minus size={14} color="#dc2626"/>
                    </button>
                  </div>
                ))}
                <button onClick={() => addSlot(day)}
                  style={{ display:'flex', alignItems:'center', gap:'5px', background:'#f0f4ff', color:'#1a237e', border:'1px solid #c7d2fe', borderRadius:'7px', padding:'6px 12px', cursor:'pointer', fontSize:'12px', fontWeight:'600', marginTop:'4px' }}>
                  <Plus size={12}/> Add Slot
                </button>
              </div>
            ))}
            <SectionButtons />
          </div>
        )}

        {/* FEE HISTORY */}
        <button style={secBtn(section==='fee')} onClick={() => setSection(section==='fee' ? '' : 'fee')}>
          <span>💳 Fee History ({formData.feeHistory.length})</span>
          {section==='fee' ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
        </button>

        {section==='fee' && (
          <div style={{ background:'#f8fafc', padding:'16px', borderRadius:'10px', marginBottom:'10px' }}>
            {formData.feeHistory.map((f, i) => (
              <div key={i} style={{ background:'white', padding:'12px', borderRadius:'8px', marginBottom:'10px', border:'1px solid #e2e8f0' }}>
                <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 2fr 1fr auto', gap:'10px', alignItems:'end' }}>
                  <div>
                    <label style={lbl}>Month</label>
                    <div style={{ display:'flex', gap:'6px' }}>
                      <select style={{ ...sel, flex:2 }}
                        value={f.month ? f.month.split(' ')[0] : ''}
                        onChange={e => {
                          const yr = f.month ? f.month.split(' ')[1] || '2026' : '2026';
                          setFee(i, 'month', e.target.value + ' ' + yr);
                        }}>
                        <option value=''>Month</option>
                        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <select style={{ ...sel, flex:1 }}
                        value={f.month ? f.month.split(' ')[1] || '2026' : '2026'}
                        onChange={e => {
                          const mn = f.month ? f.month.split(' ')[0] || '' : '';
                          setFee(i, 'month', mn + ' ' + e.target.value);
                        }}>
                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={lbl}>Amount (Rs)</label>
                    <input type="number" style={inp} value={f.amount} onChange={e => setFee(i, 'amount', e.target.value)}/>
                  </div>
                  <div>
                    <label style={lbl}>Due Date</label>
                    <input type="date" style={inp} value={f.dueDate} onChange={e => setFee(i, 'dueDate', e.target.value)}/>
                  </div>
                  <div>
                    <label style={lbl}>Status</label>
                    <select style={sel} value={f.status} onChange={e => setFee(i, 'status', e.target.value)}>
                      <option value="Pending">Pending</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                  <button onClick={() => delFee(i)}
                    style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'7px', padding:'8px', cursor:'pointer', alignSelf:'end' }}>
                    <Trash2 size={14} color="#dc2626"/>
                  </button>
                </div>
              </div>
            ))}
            <button onClick={addFee}
              style={{ display:'flex', alignItems:'center', gap:'6px', background:'#eef2ff', color:'#1a237e', border:'1px solid #c7d2fe', borderRadius:'8px', padding:'8px 16px', cursor:'pointer', fontWeight:'600', fontSize:'13px' }}>
              <Plus size={14}/> Add Fee Record
            </button>
          </div>
        )}

        {/* BOTTOM BUTTONS */}
        <div style={{ display:'flex', gap:'12px', marginTop:'24px', paddingTop:'20px', borderTop:'2px solid #f0f4ff' }}>
          <button onClick={handleSave} disabled={loading}
            style={{ display:'flex', alignItems:'center', gap:'8px', background: loading?'#94a3b8':'#059669', color:'white', border:'none', borderRadius:'10px', padding:'12px 28px', cursor: loading?'not-allowed':'pointer', fontWeight:'700', fontSize:'14px' }}>
            <Save size={16}/> {loading ? 'Saving...' : isEdit ? 'Update Student' : 'Save Student'}
          </button>
          <button onClick={handleSaveAndBack} disabled={loading}
            style={{ display:'flex', alignItems:'center', gap:'8px', background: loading?'#94a3b8':'#1a237e', color:'white', border:'none', borderRadius:'10px', padding:'12px 28px', cursor: loading?'not-allowed':'pointer', fontWeight:'700', fontSize:'14px' }}>
            <ArrowLeft size={16}/> {loading ? '...' : 'Save & Back'}
          </button>
          <button onClick={onClose}
            style={{ display:'flex', alignItems:'center', gap:'8px', background:'#f1f5f9', color:'#64748b', border:'1px solid #e2e8f0', borderRadius:'10px', padding:'12px 24px', cursor:'pointer', fontWeight:'600', fontSize:'14px' }}>
            <X size={16}/> Cancel
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdminStudentForm;