import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import { 
  Zap, 
  Briefcase, 
  PlusCircle, 
  Layers, 
  Bot, 
  Bell, 
  ShieldCheck, 
  LogOut
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isClient, isFreelancer, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchUnread = async () => {
      if (isAuthenticated) {
        try {
          const res = await axiosInstance.get('/notifications/unread/count');
          if (isMounted && res.data && typeof res.data.unreadCount === 'number') {
            setUnreadCount(res.data.unreadCount);
          }
        } catch {
          // ignore notification fetch errors
        }
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isAuthenticated, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => (location.pathname === path ? 'active' : '');

  return (
    <nav className="navbar navbar-expand-lg sticky-top sf-navbar">
      <div className="container d-flex align-items-center justify-content-between">
        {/* Brand Logo */}
        <Link className="navbar-brand d-flex align-items-center gap-2 text-decoration-none me-4 py-0" to="/">
          <div className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0" style={{ backgroundColor: '#4f46e5', width: '32px', height: '32px' }}>
            <Zap size={18} className="text-white" />
          </div>
          <span className="sf-brand-logo">SmartFreelance</span>
        </Link>

        {/* Mobile Toggler */}
        <button
          className="navbar-toggler text-white border-0 py-1 px-2"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation & User Section */}
        <div className="collapse navbar-collapse align-items-center" id="navbarNav">
          {/* Main Navigation Links */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 align-items-lg-center gap-lg-1 py-2 py-lg-0">
            <li className="nav-item">
              <Link className={`sf-nav-link ${isActive('/')}`} to="/">
                <Briefcase size={15} />
                <span>Marketplace</span>
              </Link>
            </li>

            {isClient && (
              <>
                <li className="nav-item">
                  <Link className={`sf-nav-link ${isActive('/post-project')}`} to="/post-project">
                    <PlusCircle size={15} />
                    <span>Post Project</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`sf-nav-link ${isActive('/client-dashboard')}`} to="/client-dashboard">
                    <Layers size={15} />
                    <span>Client Dashboard</span>
                  </Link>
                </li>
              </>
            )}

            {isFreelancer && (
              <li className="nav-item">
                <Link className={`sf-nav-link ${isActive('/freelancer-dashboard')}`} to="/freelancer-dashboard">
                  <Layers size={15} />
                  <span>Freelancer Workspace</span>
                </Link>
              </li>
            )}

            {isAdmin && (
              <li className="nav-item">
                <Link className={`sf-nav-link ${isActive('/admin')}`} to="/admin">
                  <ShieldCheck size={15} />
                  <span>Admin Panel</span>
                </Link>
              </li>
            )}

            {isAuthenticated && (
              <>
                <li className="nav-item">
                  <Link className={`sf-nav-link ${isActive('/ai-assistant')}`} to="/ai-assistant">
                    <Bot size={15} style={{ color: '#818cf8' }} />
                    <span>AI Assistant</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`sf-nav-link position-relative ${isActive('/notifications')}`} to="/notifications">
                    <Bell size={15} />
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="badge rounded-pill text-white ms-1 px-1.5 py-0.5" style={{ backgroundColor: '#4f46e5', fontSize: '0.65rem' }}>
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                </li>
              </>
            )}
          </ul>

          {/* Right Action Menu */}
          <div className="d-flex align-items-center gap-2 py-2 py-lg-0 ms-lg-auto">
            {isAuthenticated ? (
              <div className="d-flex align-items-center gap-2.5">
                <Link
                  to="/profile"
                  className="d-flex align-items-center gap-2 px-2.5 py-1 rounded-2 bg-dark bg-opacity-50 border border-secondary border-opacity-25 text-decoration-none transition-all sf-profile-badge-link"
                  title="View & Edit My Profile"
                >
                  <div className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style={{ width: '28px', height: '28px', backgroundColor: '#4f46e5', fontSize: '0.75rem' }}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-start d-none d-sm-block leading-tight">
                    <div className="fw-semibold text-white" style={{ fontSize: '0.8125rem', lineHeight: '1.2' }}>{user?.name}</div>
                    <div className="text-uppercase" style={{ fontSize: '0.65rem', color: '#94a3b8', letterSpacing: '0.04em' }}>{user?.role}</div>
                  </div>
                </Link>
                <button className="btn btn-outline-light btn-sm d-flex align-items-center gap-1.5 px-3 py-1.5" style={{ fontSize: '0.8125rem', borderRadius: '6px' }} onClick={handleLogout}>
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link className="btn btn-outline-light btn-sm px-3 py-1.5" style={{ fontSize: '0.8125rem', borderRadius: '6px' }} to="/login">
                  Sign In
                </Link>
                <Link className="btn btn-sf-primary btn-sm px-3 py-1.5" style={{ fontSize: '0.8125rem', borderRadius: '6px' }} to="/register">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
