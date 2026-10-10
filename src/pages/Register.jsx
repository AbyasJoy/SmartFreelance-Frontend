import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Mail, Lock, User as UserIcon, UserCheck, Briefcase, AlertCircle, CheckCircle2 } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('FREELANCER');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, role);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Registration failed. Email may already be in use.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center my-md-4">
        <div className="col-md-7 col-lg-6">
          <div className="sf-card p-4 p-md-5">
            {/* Header Brand Icon */}
            <div className="text-center mb-4">
              <div className="d-inline-flex p-2.5 rounded-3 bg-indigo-600 mb-3" style={{ backgroundColor: '#4f46e5' }}>
                <Zap size={24} className="text-white" />
              </div>
              <h3 className="fw-bold text-dark mb-1 fs-4" style={{ letterSpacing: '-0.02em' }}>Create an Account</h3>
              <p className="text-muted fs-7 mb-0">Join SmartFreelance Marketplace as a Client or Freelancer</p>
            </div>

            {error && (
              <div className="alert alert-danger alert-dismissible fade show mb-4 d-flex align-items-center gap-2" role="alert">
                <AlertCircle size={16} className="text-danger flex-shrink-0" />
                <div className="fs-7">{error}</div>
                <button type="button" className="btn-close ms-auto" onClick={() => setError('')}></button>
              </div>
            )}

            {success && (
              <div className="alert alert-success fade show mb-4 d-flex align-items-center gap-2" role="alert">
                <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                <div className="fs-7">{success}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Full Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0 text-muted">
                    <UserIcon size={15} />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="e.g. Alex Turner"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0 text-muted">
                    <Mail size={15} />
                  </span>
                  <input
                    type="email"
                    className="form-control border-start-0 ps-0"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0 text-muted">
                    <Lock size={15} />
                  </span>
                  <input
                    type="password"
                    className="form-control border-start-0 ps-0"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label">Select Account Role</label>
                <div className="row g-2">
                  <div className="col-6">
                    <input
                      type="radio"
                      className="btn-check"
                      name="roleOptions"
                      id="roleFreelancer"
                      value="FREELANCER"
                      checked={role === 'FREELANCER'}
                      onChange={(e) => setRole(e.target.value)}
                    />
                    <label className={`btn w-100 p-3 rounded-3 border text-start ${role === 'FREELANCER' ? 'border-indigo-600 bg-indigo-50' : 'bg-white'}`} htmlFor="roleFreelancer" style={{ borderColor: role === 'FREELANCER' ? '#4f46e5' : undefined, backgroundColor: role === 'FREELANCER' ? '#e0e7ff' : undefined }}>
                      <div className="fw-semibold text-dark fs-7 d-flex align-items-center gap-1.5">
                        <Briefcase size={14} className="text-indigo-600" />
                        Freelancer
                      </div>
                      <small className="text-muted d-block fs-8 mt-0.5">Browse &amp; bid on projects</small>
                    </label>
                  </div>

                  <div className="col-6">
                    <input
                      type="radio"
                      className="btn-check"
                      name="roleOptions"
                      id="roleClient"
                      value="CLIENT"
                      checked={role === 'CLIENT'}
                      onChange={(e) => setRole(e.target.value)}
                    />
                    <label className={`btn w-100 p-3 rounded-3 border text-start ${role === 'CLIENT' ? 'border-indigo-600 bg-indigo-50' : 'bg-white'}`} htmlFor="roleClient" style={{ borderColor: role === 'CLIENT' ? '#4f46e5' : undefined, backgroundColor: role === 'CLIENT' ? '#e0e7ff' : undefined }}>
                      <div className="fw-semibold text-dark fs-7 d-flex align-items-center gap-1.5">
                        <UserCheck size={14} className="text-indigo-600" />
                        Client
                      </div>
                      <small className="text-muted d-block fs-8 mt-0.5">Post projects &amp; hire</small>
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-sf-primary w-100 py-2.5 fw-bold"
                disabled={loading}
              >
                {loading ? (
                  <span>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="text-center mt-4 pt-3 border-top">
              <p className="text-muted fs-7 mb-0">
                Already have an account?{' '}
                <Link to="/login" className="fw-semibold text-indigo-600 text-decoration-none" style={{ color: '#4f46e5' }}>
                  Sign In Here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
