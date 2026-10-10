import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Phone, 
  FileText, 
  Briefcase, 
  Award, 
  Save, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [title, setTitle] = useState('');
  const [skillsList, setSkillsList] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const res = await axiosInstance.get('/users/me');
        const data = res.data || {};
        setName(data.name || user?.name || '');
        setEmail(data.email || user?.email || '');
        setRole(data.role || user?.role || 'FREELANCER');
        setPhone(data.phone || '');
        setBio(data.bio || '');
        setTitle(data.title || '');
        setSkillsList(data.skillsList || '');
      } catch (err) {
        setErrorMsg('Failed to load profile details. Using session information.');
        setName(user?.name || '');
        setEmail(user?.email || '');
        setRole(user?.role || '');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Full name cannot be empty.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        title: title.trim(),
        skillsList: skillsList.trim(),
      };

      const res = await axiosInstance.put('/users/me', payload);
      const updated = res.data;

      setSuccessMsg('Profile updated successfully!');
      updateUser({
        name: updated.name,
        email: updated.email,
        role: updated.role,
      });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Header Card */}
          <div className="sf-header-card p-4 mb-4">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold fs-4 flex-shrink-0"
                style={{ width: '64px', height: '64px', backgroundColor: '#4f46e5' }}
              >
                {name ? name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className="badge-sf badge-sf-indigo d-inline-flex align-items-center gap-1">
                    <Shield size={12} />
                    {role || 'USER'}
                  </span>
                  <span className="text-slate-400 fs-8" style={{ color: '#94a3b8' }}>
                    Active Member Account
                  </span>
                </div>
                <h2 className="fw-bold mb-0 text-white fs-4" style={{ letterSpacing: '-0.02em' }}>
                  {name || 'My Profile'}
                </h2>
                <div className="text-slate-400 fs-8 mt-0.5" style={{ color: '#cbd5e1' }}>
                  {email}
                </div>
              </div>
            </div>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="alert alert-success alert-dismissible fade show mb-4 d-flex align-items-center gap-2" role="alert">
              <CheckCircle2 size={18} className="text-success flex-shrink-0" />
              <div className="fs-7">{successMsg}</div>
              <button type="button" className="btn-close ms-auto" onClick={() => setSuccessMsg('')}></button>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="alert alert-danger alert-dismissible fade show mb-4 d-flex align-items-center gap-2" role="alert">
              <AlertCircle size={18} className="text-danger flex-shrink-0" />
              <div className="fs-7">{errorMsg}</div>
              <button type="button" className="btn-close ms-auto" onClick={() => setErrorMsg('')}></button>
            </div>
          )}

          {/* Form Card */}
          <div className="sf-card p-4 p-md-5">
            <div className="border-bottom pb-3 mb-4">
              <h3 className="fw-bold text-dark mb-1 fs-5" style={{ letterSpacing: '-0.02em' }}>
                Account &amp; Professional Details
              </h3>
              <p className="text-muted mb-0 fs-7">
                Update your contact info, headline title, bio, and technical skills.
              </p>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-indigo-600" role="status" style={{ color: '#4f46e5' }}></div>
                <div className="fs-7 text-muted mt-2">Loading profile information...</div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label d-flex align-items-center gap-1.5">
                      <UserIcon size={14} className="text-muted" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label d-flex align-items-center gap-1.5">
                      <Phone size={14} className="text-muted" />
                      Phone Number
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 019-2834"
                    />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label d-flex align-items-center gap-1.5">
                      <Mail size={14} className="text-muted" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control bg-light"
                      value={email}
                      disabled
                      readOnly
                    />
                    <div className="form-text fs-8 text-muted">Email cannot be changed directly.</div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label d-flex align-items-center gap-1.5">
                      <Shield size={14} className="text-muted" />
                      Platform Account Role
                    </label>
                    <input
                      type="text"
                      className="form-control bg-light text-uppercase fw-semibold"
                      value={role}
                      disabled
                      readOnly
                    />
                    <div className="form-text fs-8 text-muted">Role permissions are assigned by administrator.</div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label d-flex align-items-center gap-1.5">
                    <Briefcase size={14} className="text-muted" />
                    Professional Headline / Title
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Full-Stack Engineer &amp; Cloud Architect"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label d-flex align-items-center gap-1.5">
                    <Award size={14} className="text-muted" />
                    Technical Skills &amp; Specialties
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={skillsList}
                    onChange={(e) => setSkillsList(e.target.value)}
                    placeholder="e.g. React, Java, Spring Boot, MySQL, Docker, REST APIs"
                  />
                  <div className="form-text fs-8 text-muted">Comma-separated list of your primary tech stack.</div>
                </div>

                <div className="mb-4">
                  <label className="form-label d-flex align-items-center gap-1.5">
                    <FileText size={14} className="text-muted" />
                    Professional Bio &amp; Overview
                  </label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your background, domain expertise, project achievements, or client expectations..."
                  ></textarea>
                </div>

                <div className="d-flex justify-content-end pt-3 border-top">
                  <button
                    type="submit"
                    className="btn btn-sf-primary px-4 d-inline-flex align-items-center gap-1.5"
                    disabled={saving}
                  >
                    {saving ? (
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                    ) : (
                      <>
                        <Save size={15} />
                        Save Profile Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
