import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { 
  Layers, 
  PlusCircle, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  FileText, 
  ShieldCheck,
  CreditCard
} from 'lucide-react';

const ClientDashboard = () => {
  const { user } = useAuth();
  const [myProjects, setMyProjects] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [projRes, payRes] = await Promise.all([
          axiosInstance.get('/projects'),
          axiosInstance.get('/payments/client'),
        ]);

        const clientProjects = (projRes.data || []).filter((p) => Number(p.clientId) === Number(user.id));
        setMyProjects(clientProjects);
        setPayments(payRes.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Client Dashboard...</span>
        </div>
      </div>
    );
  }

  const completedProjectsCount = myProjects.filter((p) => p.status === 'COMPLETED').length;

  return (
    <div className="container py-4">
      {/* Header Banner */}
      <div className="sf-header-card p-4 p-md-5 mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge-sf badge-sf-indigo">Client Portal</span>
              <span className="text-slate-400 fs-8" style={{ color: '#94a3b8' }}>{user.email}</span>
            </div>
            <h2 className="fw-bold mb-1 text-white fs-3" style={{ letterSpacing: '-0.03em' }}>
              Client Dashboard
            </h2>
            <p className="text-slate-400 mb-0 fs-7" style={{ color: '#94a3b8' }}>
              Manage your posted marketplace projects, milestone progress, and simulated settlements.
            </p>
          </div>
          <Link to="/post-project" className="btn btn-sf-primary d-inline-flex align-items-center gap-1.5">
            <PlusCircle size={16} />
            Post New Project
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger shadow-sm mb-4" role="alert">
          {error}
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="sf-stat-card">
            <span className="sf-stat-label">Total Posted Projects</span>
            <div className="sf-stat-value">{myProjects.length}</div>
            <span className="fs-8 text-muted mt-1 d-block">Active on marketplace</span>
          </div>
        </div>

        <div className="col-md-4">
          <div className="sf-stat-card">
            <span className="sf-stat-label">Completed Projects</span>
            <div className="sf-stat-value text-indigo-600" style={{ color: '#4f46e5' }}>{completedProjectsCount}</div>
            <span className="fs-8 text-muted mt-1 d-block">All milestones approved</span>
          </div>
        </div>

        <div className="col-md-4">
          <div className="sf-stat-card">
            <span className="sf-stat-label">Settled Milestone Transactions</span>
            <div className="sf-stat-value">{payments.length}</div>
            <span className="fs-8 text-muted mt-1 d-block">Escrow settlements recorded</span>
          </div>
        </div>
      </div>

      {/* Projects List Section */}
      <div className="sf-card p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-dark mb-0 fs-6 d-flex align-items-center gap-2">
            <FileText size={16} />
            My Posted Projects
          </h5>
          <span className="badge-sf badge-sf-neutral">{myProjects.length}</span>
        </div>

        {myProjects.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted mb-3 fs-7">You have not posted any projects yet.</p>
            <Link to="/post-project" className="btn btn-sf-primary btn-sm">
              Post Your First Project
            </Link>
          </div>
        ) : (
          <div className="sf-table-wrapper">
            <table className="sf-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Project Title</th>
                  <th>Budget</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {myProjects.map((p) => (
                  <tr key={p.id}>
                    <td className="fw-semibold">#{p.id}</td>
                    <td className="fw-bold text-dark">{p.title}</td>
                    <td className="fw-bold text-indigo-600" style={{ color: '#4f46e5' }}>${p.budget}</td>
                    <td className="text-muted fs-8">{p.deadline}</td>
                    <td>
                      <span
                        className={`badge-sf ${
                          p.status === 'OPEN'
                            ? 'badge-sf-success'
                            : p.status === 'COMPLETED'
                            ? 'badge-sf-info'
                            : 'badge-sf-warning'
                        }`}
                      >
                        <CheckCircle2 size={12} />
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/projects/${p.id}`} className="btn btn-sf-outline btn-sm py-1 px-3 fs-8 d-inline-flex align-items-center gap-1">
                        Manage
                        <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Simulated Payments History */}
      <div className="sf-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-dark mb-0 fs-6 d-flex align-items-center gap-2">
            <CreditCard size={16} />
            Simulated Payment &amp; Settlement History
          </h5>
          <span className="badge-sf badge-sf-neutral">{payments.length}</span>
        </div>

        {payments.length === 0 ? (
          <p className="text-muted mb-0 fs-7">No simulated payment records found.</p>
        ) : (
          <div className="sf-table-wrapper">
            <table className="sf-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Project</th>
                  <th>Milestone</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Settlement Date</th>
                  <th>Reference</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((pay) => (
                  <tr key={pay.id}>
                    <td className="fw-semibold">#{pay.id}</td>
                    <td>
                      <Link to={`/projects/${pay.projectId}`} className="text-decoration-none fw-semibold text-dark">
                        #{pay.projectId} {pay.projectTitle ? `- ${pay.projectTitle}` : ''}
                      </Link>
                    </td>
                    <td className="text-secondary fs-8">
                      #{pay.milestoneId} {pay.milestoneTitle ? `- ${pay.milestoneTitle}` : ''}
                    </td>
                    <td className="fw-bold text-success">${pay.amount}</td>
                    <td>
                      <span className={`badge-sf ${pay.status === 'COMPLETED' ? 'badge-sf-success' : 'badge-sf-warning'}`}>
                        {pay.status}
                      </span>
                    </td>
                    <td className="text-muted fs-8">{pay.paymentDate || 'N/A'}</td>
                    <td className="text-muted font-monospace fs-8">{pay.transactionReference || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
