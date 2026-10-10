import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { 
  PlusCircle, 
  Briefcase, 
  Calendar, 
  DollarSign, 
  Tag, 
  CheckCircle2, 
  ArrowLeft 
} from 'lucide-react';

const PostProject = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);

  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingMetadata, setLoadingMetadata] = useState(true);
  const [metadataError, setMetadataError] = useState('');

  const fetchMetadata = async () => {
    setLoadingMetadata(true);
    setMetadataError('');
    try {
      const [cRes, sRes] = await Promise.all([
        axiosInstance.get('/categories'),
        axiosInstance.get('/skills'),
      ]);
      setCategories(Array.isArray(cRes.data) ? cRes.data : []);
      setSkills(Array.isArray(sRes.data) ? sRes.data : []);
    } catch (err) {
      setMetadataError('Failed to load categories and skills. Please check connection and try again.');
    } finally {
      setLoadingMetadata(false);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  const handleSkillToggle = (skillId) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills(selectedSkills.filter((id) => id !== skillId));
    } else {
      setSelectedSkills([...selectedSkills, skillId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || !description || !budget || !deadline) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        description,
        budget,
        deadline,
        clientId: user.id,
        categoryId: categoryId ? Number(categoryId) : null,
        skillIds: selectedSkills,
      };

      await axiosInstance.post('/projects', payload);
      navigate('/client-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project. Please verify inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Form Card */}
          <div className="sf-card p-4 p-md-5">
            <div className="border-bottom pb-3 mb-4">
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="badge-sf badge-sf-indigo">Client Action</span>
                <span className="text-muted fs-8">Create Marketplace Listing</span>
              </div>
              <h3 className="fw-bold text-dark mb-1 fs-4" style={{ letterSpacing: '-0.02em' }}>
                Post a New Project
              </h3>
              <p className="text-muted mb-0 fs-7">
                Define your project scope, budget, deadline, and skills to receive freelancer proposals.
              </p>
            </div>

            {error && (
              <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
                {error}
                <button type="button" className="btn-close" onClick={() => setError('')}></button>
              </div>
            )}

            {metadataError && (
              <div className="alert alert-warning d-flex justify-content-between align-items-center mb-4 fs-7" role="alert">
                <div>{metadataError}</div>
                <button className="btn btn-sm btn-sf-outline" type="button" onClick={fetchMetadata}>
                  Retry
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Project Title *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Full-Stack E-Commerce Platform Redesign"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Detailed Description &amp; Requirements *</label>
                <textarea
                  className="form-control"
                  rows="5"
                  placeholder="Describe your technical requirements, scope, deliverables, and acceptance criteria..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label">Project Budget ($) *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 1500.00"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Target Completion Deadline *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label d-flex justify-content-between align-items-center">
                  <span>Category</span>
                  {loadingMetadata && <span className="spinner-border spinner-border-sm text-muted" role="status"></span>}
                </label>
                <select
                  className="form-select"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={loadingMetadata}
                >
                  <option value="">Select Category (Optional)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {!loadingMetadata && categories.length === 0 && (
                  <div className="form-text text-muted fs-8">No categories currently active on the platform.</div>
                )}
              </div>

              {skills.length > 0 && (
                <div className="mb-4">
                  <label className="form-label">Required Skills</label>
                  <div className="d-flex flex-wrap gap-2 p-3 border rounded-3 bg-slate-50" style={{ backgroundColor: '#f8fafc' }}>
                    {skills.map((s) => (
                      <div key={s.id} className="form-check me-2 mb-0">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`skill-${s.id}`}
                          checked={selectedSkills.includes(s.id)}
                          onChange={() => handleSkillToggle(s.id)}
                        />
                        <label className="form-check-label fs-7 text-dark fw-medium" htmlFor={`skill-${s.id}`}>
                          {s.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="d-flex gap-2 justify-content-end pt-3 border-top">
                <button
                  type="button"
                  className="btn btn-sf-outline px-4"
                  onClick={() => navigate('/client-dashboard')}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-sf-primary px-4 d-inline-flex align-items-center gap-1.5" disabled={loading}>
                  {loading ? 'Publishing...' : 'Publish Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostProject;
