import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  SlidersHorizontal, 
  RotateCcw, 
  PlusCircle, 
  Briefcase, 
  Calendar, 
  Tag, 
  ChevronLeft, 
  ChevronRight,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

const Projects = () => {
  const { isClient, isAuthenticated } = useAuth();

  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);

  // Search & Filter State
  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [skillId, setSkillId] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('desc');

  // Pagination State
  const [page, setPage] = useState(0);
  const [size] = useState(6);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch Categories & Skills on mount (when authenticated)
  useEffect(() => {
    const fetchMetadata = async () => {
      if (!isAuthenticated) return;
      try {
        const [catRes, skillRes] = await Promise.all([
          axiosInstance.get('/categories'),
          axiosInstance.get('/skills'),
        ]);
        setCategories(catRes.data || []);
        setSkills(skillRes.data || []);
      } catch {
        // Metadata fetch fallback
      }
    };
    fetchMetadata();
  }, [isAuthenticated]);

  // Fetch Projects whenever search, filter, or pagination changes
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError('');
      try {
        const params = {
          page,
          size,
          sortBy,
          sortDir,
        };

        if (keyword.trim()) params.keyword = keyword.trim();
        if (categoryId) params.categoryId = categoryId;
        if (skillId) params.skillId = skillId;
        if (minBudget) params.minBudget = minBudget;
        if (maxBudget) params.maxBudget = maxBudget;

        let res;
        try {
          res = await axiosInstance.get('/projects/page', { params });
        } catch (pageErr) {
          if (pageErr.response && (pageErr.response.status === 404 || pageErr.response.status === 400)) {
            res = await axiosInstance.get('/projects');
          } else {
            throw pageErr;
          }
        }

        const data = res?.data;
        let content = [];
        let pages = 0;
        let total = 0;

        if (Array.isArray(data)) {
          content = data;
          total = data.length;
          pages = data.length > 0 ? Math.ceil(data.length / size) : 0;
        } else if (data && typeof data === 'object') {
          content = Array.isArray(data.content) ? data.content : [];
          pages = typeof data.totalPages === 'number' ? data.totalPages : (content.length > 0 ? 1 : 0);
          total = typeof data.totalElements === 'number' ? data.totalElements : content.length;
        }

        setProjects(content);
        setTotalPages(pages);
        setTotalElements(total);
        setError('');
      } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('Failed to load projects. Please try again.');
        }
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [page, size, sortBy, sortDir, categoryId, skillId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
  };

  const handleResetFilters = () => {
    setKeyword('');
    setCategoryId('');
    setSkillId('');
    setMinBudget('');
    setMaxBudget('');
    setSortBy('id');
    setSortDir('desc');
    setPage(0);
  };

  return (
    <div className="container py-4">
      {/* Enterprise Hero Banner */}
      <div className="sf-hero-card p-4 p-md-5 mb-4 position-relative overflow-hidden">
        <div className="row align-items-center position-relative z-1">
          <div className="col-lg-8">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="badge badge-sf badge-sf-indigo d-inline-flex align-items-center gap-1.5">
                <Sparkles size={13} />
                Marketplace Engine
              </span>
              <span className="text-slate-400 fs-8" style={{ color: '#94a3b8' }}>
                Verified Escrow &amp; AI Assistance
              </span>
            </div>
            <h1 className="fw-bold mb-2 text-white fs-2 fs-md-1" style={{ letterSpacing: '-0.03em' }}>
              Project Marketplace
            </h1>
            <p className="text-slate-300 lead fs-6 mb-4" style={{ color: '#cbd5e1', maxWidth: '640px' }}>
              Discover open freelance engineering, design, and technical projects. Filter by domain and budget, and submit proposals with milestone escrows.
            </p>
            {isClient && (
              <Link to="/post-project" className="btn btn-sf-primary d-inline-flex align-items-center gap-2">
                <PlusCircle size={16} />
                Post a Project
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="sf-card p-4 mb-4">
        <form onSubmit={handleSearchSubmit}>
          <div className="row g-3">
            {/* Keyword Search */}
            <div className="col-lg-4 col-md-6">
              <label className="form-label">Search Keyword</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <Search size={15} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Title or keywords..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
                <button type="submit" className="btn btn-sf-primary">
                  Search
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div className="col-lg-2 col-md-3 col-6">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setPage(0);
                }}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Skill Filter */}
            <div className="col-lg-2 col-md-3 col-6">
              <label className="form-label">Skill</label>
              <select
                className="form-select"
                value={skillId}
                onChange={(e) => {
                  setSkillId(e.target.value);
                  setPage(0);
                }}
              >
                <option value="">All Skills</option>
                {skills.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Budget */}
            <div className="col-lg-2 col-md-3 col-6">
              <label className="form-label">Min Budget ($)</label>
              <input
                type="number"
                className="form-control"
                placeholder="Min"
                value={minBudget}
                onChange={(e) => setMinBudget(e.target.value)}
                onBlur={() => setPage(0)}
              />
            </div>

            {/* Max Budget */}
            <div className="col-lg-2 col-md-3 col-6">
              <label className="form-label">Max Budget ($)</label>
              <input
                type="number"
                className="form-control"
                placeholder="Max"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                onBlur={() => setPage(0)}
              />
            </div>
          </div>

          {/* Sort Controls & Reset */}
          <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 pt-3 border-top gap-2">
            <div className="d-flex align-items-center gap-2">
              <SlidersHorizontal size={14} className="text-muted" />
              <span className="fs-8 text-muted fw-semibold">Sort:</span>
              <select
                className="form-select form-select-sm w-auto"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="id">Date Posted</option>
                <option value="title">Title</option>
                <option value="budget">Budget</option>
                <option value="deadline">Deadline</option>
              </select>

              <select
                className="form-select form-select-sm w-auto"
                value={sortDir}
                onChange={(e) => setSortDir(e.target.value)}
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>

            <button
              type="button"
              className="btn btn-sf-outline btn-sm d-inline-flex align-items-center gap-1.5 py-1 px-3 fs-8"
              onClick={handleResetFilters}
            >
              <RotateCcw size={13} />
              Reset Filters
            </button>
          </div>
        </form>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger shadow-sm mb-4" role="alert">
          {error}
        </div>
      )}

      {/* Results Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-2">
          <h6 className="fw-semibold mb-0 text-dark">Open Projects</h6>
          <span className="badge badge-sf badge-sf-neutral">{totalElements}</span>
        </div>
        <span className="text-muted fs-8">Page {page + 1} of {totalPages || 1}</span>
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading projects...</span>
          </div>
          <p className="mt-2 text-muted fs-7">Loading marketplace projects...</p>
        </div>
      ) : projects.length === 0 ? (
        /* Empty State */
        <div className="sf-card text-center py-5 my-3">
          <div className="p-4">
            <Briefcase size={36} className="text-muted mb-2 opacity-50" />
            <h5 className="fw-semibold text-dark mb-1">No Projects Found</h5>
            <p className="text-muted mb-3 fs-7" style={{ maxWidth: '420px', margin: '0 auto' }}>
              No open marketplace projects match your current filter parameters. Try clearing your filters or broadening your search terms.
            </p>
            <button className="btn btn-sf-outline btn-sm" onClick={handleResetFilters}>
              Clear All Filters
            </button>
          </div>
        </div>
      ) : (
        /* Project Grid */
        <div className="row g-3">
          {projects.map((p) => (
            <div className="col-md-6 col-lg-4" key={p.id}>
              <div className="sf-card sf-card-hover h-100 p-4 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span
                    className={`badge-sf ${
                      p.status === 'OPEN'
                        ? 'badge-sf-success'
                        : p.status === 'COMPLETED'
                        ? 'badge-sf-info'
                        : 'badge-sf-neutral'
                    }`}
                  >
                    <CheckCircle2 size={12} />
                    {p.status}
                  </span>
                  <span className="fw-bold fs-5 text-dark" style={{ letterSpacing: '-0.02em' }}>
                    ${p.budget}
                  </span>
                </div>

                <h5 className="fw-bold text-dark mb-2 fs-6 leading-snug">
                  {p.title}
                </h5>

                <p className="text-muted fs-7 mb-3 flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {p.description}
                </p>

                {p.categoryName && (
                  <div className="mb-2">
                    <span className="badge-sf badge-sf-neutral fs-8">
                      <Tag size={11} />
                      {p.categoryName}
                    </span>
                  </div>
                )}

                {p.skills && p.skills.length > 0 && (
                  <div className="d-flex flex-wrap gap-1 mb-3">
                    {p.skills.map((s) => (
                      <span className="badge-sf badge-sf-indigo fs-8" key={s.id}>
                        {s.name}
                      </span>
                    ))}
                  </div>
                )}

                <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-auto fs-8 text-muted">
                  <span className="d-flex align-items-center gap-1">
                    <Calendar size={13} />
                    {p.deadline}
                  </span>
                  <Link to={`/projects/${p.id}`} className="btn btn-sf-outline btn-sm py-1 px-3 fs-8 d-inline-flex align-items-center gap-1">
                    Details
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-2 my-4">
          <button
            className="btn btn-sf-outline btn-sm d-inline-flex align-items-center gap-1"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft size={14} />
            Previous
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={`btn btn-sm ${page === i ? 'btn-sf-primary' : 'btn-sf-outline'}`}
              onClick={() => setPage(i)}
            >
              {i + 1}
            </button>
          ))}

          <button
            className="btn btn-sf-outline btn-sm d-inline-flex align-items-center gap-1"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            Next
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Projects;
