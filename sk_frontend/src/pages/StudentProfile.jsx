import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const StudentProfile = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate(); 
  const fileRef = useRef();
  const photoRef = useRef();

  const [form, setForm] = useState({
    phone: "",
    linkedin: "",
    college: "",
    batchYear: "",
    branch: "",
    semester: "",
    skills: [], 
    githubUsername: "",
    techStack: [], 
    experience: "",
    achievements: [""]
  });

  const [resume, setResume] = useState(null);
  const [existingResume, setExistingResume] = useState(null); // 🟢 NAYA STATE: Pehle se upload kiye hue resume ke liye
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });

  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  // ================= GET PROFILE =================
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        const res = await axios.get(
          "http://localhost:5000/api/student/me",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const p = res.data;
        
        const parseArrayData = (data) => {
          if (!data) return [""];
          if (Array.isArray(data)) return data.map(item => String(item));
          return String(data).split("\n\n");
        };

        const parseTags = (data) => {
          if (!data) return [];
          const arr = Array.isArray(data) ? data : String(data).split(",");
          return arr.map(i => {
            if (i && typeof i === 'object') {
              return String(i.label || i.value || JSON.stringify(i));
            }
            return String(i).trim();
          }).filter(Boolean);
        };

        setForm({
          phone: p.phone || "",
          linkedin: p.linkedin || "",
          college: p.college || "",
          batchYear: p.batchYear || "",
          branch: p.branch || "",
          semester: p.semester || "",
          skills: parseTags(p.skills),
          githubUsername: p.githubUsername || "",
          techStack: parseTags(p.techStack),
          experience: p.experience || "",
          achievements: parseArrayData(p.achievements)
        });
        
        // 🚨 PHOTO PREVIEW FIX
        if (p.profilePhoto) {
          const fullPhotoUrl = p.profilePhoto.startsWith('http') 
            ? p.profilePhoto 
            : `${API_URL}${p.profilePhoto}`;
          setPhotoPreview(fullPhotoUrl);
        }

        // 🚨 RESUME PREVIEW FIX (Pehle se upload hua resume show karne ke liye)
        if (p.resumeUrl) {
          setExistingResume(p.resumeUrl);
        }

      } catch (err) {
        console.log("No profile yet or error fetching");
      }
    };
    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (e, index, field) => {
    const newArray = [...form[field]];
    newArray[index] = e.target.value;
    setForm({ ...form, [field]: newArray });
  };

  const addArrayItem = (field) => {
    setForm({ ...form, [field]: [...form[field], ""] });
  };

  const removeArrayItem = (index, field) => {
    const newArray = form[field].filter((_, i) => i !== index);
    setForm({ ...form, [field]: newArray });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file)); 
    }
  };

  const handleTagKeyDown = (e, field) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      const value = e.target.value.trim();
      if (value && !form[field].includes(value)) {
        setForm({ ...form, [field]: [...form[field], value] });
      }
      e.target.value = ''; 
    }
  };

  const removeTag = (indexToRemove, field) => {
    setForm({
      ...form,
      [field]: form[field].filter((_, index) => index !== indexToRemove)
    });
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Safety check ki button click ho raha hai ya nahi
    console.log("Saving Profile Data...");
    setLoading(true);
    setStatus({ type: "", msg: "" });

    const data = new FormData();
    Object.keys(form).forEach(key => {
      if (key === 'achievements') {
        const joinedString = form[key].filter(item => String(item).trim() !== "").join("\n\n");
        data.append(key, joinedString);
      } else if (key === 'skills' || key === 'techStack') {
        data.append(key, form[key].join(","));
      } else {
        data.append(key, form[key]);
      }
    });
    
    // Naya resume ya photo select kiya hai toh hi bhejenge, warna purana database me safe rahega
    if (resume) data.append("resume", resume);
    if (photo) data.append("profilePhoto", photo);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/student/complete",
        data,
        config
      );
      
      console.log("Profile Saved Successfully:", response.data);
      setStatus({ type: "success", msg: "Profile saved successfully!" });
      
      // 100% FORCED REDIRECT TO DASHBOARD
      window.location.href = "/student"; 
      
    } catch (err) {
      console.error("API Error during save:", err);
      const errorMsg = err.response?.data?.message || "Error saving profile ❌";
      setStatus({ 
        type: "error", 
        msg: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg) 
      });
    } finally {
      setLoading(false);
    }
  };

  // Reusable Styles
  const sectionStyle = { background: '#fff', padding: '24px', borderRadius: '18px', border: '1.5px solid #ede8fb', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' };
  const sectionHeaderStyle = { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' };
  const sectionTitleStyle = { margin: 0, fontSize: '18px', color: '#2d1f6e', fontWeight: '700' };
  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '700', color: '#444', marginBottom: '8px' };
  const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #ede8fb', fontSize: '14px', color: '#333', background: '#fcfbff', boxSizing: 'border-box' };
  const textareaStyle = { ...inputStyle, resize: 'vertical', minHeight: '100px', fontFamily: 'inherit' };
  const tagsContainerStyle = { ...inputStyle, display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px 12px' };
  const tagStyle = { display: 'flex', alignItems: 'center', background: '#f3f0ff', color: '#553f9a', padding: '4px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: '600' };
  const tagRemoveBtnStyle = { background: 'none', border: 'none', color: '#553f9a', marginLeft: '6px', cursor: 'pointer', fontSize: '16px', padding: 0, display: 'flex', alignItems: 'center' };
  const tagInputStyle = { border: 'none', outline: 'none', flex: 1, minWidth: '120px', background: 'transparent', fontSize: '14px', color: '#333', padding: '4px 0' };
  const removeBtnStyle = { background: '#fff5f5', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '10px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
  const addBtnStyle = { marginTop: '10px', background: 'transparent', color: '#553f9a', border: '1.5px dashed #553f9a', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' };

  return (
    <div className="sp-profile-container" style={{ padding: '20px', maxWidth: '850px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '26px', color: '#2d1f6e', fontWeight: '800', margin: '0 0 5px 0' }}>Student Profile</h2>
        <p style={{ color: '#9d8ec4', fontSize: '14px', margin: 0 }}>Update your professional and educational details.</p>
      </div>

      {status.msg && (
        <div style={{ 
          padding: '14px 20px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', fontWeight: '600',
          background: status.type === 'success' ? '#f0fdf4' : '#fff5f5',
          color: status.type === 'success' ? '#16a34a' : '#dc2626',
          border: `1px solid ${status.type === 'success' ? '#86efac' : '#fca5a5'}`,
        }}>
          {String(status.msg)}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Photo Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px' }}>
          <div 
            onClick={() => photoRef.current.click()}
            style={{ 
              width: '110px', height: '110px', borderRadius: '50%', background: '#f8f7ff', 
              border: '2px dashed #7b5fc4', display: 'flex', justifyContent: 'center', 
              alignItems: 'center', cursor: 'pointer', overflow: 'hidden'
            }}
          >
            {photoPreview ? (
              <img src={photoPreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ textAlign: 'center', color: '#553f9a' }}>
                <span style={{ fontSize: '24px' }}>📷</span>
                <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Upload</div>
              </div>
            )}
          </div>
          <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
          {photoPreview && (
            <button type="button" onClick={() => { setPhoto(null); setPhotoPreview(null); }} style={{ background: 'transparent', color: '#dc2626', border: 'none', cursor: 'pointer', fontSize: '11px', marginTop: '5px' }}>Remove</button>
          )}
        </div>

        {/* Contact Info */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}><span>📱</span><h3 style={sectionTitleStyle}>Contact Info</h3></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="field">
              <label style={labelStyle}>Phone Number</label>
              <input name="phone" type="tel" style={inputStyle} value={form.phone} onChange={handleChange} />
            </div>
            <div className="field">
              <label style={labelStyle}>LinkedIn URL</label>
              <input name="linkedin" type="url" style={inputStyle} value={form.linkedin} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Academic Details */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}><span>🎓</span><h3 style={sectionTitleStyle}>Academic Details</h3></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="field" style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>College Name</label>
              <input name="college" style={inputStyle} value={form.college} onChange={handleChange} />
            </div>
            <div className="field">
              <label style={labelStyle}>Batch Year</label>
              <input name="batchYear" type="number" style={inputStyle} value={form.batchYear} onChange={handleChange} />
            </div>
            <div className="field">
              <label style={labelStyle}>Branch</label>
              <input name="branch" style={inputStyle} value={form.branch} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Technical Profile (TAGS UI) */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}><span>💻</span><h3 style={sectionTitleStyle}>Technical Profile</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="field">
              <label style={labelStyle}>GitHub Username</label>
              <input name="githubUsername" style={inputStyle} value={form.githubUsername} onChange={handleChange} />
            </div>
            <div className="field">
              <label style={labelStyle}>Skills (Enter dabayein add karne ke liye)</label>
              <div style={tagsContainerStyle}>
                {form.skills.map((skill, index) => (
                  <div key={index} style={tagStyle}>
                    {String(skill)}
                    <button type="button" onClick={() => removeTag(index, 'skills')} style={tagRemoveBtnStyle}>&times;</button>
                  </div>
                ))}
                <input type="text" placeholder="Add Skill..." onKeyDown={(e) => handleTagKeyDown(e, 'skills')} style={tagInputStyle} />
              </div>
            </div>
            <div className="field">
              <label style={labelStyle}>Tech Stack Expertise</label>
              <div style={tagsContainerStyle}>
                {form.techStack.map((tech, index) => (
                  <div key={index} style={tagStyle}>
                    {String(tech)}
                    <button type="button" onClick={() => removeTag(index, 'techStack')} style={tagRemoveBtnStyle}>&times;</button>
                  </div>
                ))}
                <input type="text" placeholder="Add Tech..." onKeyDown={(e) => handleTagKeyDown(e, 'techStack')} style={tagInputStyle} />
              </div>
            </div>
          </div>
        </div>

        {/* Experience Section */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}><span>🏆</span><h3 style={sectionTitleStyle}>Experience & Achievements</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="field">
              <label style={labelStyle}>Work Experience</label>
              <textarea name="experience" style={textareaStyle} value={form.experience} onChange={handleChange} />
            </div>
            <div>
              <label style={labelStyle}>Key Achievements</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {form.achievements.map((ach, index) => (
                  <div key={index} style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ ...inputStyle, width: '40px', textAlign: 'center', background: '#f3f0ff', border: 'none', fontWeight: 'bold' }}>{index + 1}</div>
                    <textarea style={{ ...textareaStyle, flex: 1, minHeight: '50px' }} value={String(ach)} onChange={(e) => handleArrayChange(e, index, 'achievements')} />
                    {form.achievements.length > 1 && <button type="button" onClick={() => removeArrayItem(index, 'achievements')} style={removeBtnStyle}>✕</button>}
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => addArrayItem('achievements')} style={addBtnStyle}>+ Add More</button>
            </div>
          </div>
        </div>

        {/* 🟢 NAYA RESUME SECTION */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}><span>📄</span><h3 style={sectionTitleStyle}>Resume</h3></div>
          
          {resume ? (
            // Agar User ne abhi NAYA resume select kiya hai
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#f8f7ff', borderRadius: '10px' }}>
              <span style={{ fontSize: '20px' }}>📎</span>
              <span style={{ flex: 1, fontSize: '13px', fontWeight: '600' }}>{String(resume.name)}</span>
              <button type="button" onClick={() => setResume(null)} style={{ color: '#dc2626', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Remove</button>
            </div>
          ) : existingResume ? (
            // Agar Database me pehle se Resume saved hai
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
              <span style={{ fontSize: '20px' }}>✅</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#16a34a' }}>Resume Already Uploaded</div>
                <a href={`http://localhost:5000${existingResume}`} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'underline' }}>View Resume</a>
              </div>
              <button type="button" onClick={() => fileRef.current.click()} style={{ color: '#553f9a', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', padding: '5px 10px', backgroundColor: '#e0e7ff', borderRadius: '5px' }}>Change Resume</button>
            </div>
          ) : (
            // Agar koi resume nahi hai
            <div onClick={() => fileRef.current.click()} style={{ padding: '25px', textAlign: 'center', border: '1.5px dashed #7b5fc4', borderRadius: '12px', cursor: 'pointer', background: '#fafafa' }}>
              <span style={{ fontSize: '24px' }}>☁️</span>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#553f9a', marginTop: '5px' }}>Click to upload resume (PDF)</div>
            </div>
          )}
          
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={(e) => setResume(e.target.files[0])} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button type="submit" disabled={loading} style={{ background: 'linear-gradient(135deg,#553f9a,#7b5fc4)', color: 'white', border: 'none', padding: '14px 45px', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? "Saving..." : "💾 Save My Profile"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentProfile;