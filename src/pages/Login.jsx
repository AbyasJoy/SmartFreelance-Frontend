import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      if (user?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.response && err.response.status === 401) {
        setError('Invalid email or password.');
      } else {
        setError('Login failed. Please check your credentials and backend connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center my-md-4">
        <div className="col-md-6 col-lg-5">
          <div className="sf-card p-4 p-md-5">
            {/* Header Brand Icon */}
            <div className="text-center mb-4">
              <div className="d-inline-flex p-2.5 rounded-3 bg-indigo-600 mb-3" style={{ backgroundColor: '#4f46e5' }}>
                <Zap size={24} className="text-white" />
              </div>
              <h3 className="fw-bold text-dark mb-1 fs-4" style={{ letterSpacing: '-0.02em' }}>Welcome Back</h3>
              <p className="text-muted fs-7 mb-0">Sign in to access your SmartFreelance account</p>
            </div>

            {error && (
              <div className="alert alert-danger alert-dismissible fade show mb-4 d-flex align-items-center gap-2" role="alert">
                <AlertCircle size={16} className="text-danger flex-shrink-0" />
                <div className="fs-7">{error}</div>
                <button type="button" className="btn-close ms-auto" onClick={() => setError('')}></button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
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

              <div className="mb-4">
                <label className="form-label">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0 text-muted">
                    <Lock size={15} />
                  </span>
                  <input
                    type="password"
                    className="form-control border-start-0 ps-0"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-sf-primary w-100 py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <span>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Signing in...
                  </span>
                ) : (
                  <>
                    Sign In
                    <LogIn size={15} />
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-4 pt-3 border-top">
              <p className="text-muted fs-7 mb-0">
                Don't have an account?{' '}
                <Link to="/register" className="fw-semibold text-indigo-600 text-decoration-none" style={{ color: '#4f46e5' }}>
                  Create an Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
