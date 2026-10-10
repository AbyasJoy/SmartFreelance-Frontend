import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { 
  TrendingUp, 
  Briefcase, 
  CreditCard, 
  Star, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  DollarSign 
} from 'lucide-react';

const FreelancerDashboard = () => {
  const { user } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [payments, setPayments] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [propRes, payRes, rateRes] = await Promise.all([
          axiosInstance.get(`/proposals/freelancer/${user.id}`),
          axiosInstance.get('/payments/freelancer'),
          axiosInstance.get(`/reviews/user/${user.id}/summary`).catch(() => null),
        ]);

        setProposals(propRes.data || []);
        setPayments(payRes.data || []);
        if (rateRes) setRatingSummary(rateRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load freelancer dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id]);

  const totalSettledEarnings = payments
    .filter((p) => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Freelancer Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Header Banner */}
      <div className="sf-header-card p-4 p-md-5 mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge-sf badge-sf-indigo">Freelancer Workspace</span>
              <span className="text-slate-400 fs-8" style={{ color: '#94a3b8' }}>{user.email}</span>
            </div>
            <h2 className="fw-bold mb-1 text-white fs-3" style={{ letterSpacing: '-0.03em' }}>
              Freelancer Dashboard
            </h2>
            <p className="text-slate-400 mb-0 fs-7" style={{ color: '#94a3b8' }}>
              Track submitted proposals, active milestone deliverables, and settled wallet earnings.
            </p>
          </div>

          {ratingSummary && (
            <div className="p-3 rounded-3 bg-dark bg-opacity-50 border border-secondary border-opacity-25 text-center" style={{ minWidth: '150px' }}>
              <span className="fs-8 text-slate-400 d-block text-uppercase fw-semibold" style={{ color: '#94a3b8' }}>Average Rating</span>
              <div className="fw-bold text-warning fs-5 d-flex align-items-center justify-content-center gap-1 mt-0.5">
                <Star size={16} fill="currentColor" />
                {ratingSummary.averageRating ? ratingSummary.averageRating.toFixed(1) : 'N/A'}
              </div>
              <small className="text-slate-400 fs-8 d-block" style={{ color: '#94a3b8' }}>{ratingSummary.totalReviews || 0} client reviews</small>
            </div>
          )}
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
          <div className="sf-stat-card border-start border-4 border-emerald-500" style={{ borderLeftColor: '#10b981' }}>
            <span className="sf-stat-label d-flex align-items-center gap-1.5">
              <TrendingUp size={14} className="text-success" />
              Total Settled Earnings
            </span>
            <div className="sf-stat-value text-emerald-600" style={{ color: '#059669' }}>
              ${totalSettledEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="fs-8 text-muted mt-1 d-block">Simulated payments released upon milestone approvals</span>
          </div>
        </div>

        <div className="col-md-4">
          <div className="sf-stat-card">
            <span className="sf-stat-label d-flex align-items-center gap-1.5">
              <Briefcase size={14} className="text-indigo-600" style={{ color: '#4f46e5' }} />
              Submitted Proposals
            </span>
            <div className="sf-stat-value">{proposals.length}</div>
            <span className="fs-8 text-muted mt-1 d-block">Across marketplace projects</span>
          </div>
        </div>

        <div className="col-md-4">
          <div className="sf-stat-card">
            <span className="sf-stat-label d-flex align-items-center gap-1.5">
              <CreditCard size={14} className="text-slate-600" />
              Settled Transactions
            </span>
            <div className="sf-stat-value">
              {payments.filter((p) => p.status === 'COMPLETED').length} / {payments.length}
            </div>
            <span className="fs-8 text-muted mt-1 d-block">Completed milestone settlements</span>
          </div>
        </div>
      </div>

      {/* Submitted Proposals Section */}
      <div className="sf-card p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-dark mb-0 fs-6 d-flex align-items-center gap-2">
            <Briefcase size={16} />
            My Submitted Proposals
          </h5>
          <span className="badge-sf badge-sf-neutral">{proposals.length}</span>
        </div>

        {proposals.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted mb-3 fs-7">You have not submitted any proposals yet.</p>
            <Link to="/" className="btn btn-sf-primary btn-sm">
              Browse Marketplace Projects
            </Link>
          </div>
        ) : (
          <div className="sf-table-wrapper">
            <table className="sf-table">
              <thead>
                <tr>
                  <th>Proposal ID</th>
                  <th>Project ID</th>
                  <th>Proposed Price</th>
                  <th>Est. Days</th>
                  <th>Status</th>
                  <th>Cover Letter Preview</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((prop) => (
                  <tr key={prop.id}>
                    <td className="fw-semibold">#{prop.id}</td>
                    <td className="fw-semibold">#{prop.projectId}</td>
                    <td className="fw-bold text-indigo-600" style={{ color: '#4f46e5' }}>${prop.proposedPrice}</td>
                    <td className="text-muted fs-8">{prop.estimatedDays} days</td>
                    <td>
                      <span
                        className={`badge-sf ${
                          prop.status === 'ACCEPTED'
                            ? 'badge-sf-success'
                            : prop.status === 'REJECTED'
                            ? 'badge-sf-danger'
                            : 'badge-sf-warning'
                        }`}
                      >
                        {prop.status}
                      </span>
                    </td>
                    <td className="text-secondary fs-8">
                      {prop.coverLetter && prop.coverLetter.length > 40
                        ? `${prop.coverLetter.substring(0, 40)}...`
                        : prop.coverLetter}
                    </td>
                    <td>
                      <Link to={`/projects/${prop.projectId}`} className="btn btn-sf-outline btn-sm py-1 px-3 fs-8 d-inline-flex align-items-center gap-1">
                        View Project
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

      {/* Simulated Earnings / Payments */}
      <div className="sf-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-dark mb-0 fs-6 d-flex align-items-center gap-2">
            <DollarSign size={16} className="text-success" />
            Simulated Payment Earnings History
          </h5>
          <span className="badge-sf badge-sf-neutral">{payments.length}</span>
        </div>

        {payments.length === 0 ? (
          <p className="text-muted mb-0 fs-7">No simulated payment earnings recorded yet.</p>
        ) : (
          <div className="sf-table-wrapper">
            <table className="sf-table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Project</th>
                  <th>Milestone</th>
                  <th>Amount Earned</th>
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
                    <td className="fw-bold text-success fs-6">${pay.amount}</td>
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

export default FreelancerDashboard;
