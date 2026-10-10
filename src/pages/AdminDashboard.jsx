import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Briefcase, 
  Tag,
  Layers,
  TrendingUp
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Stats
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Admin Users
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Admin Projects & Proposals
  const [adminProjects, setAdminProjects] = useState([]);
  const [adminProposals, setAdminProposals] = useState([]);
  const [adminPayments, setAdminPayments] = useState([]);

  // Categories & Skills
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newSkillName, setNewSkillName] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch Dashboard Overview Stats
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await axiosInstance.get('/admin/dashboard');
      setStats(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch Admin Users
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await axiosInstance.get('/admin/users?page=0&size=50&sortBy=id&sortDir=asc');
      setUsersList(res.data.content || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users list.');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch Admin Marketplace Items
  const fetchMarketplace = async () => {
    try {
      const [pRes, propRes, payRes] = await Promise.all([
        axiosInstance.get('/admin/projects?page=0&size=50'),
        axiosInstance.get('/admin/proposals?page=0&size=50'),
        axiosInstance.get('/admin/payments?page=0&size=50'),
      ]);
      setAdminProjects(pRes.data.content || []);
      setAdminProposals(propRes.data.content || []);
      setAdminPayments(payRes.data.content || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load marketplace items.');
    }
  };

  // Fetch Categories & Skills
  const fetchMetadata = async () => {
    try {
      const [cRes, sRes] = await Promise.all([
        axiosInstance.get('/admin/categories'),
        axiosInstance.get('/admin/skills'),
      ]);
      setCategories(cRes.data || []);
      setSkills(sRes.data || []);
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'marketplace') fetchMarketplace();
    if (activeTab === 'metadata') fetchMetadata();
  }, [activeTab]);

  // Toggle User Activation
  const handleToggleUserStatus = async (targetUser) => {
    setError('');
    setSuccessMsg('');
    try {
      const res = await axiosInstance.patch(`/admin/users/${targetUser.id}/status`, {
        active: !targetUser.active,
      });
      setSuccessMsg(`User #${targetUser.id} status updated to ${res.data.active ? 'ACTIVE' : 'INACTIVE'}.`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  // Create Category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName) return;
    try {
      await axiosInstance.post('/admin/categories', {
        name: newCatName,
        description: newCatDesc,
        active: true,
      });
      setNewCatName('');
      setNewCatDesc('');
      setSuccessMsg('Category created successfully!');
      fetchMetadata();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category.');
    }
  };

  // Toggle Category Status
  const handleToggleCategoryStatus = async (cat) => {
    try {
      await axiosInstance.patch(`/admin/categories/${cat.id}/status`, {
        active: !cat.active,
      });
      fetchMetadata();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update category status.');
    }
  };

  // Create Skill
  const handleCreateSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName) return;
    try {
      await axiosInstance.post('/admin/skills', {
        name: newSkillName,
        active: true,
      });
      setNewSkillName('');
      setSuccessMsg('Skill created successfully!');
      fetchMetadata();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create skill.');
    }
  };

  // Toggle Skill Status
  const handleToggleSkillStatus = async (skill) => {
    try {
      await axiosInstance.patch(`/admin/skills/${skill.id}/status`, {
        active: !skill.active,
      });
      fetchMetadata();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update skill status.');
    }
  };

  return (
    <div className="container py-4">
      {/* Header Banner */}
      <div className="sf-header-card p-4 p-md-5 mb-4">
        <div className="d-flex align-items-center gap-2 mb-2">
          <span className="badge-sf badge-sf-indigo">System Administrator</span>
          <span className="text-slate-400 fs-8" style={{ color: '#94a3b8' }}>{user.email}</span>
        </div>
        <h2 className="fw-bold mb-1 text-white fs-3" style={{ letterSpacing: '-0.03em' }}>
          Admin Management Panel
        </h2>
        <p className="text-slate-400 mb-0 fs-7" style={{ color: '#94a3b8' }}>
          Overview metrics, user moderation, marketplace items, and skill taxonomies.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
          {successMsg}
          <button type="button" className="btn-close" onClick={() => setSuccessMsg('')}></button>
        </div>
      )}

      {/* Modern Tabs Navigation */}
      <div className="sf-tabs mb-4">
        <button
          className={`sf-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview Metrics
        </button>
        <button
          className={`sf-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
        <button
          className={`sf-tab-btn ${activeTab === 'marketplace' ? 'active' : ''}`}
          onClick={() => setActiveTab('marketplace')}
        >
          Marketplace Audits
        </button>
        <button
          className={`sf-tab-btn ${activeTab === 'metadata' ? 'active' : ''}`}
          onClick={() => setActiveTab('metadata')}
        >
          Categories &amp; Skills
        </button>
      </div>

      {/* TAB 1: OVERVIEW METRICS */}
      {activeTab === 'overview' && (
        <div>
          {loadingStats ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : stats ? (
            <div className="row g-3">
              <div className="col-md-3 col-6">
                <div className="sf-stat-card">
                  <span className="sf-stat-label d-flex align-items-center gap-1">
                    <Users size={14} className="text-indigo-600" />
                    Total Registered Users
                  </span>
                  <div className="sf-stat-value">{stats.totalUsers}</div>
                  <span className="fs-8 text-muted mt-1 d-block">{stats.activeUsers} Active Accounts</span>
                </div>
              </div>

              <div className="col-md-3 col-6">
                <div className="sf-stat-card">
                  <span className="sf-stat-label">Clients / Freelancers</span>
                  <div className="sf-stat-value">
                    {stats.totalClients} / {stats.totalFreelancers}
                  </div>
                  <span className="fs-8 text-muted mt-1 d-block">Role Breakdown</span>
                </div>
              </div>

              <div className="col-md-3 col-6">
                <div className="sf-stat-card">
                  <span className="sf-stat-label d-flex align-items-center gap-1">
                    <Briefcase size={14} className="text-primary" />
                    Total Projects
                  </span>
                  <div className="sf-stat-value">{stats.totalProjects}</div>
                  <span className="fs-8 text-muted mt-1 d-block">{stats.totalCompletedProjects} Completed</span>
                </div>
              </div>

              <div className="col-md-3 col-6">
                <div className="sf-stat-card">
                  <span className="sf-stat-label d-flex align-items-center gap-1">
                    <TrendingUp size={14} className="text-success" />
                    Total Settled Amount
                  </span>
                  <div className="sf-stat-value text-success">${stats.totalSettledAmount}</div>
                  <span className="fs-8 text-muted mt-1 d-block">{stats.totalCompletedPayments} Settlements</span>
                </div>
              </div>

              {stats.projectsByStatus && (
                <div className="col-12 mt-3">
                  <div className="sf-card p-4">
                    <h6 className="fw-bold text-dark mb-3 fs-6">Projects Grouped by Status</h6>
                    <div className="row g-3">
                      {Object.entries(stats.projectsByStatus).map(([st, cnt]) => (
                        <div className="col-md-2 col-4 text-center" key={st}>
                          <div className="p-3 border rounded-3 bg-slate-50" style={{ backgroundColor: '#f8fafc' }}>
                            <span className="badge-sf badge-sf-neutral mb-1">{st}</span>
                            <h4 className="fw-bold text-dark mb-0">{cnt}</h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="sf-card p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-dark mb-0 fs-6 d-flex align-items-center gap-2">
              <Users size={16} />
              Platform User Directory
            </h5>
            <span className="badge-sf badge-sf-neutral">{usersList.length}</span>
          </div>

          {loadingUsers ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : (
            <div className="sf-table-wrapper">
              <table className="sf-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u.id}>
                      <td className="fw-semibold">#{u.id}</td>
                      <td className="fw-bold text-dark">{u.name}</td>
                      <td className="text-secondary">{u.email}</td>
                      <td>
                        <span
                          className={`badge-sf ${
                            u.role === 'ADMIN'
                              ? 'badge-sf-danger'
                              : u.role === 'CLIENT'
                              ? 'badge-sf-indigo'
                              : 'badge-sf-neutral'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge-sf ${u.active ? 'badge-sf-success' : 'badge-sf-neutral'}`}>
                          {u.active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td>
                        {u.id === user.id ? (
                          <span className="text-muted fs-8 fst-italic">Logged in Admin</span>
                        ) : (
                          <button
                            className={`btn btn-sm ${u.active ? 'btn-sf-outline text-danger border-rose-200' : 'btn-sf-outline text-success'}`}
                            onClick={() => handleToggleUserStatus(u)}
                          >
                            {u.active ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MARKETPLACE MANAGEMENT */}
      {activeTab === 'marketplace' && (
        <div className="row g-4">
          <div className="col-12">
            <div className="sf-card p-4">
              <h5 className="fw-bold text-dark mb-3 fs-6 d-flex align-items-center gap-2">
                <Briefcase size={16} />
                All Marketplace Projects
              </h5>
              <div className="sf-table-wrapper">
                <table className="sf-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Budget</th>
                      <th>Status</th>
                      <th>Client ID</th>
                      <th>Freelancer ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminProjects.map((p) => (
                      <tr key={p.id}>
                        <td className="fw-semibold">#{p.id}</td>
                        <td className="fw-bold text-dark">{p.title}</td>
                        <td className="fw-bold text-indigo-600" style={{ color: '#4f46e5' }}>${p.budget}</td>
                        <td>
                          <span className="badge-sf badge-sf-neutral">{p.status}</span>
                        </td>
                        <td>#{p.clientId}</td>
                        <td>{p.freelancerId ? `#${p.freelancerId}` : 'None'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="sf-card p-4 h-100">
              <h5 className="fw-bold text-dark mb-3 fs-6">Proposals Audit ({adminProposals.length})</h5>
              <div className="sf-table-wrapper">
                <table className="sf-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Proj ID</th>
                      <th>Price</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminProposals.map((pr) => (
                      <tr key={pr.id}>
                        <td>#{pr.id}</td>
                        <td>#{pr.projectId}</td>
                        <td className="fw-bold">${pr.proposedPrice}</td>
                        <td>
                          <span className="badge-sf badge-sf-neutral">{pr.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="sf-card p-4 h-100">
              <h5 className="fw-bold text-dark mb-3 fs-6">Payments Audit ({adminPayments.length})</h5>
              <div className="sf-table-wrapper">
                <table className="sf-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Ref</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminPayments.map((py) => (
                      <tr key={py.id}>
                        <td>#{py.id}</td>
                        <td className="fw-bold text-success">${py.amount}</td>
                        <td>
                          <span className="badge-sf badge-sf-success">{py.status}</span>
                        </td>
                        <td className="font-monospace fs-8">{py.transactionReference || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CATEGORIES & SKILLS */}
      {activeTab === 'metadata' && (
        <div className="row g-4">
          <div className="col-md-6">
            <div className="sf-card p-4">
              <h5 className="fw-bold text-dark mb-3 fs-6 d-flex align-items-center gap-2">
                <Tag size={16} />
                Marketplace Categories
              </h5>

              <form onSubmit={handleCreateCategory} className="mb-4 p-3 border rounded-3 bg-slate-50" style={{ backgroundColor: '#f8fafc' }}>
                <h6 className="fw-bold text-dark mb-2 fs-7">+ Add Category</h6>
                <input
                  type="text"
                  className="form-control form-control-sm mb-2"
                  placeholder="Category Name"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  required
                />
                <input
                  type="text"
                  className="form-control form-control-sm mb-2"
                  placeholder="Description"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                />
                <button type="submit" className="btn btn-sf-primary btn-sm">
                  Add Category
                </button>
              </form>

              <div className="sf-table-wrapper">
                <table className="sf-table">
                  <tbody>
                    {categories.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <strong className="text-dark d-block">{c.name}</strong>
                          <span className="text-muted fs-8">{c.description}</span>
                        </td>
                        <td className="text-end">
                          <button
                            className={`btn btn-sm ${c.active ? 'btn-sf-outline text-danger border-rose-200' : 'btn-sf-outline text-success'}`}
                            onClick={() => handleToggleCategoryStatus(c)}
                          >
                            {c.active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="sf-card p-4">
              <h5 className="fw-bold text-dark mb-3 fs-6 d-flex align-items-center gap-2">
                <Layers size={16} />
                Marketplace Skills
              </h5>

              <form onSubmit={handleCreateSkill} className="mb-4 p-3 border rounded-3 bg-slate-50" style={{ backgroundColor: '#f8fafc' }}>
                <h6 className="fw-bold text-dark mb-2 fs-7">+ Add Skill</h6>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Skill Name (e.g. ReactJS)"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-sf-primary btn-sm">
                    Add Skill
                  </button>
                </div>
              </form>

              <div className="sf-table-wrapper">
                <table className="sf-table">
                  <tbody>
                    {skills.map((s) => (
                      <tr key={s.id}>
                        <td className="fw-semibold text-dark">{s.name}</td>
                        <td className="text-end">
                          <button
                            className={`btn btn-sm ${s.active ? 'btn-sf-outline text-danger border-rose-200' : 'btn-sf-outline text-success'}`}
                            onClick={() => handleToggleSkillStatus(s)}
                          >
                            {s.active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
