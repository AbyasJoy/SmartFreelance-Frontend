import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircle2, 
  RotateCcw, 
  Calendar, 
  User as UserIcon, 
  Tag, 
  FileText, 
  Plus, 
  Award, 
  Send, 
  MessageSquare, 
  AlertCircle, 
  ShieldCheck,
  ArrowLeft,
  Clock
} from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user, isClient, isFreelancer, isAdmin } = useAuth();

  const [project, setProject] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState({ type: '', text: '' });

  // Freelancer Proposal Form State
  const [proposedPrice, setProposedPrice] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [submittingProposal, setSubmittingProposal] = useState(false);

  // Client Milestone Form State
  const [mTitle, setMTitle] = useState('');
  const [mDescription, setMDescription] = useState('');
  const [mAmount, setMAmount] = useState('');
  const [mDueDate, setMDueDate] = useState('');
  const [submittingMilestone, setSubmittingMilestone] = useState(false);

  // Freelancer Work Submission Form State
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submittingWork, setSubmittingWork] = useState(false);

  // Client Review Submission Form State (for milestone revision)
  const [reviewMilestoneId, setReviewMilestoneId] = useState(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewingMilestone, setReviewingMilestone] = useState(false);

  // Client Review Form State (for project rating)
  const [rating, setRating] = useState(5);
  const [projectComment, setProjectComment] = useState('');
  const [submittingProjectReview, setSubmittingProjectReview] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const pRes = await axiosInstance.get(`/projects/${id}`);
      setProject(pRes.data);

      if (user) {
        try {
          const mRes = await axiosInstance.get(`/milestones/project/${id}`);
          setMilestones(mRes.data || []);
        } catch {
          // ignore milestone restriction
        }
      }

      if (isClient || isAdmin || (isFreelancer && pRes.data.freelancerId === user?.id)) {
        try {
          const propRes = await axiosInstance.get(`/proposals/project/${id}`);
          setProposals(propRes.data || []);
        } catch {
          // ignore
        }
      } else if (isFreelancer) {
        try {
          const propRes = await axiosInstance.get(`/proposals/freelancer/${user?.id}`);
          const myProjectProp = (propRes.data || []).filter((pr) => pr.projectId === Number(id));
          setProposals(myProjectProp);
        } catch {
          // ignore
        }
      }

      try {
        const revRes = await axiosInstance.get(`/reviews/project/${id}`);
        setReviews(revRes.data || []);
      } catch {
        // ignore
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load project details.');
    } finally {
      setLoading(false);
    }
  }, [id, isClient, isFreelancer, isAdmin, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Submit Proposal (Freelancer)
  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    setActionMsg({ type: '', text: '' });
    setSubmittingProposal(true);

    try {
      await axiosInstance.post('/proposals', {
        projectId: Number(id),
        freelancerId: user.id,
        proposedPrice,
        estimatedDays: Number(estimatedDays),
        coverLetter,
      });

      setActionMsg({ type: 'success', text: 'Proposal submitted successfully!' });
      setProposedPrice('');
      setEstimatedDays('');
      setCoverLetter('');
      loadData();
    } catch (err) {
      setActionMsg({ type: 'danger', text: err.response?.data?.message || 'Failed to submit proposal.' });
    } finally {
      setSubmittingProposal(false);
    }
  };

  // Accept Proposal (Client/Admin)
  const handleAcceptProposal = async (proposalId) => {
    setActionMsg({ type: '', text: '' });
    try {
      await axiosInstance.post(`/proposals/${proposalId}/accept`);
      setActionMsg({ type: 'success', text: 'Proposal accepted! Freelancer assigned to project.' });
      loadData();
    } catch (err) {
      setActionMsg({ type: 'danger', text: err.response?.data?.message || 'Failed to accept proposal.' });
    }
  };

  // Reject Proposal (Client/Admin)
  const handleRejectProposal = async (proposalId) => {
    setActionMsg({ type: '', text: '' });
    try {
      await axiosInstance.post(`/proposals/${proposalId}/reject`);
      setActionMsg({ type: 'success', text: 'Proposal rejected.' });
      loadData();
    } catch (err) {
      setActionMsg({ type: 'danger', text: err.response?.data?.message || 'Failed to reject proposal.' });
    }
  };

  // Add Milestone (Client/Admin)
  const handleCreateMilestone = async (e) => {
    e.preventDefault();
    setActionMsg({ type: '', text: '' });
    setSubmittingMilestone(true);

    try {
      await axiosInstance.post('/milestones', {
        projectId: Number(id),
        title: mTitle,
        description: mDescription,
        amount: mAmount,
        dueDate: mDueDate,
      });

      setActionMsg({ type: 'success', text: 'Milestone created successfully!' });
      setMTitle('');
      setMDescription('');
      setMAmount('');
      setMDueDate('');
      loadData();
    } catch (err) {
      setActionMsg({ type: 'danger', text: err.response?.data?.message || 'Failed to create milestone.' });
    } finally {
      setSubmittingMilestone(false);
    }
  };

  // Submit Milestone Work (Freelancer)
  const handleSubmitWork = async (e) => {
    e.preventDefault();
    setActionMsg({ type: '', text: '' });
    setSubmittingWork(true);

    try {
      await axiosInstance.post(
        `/milestones/${selectedMilestoneId}/submit`,
        { submissionNotes }
      );

      setActionMsg({ type: 'success', text: 'Milestone work submitted for client review!' });
      setSelectedMilestoneId(null);
      setSubmissionNotes('');
      loadData();
    } catch (err) {
      setActionMsg({ type: 'danger', text: err.response?.data?.message || 'Failed to submit milestone work.' });
    } finally {
      setSubmittingWork(false);
    }
  };

  // Direct Approve Milestone (Client/Admin) - Atomically triggers simulated payment settlement
  const handleApproveMilestone = async (milestoneId) => {
    setActionMsg({ type: '', text: '' });
    try {
      await axiosInstance.post(`/milestones/${milestoneId}/review`, {
        action: 'APPROVE',
        comment: 'Approved by client.',
      });

      setActionMsg({
        type: 'success',
        text: 'Milestone approved! Exactly-once simulated payment settled automatically.',
      });
      loadData();
    } catch (err) {
      setActionMsg({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to approve milestone.',
      });
    }
  };

  // Open Revision Request Modal (Client/Admin)
  const openRevisionModal = (milestoneId) => {
    setReviewMilestoneId(milestoneId);
    setReviewComment('');
  };

  // Submit Revision Request (Client/Admin)
  const handleConfirmRevision = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!reviewComment.trim()) {
      setActionMsg({ type: 'danger', text: 'Revision comment is required.' });
      return;
    }

    setActionMsg({ type: '', text: '' });
    setReviewingMilestone(true);

    try {
      await axiosInstance.post(`/milestones/${reviewMilestoneId}/review`, {
        action: 'REVISION_REQUESTED',
        comment: reviewComment.trim(),
      });

      setActionMsg({
        type: 'success',
        text: 'Revision requested from freelancer.',
      });

      setReviewMilestoneId(null);
      setReviewComment('');
      loadData();
    } catch (err) {
      setActionMsg({ type: 'danger', text: err.response?.data?.message || 'Failed to request revision.' });
    } finally {
      setReviewingMilestone(false);
    }
  };

  // Mark Project Complete explicitly (Client/Admin)
  const handleCompleteProject = async () => {
    setActionMsg({ type: '', text: '' });
    try {
      await axiosInstance.post(`/projects/${id}/complete`);
      setActionMsg({
        type: 'success',
        text: 'Project successfully completed! All milestones approved and payments settled.',
      });
      loadData();
    } catch (err) {
      setActionMsg({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to complete project.',
      });
    }
  };

  // Submit Project Review (Rating & Comment)
  const handleProjectReview = async (e) => {
    e.preventDefault();
    setActionMsg({ type: '', text: '' });
    setSubmittingProjectReview(true);

    try {
      await axiosInstance.post('/reviews', {
        projectId: Number(id),
        rating: Number(rating),
        comment: projectComment,
      });

      setActionMsg({ type: 'success', text: 'Review submitted successfully!' });
      setProjectComment('');
      loadData();
    } catch (err) {
      setActionMsg({ type: 'danger', text: err.response?.data?.message || 'Failed to submit review.' });
    } finally {
      setSubmittingProjectReview(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading project details...</span>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container py-5 text-center">
        <div className="sf-card p-5 d-inline-block text-center" style={{ maxWidth: '480px' }}>
          <AlertCircle size={40} className="text-danger mb-2 opacity-75" />
          <h4 className="fw-bold mb-2">Error Loading Project</h4>
          <p className="text-muted fs-7 mb-4">{error || 'Project not found.'}</p>
          <Link to="/" className="btn btn-sf-primary btn-sm d-inline-flex align-items-center gap-1.5">
            <ArrowLeft size={14} />
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const isAssignedFreelancer = Number(project.freelancerId) === Number(user?.id);
  const isProjectClient = Number(project.clientId) === Number(user?.id);
  const hasSubmittedProposal = proposals.some((p) => Number(p.freelancerId) === Number(user?.id));
  const allMilestonesApproved =
    milestones.length > 0 && milestones.every((m) => m.status === 'APPROVED');

  return (
    <div className="container py-4">
      {/* Action Notice Alert */}
      {actionMsg.text && (
        <div className={`alert alert-${actionMsg.type} alert-dismissible fade show mb-4`} role="alert">
          {actionMsg.text}
          <button type="button" className="btn-close" onClick={() => setActionMsg({ type: '', text: '' })}></button>
        </div>
      )}

      {/* Navigation Breadcrumb */}
      <div className="mb-3">
        <Link to="/" className="text-decoration-none text-muted fs-8 d-inline-flex align-items-center gap-1">
          <ArrowLeft size={13} />
          Back to Projects Marketplace
        </Link>
      </div>

      {/* Project Overview Card */}
      <div className="sf-card p-4 p-md-5 mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge-sf badge-sf-indigo">
                <Tag size={12} />
                {project.categoryName || 'General Category'}
              </span>
              <span
                className={`badge-sf ${
                  project.status === 'OPEN'
                    ? 'badge-sf-success'
                    : project.status === 'COMPLETED'
                    ? 'badge-sf-info'
                    : 'badge-sf-warning'
                }`}
              >
                <CheckCircle2 size={12} />
                {project.status}
              </span>
            </div>
            <h2 className="fw-bold text-dark mb-0 fs-3" style={{ letterSpacing: '-0.03em' }}>{project.title}</h2>
          </div>

          <div className="text-md-end bg-slate-50 p-3 rounded-3 border" style={{ backgroundColor: '#f8fafc', minWidth: '160px' }}>
            <span className="text-muted fs-8 d-block fw-semibold text-uppercase">Project Budget</span>
            <span className="fw-extrabold text-indigo-600 fs-3" style={{ color: '#4f46e5' }}>${project.budget}</span>
          </div>
        </div>

        <p className="text-secondary fs-6 mb-4" style={{ lineHeight: '1.6' }}>{project.description}</p>

        <div className="row g-3 pt-3 border-top text-muted fs-7">
          <div className="col-sm-4 d-flex align-items-center gap-1.5">
            <Calendar size={15} className="text-muted" />
            <span><strong>Deadline:</strong> {project.deadline}</span>
          </div>
          <div className="col-sm-4 d-flex align-items-center gap-1.5">
            <UserIcon size={15} className="text-muted" />
            <span><strong>Client ID:</strong> #{project.clientId}</span>
          </div>
          <div className="col-sm-4 d-flex align-items-center gap-1.5">
            <ShieldCheck size={15} className="text-muted" />
            <span><strong>Selected Freelancer:</strong> {project.freelancerId ? `#${project.freelancerId}` : 'None assigned yet'}</span>
          </div>
        </div>

        {project.skills && project.skills.length > 0 && (
          <div className="mt-3 pt-2">
            <span className="fw-semibold me-2 fs-8 text-muted text-uppercase">Required Skills:</span>
            {project.skills.map((s) => (
              <span className="badge-sf badge-sf-indigo me-1 fs-8" key={s.id}>
                {s.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 1: FREELANCER PROPOSAL SUBMISSION FORM */}
      {isFreelancer && project.status === 'OPEN' && !hasSubmittedProposal && (
        <div className="sf-card p-4 mb-4">
          <h5 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2 fs-6">
            <Send size={16} className="text-indigo-600" style={{ color: '#4f46e5' }} />
            Submit a Proposal for this Project
          </h5>
          <p className="text-muted fs-7 mb-3">Provide your proposed rate, delivery timeline, and pitch to the client.</p>

          <form onSubmit={handleProposalSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">Proposed Price ($)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 1000.00"
                  value={proposedPrice}
                  onChange={(e) => setProposedPrice(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Estimated Days to Complete</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 12"
                  value={estimatedDays}
                  onChange={(e) => setEstimatedDays(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Cover Letter &amp; Technical Approach</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Explain your technical stack, experience, and approach..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-sf-primary" disabled={submittingProposal}>
              {submittingProposal ? 'Submitting...' : 'Submit Proposal'}
            </button>
          </form>
        </div>
      )}

      {/* SECTION 2: PROPOSALS LIST (Client/Admin/Assigned Freelancer) */}
      {(isProjectClient || isAdmin || isFreelancer) && (
        <div className="sf-card p-4 mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-dark mb-0 fs-6 d-flex align-items-center gap-2">
              <FileText size={16} />
              Submitted Proposals
            </h5>
            <span className="badge-sf badge-sf-neutral">{proposals.length}</span>
          </div>

          {proposals.length === 0 ? (
            <p className="text-muted mb-0 fs-7">No proposals submitted yet for this project.</p>
          ) : (
            <div className="d-flex flex-column gap-3">
              {proposals.map((prop) => (
                <div className="p-3 border rounded-3 bg-white" key={prop.id}>
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="fw-semibold text-dark fs-7">Freelancer #{prop.freelancerId}</span>
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
                      </div>
                      <p className="text-secondary mb-1 fs-7">{prop.coverLetter}</p>
                      <div className="text-muted fs-8 d-flex align-items-center gap-3">
                        <span>Price: <strong>${prop.proposedPrice}</strong></span>
                        <span>Est. Days: <strong>{prop.estimatedDays} days</strong></span>
                      </div>
                    </div>

                    {(isProjectClient || isAdmin) && project.status === 'OPEN' && prop.status === 'PENDING' && (
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-sf-primary px-3"
                          onClick={() => handleAcceptProposal(prop.id)}
                        >
                          Accept Proposal
                        </button>
                        <button
                          className="btn btn-sm btn-sf-outline px-3"
                          onClick={() => handleRejectProposal(prop.id)}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: MILESTONES & SIMULATED PAYMENTS */}
      <div className="sf-card p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-dark mb-0 fs-6 d-flex align-items-center gap-2">
            <Clock size={16} />
            Milestone Deliverables &amp; Work Submissions
          </h5>
          <span className="badge-sf badge-sf-neutral">{milestones.length}</span>
        </div>

        {/* Create Milestone Form for Client */}
        {(isProjectClient || isAdmin) && (
          <div className="p-3 border rounded-3 mb-4 bg-slate-50" style={{ backgroundColor: '#f8fafc' }}>
            <h6 className="fw-semibold text-dark mb-3 fs-7 d-flex align-items-center gap-1.5">
              <Plus size={15} className="text-indigo-600" />
              Create New Milestone
            </h6>
            <form onSubmit={handleCreateMilestone}>
              <div className="row g-2 mb-2">
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Milestone Title"
                    value={mTitle}
                    onChange={(e) => setMTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Amount ($)"
                    value={mAmount}
                    onChange={(e) => setMAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={mDueDate}
                    onChange={(e) => setMDueDate(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-2">
                  <button type="submit" className="btn btn-sf-primary btn-sm w-100" disabled={submittingMilestone}>
                    Add
                  </button>
                </div>
              </div>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Milestone Description &amp; Scope..."
                value={mDescription}
                onChange={(e) => setMDescription(e.target.value)}
                required
              />
            </form>
          </div>
        )}

        {/* Milestones List */}
        {milestones.length === 0 ? (
          <p className="text-muted mb-0 fs-7">No milestones defined for this project.</p>
        ) : (
          <div className="d-flex flex-column gap-3">
            {milestones.map((m) => (
              <div className="p-3 border rounded-3 bg-white" key={m.id}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="fw-bold mb-0 text-dark fs-6">
                    {m.title} <span className="text-indigo-600 ms-1" style={{ color: '#4f46e5' }}>${m.amount}</span>
                  </h6>
                  <span
                    className={`badge-sf ${
                      m.status === 'APPROVED'
                        ? 'badge-sf-success'
                        : m.status === 'SUBMITTED'
                        ? 'badge-sf-info'
                        : m.status === 'REVISION_REQUESTED'
                        ? 'badge-sf-warning'
                        : 'badge-sf-neutral'
                    }`}
                  >
                    {m.status}
                  </span>
                </div>

                <p className="text-muted fs-7 mb-2">{m.description}</p>
                <div className="fs-8 text-muted mb-2">Due Date: {m.dueDate}</div>

                {/* Submission Notes */}
                {m.submissionNotes && (
                  <div className="alert alert-info py-2 px-3 fs-7 mb-2 rounded-2">
                    <strong>Freelancer Submission Notes:</strong> {m.submissionNotes}
                  </div>
                )}

                {/* Review Comment */}
                {m.reviewComment && (
                  <div className="alert alert-warning py-2 px-3 fs-7 mb-2 rounded-2">
                    <strong>Client Feedback:</strong> {m.reviewComment}
                  </div>
                )}

                {/* Freelancer Submit / Resubmit Work Trigger */}
                {isAssignedFreelancer && (m.status === 'PENDING' || m.status === 'REVISION_REQUESTED') && (
                  <button
                    className="btn btn-sf-outline btn-sm mt-2 me-2 d-inline-flex align-items-center gap-1.5 fs-8"
                    onClick={() => {
                      setSelectedMilestoneId(m.id);
                      setSubmissionNotes('');
                    }}
                  >
                    <Send size={13} />
                    {m.status === 'REVISION_REQUESTED' ? 'Resubmit Work' : 'Submit Work'}
                  </button>
                )}

                {/* Client Direct Actions for Submitted Milestone */}
                {(isProjectClient || isAdmin) && m.status === 'SUBMITTED' && (
                  <div className="mt-3 pt-2 border-top d-flex flex-wrap gap-2 align-items-center">
                    <button
                      className="btn btn-sf-primary btn-sm d-inline-flex align-items-center gap-1.5 fs-8"
                      onClick={() => handleApproveMilestone(m.id)}
                    >
                      <CheckCircle2 size={14} />
                      Approve Milestone (${m.amount})
                    </button>
                    <button
                      className="btn btn-sf-outline btn-sm d-inline-flex align-items-center gap-1.5 fs-8"
                      onClick={() => openRevisionModal(m.id)}
                    >
                      <RotateCcw size={14} />
                      Request Revision
                    </button>
                  </div>
                )}

                {/* Milestone Approved Banner & Settled Info */}
                {m.status === 'APPROVED' && (
                  <div className="mt-3 pt-2 border-top d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <span className="badge-sf badge-sf-success fs-8">
                      <CheckCircle2 size={12} />
                      Simulated Payment Settled: ${m.amount}
                    </span>
                    <span className="text-muted fs-8">
                      Funds settled automatically into freelancer balance.
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Project Completion Banner or Completion Action */}
        {project.status === 'COMPLETED' ? (
          <div className="alert alert-success d-flex align-items-center gap-3 mt-4 mb-0 rounded-3 border-success">
            <Award size={28} className="text-success" />
            <div>
              <h6 className="fw-bold mb-1 text-success fs-6">Project Completed</h6>
              <p className="mb-0 fs-7 text-dark">
                All milestones have been successfully approved and simulated payments have been settled.
              </p>
            </div>
          </div>
        ) : (
          allMilestonesApproved && (isProjectClient || isAdmin) && (
            <div className="sf-card bg-emerald-50 border-emerald-200 mt-4 p-4 text-center" style={{ backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }}>
              <h6 className="fw-bold text-emerald-800 mb-1 fs-6" style={{ color: '#047857' }}>All Milestones Approved &amp; Paid!</h6>
              <p className="text-muted fs-7 mb-3">
                All project deliverables are completed. You can now officially mark this project as finished.
              </p>
              <button
                className="btn btn-sf-primary btn-sm px-4"
                onClick={handleCompleteProject}
              >
                Mark Project Completed
              </button>
            </div>
          )
        )}
      </div>

      {/* MODAL: Freelancer Submission Modal */}
      {selectedMilestoneId && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content sf-card border-0">
              <div className="modal-header border-bottom py-3">
                <h6 className="modal-title fw-bold text-dark fs-6">Submit Milestone Work</h6>
                <button type="button" className="btn-close" onClick={() => setSelectedMilestoneId(null)}></button>
              </div>
              <form onSubmit={handleSubmitWork}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label">Submission Notes &amp; Work Links</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Describe work completed, repository commits, or links..."
                      value={submissionNotes}
                      onChange={(e) => setSubmissionNotes(e.target.value)}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top py-2">
                  <button type="button" className="btn btn-sf-outline btn-sm" onClick={() => setSelectedMilestoneId(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-sf-primary btn-sm" disabled={submittingWork}>
                    {submittingWork ? 'Submitting...' : 'Confirm Submission'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Client Revision Request Modal */}
      {reviewMilestoneId && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content sf-card border-0">
              <div className="modal-header border-bottom py-3">
                <h6 className="modal-title fw-bold text-dark fs-6">Request Milestone Revision</h6>
                <button type="button" className="btn-close" onClick={() => setReviewMilestoneId(null)}></button>
              </div>
              <form onSubmit={handleConfirmRevision}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label">Feedback Comment &amp; Requirements</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Specify required changes or revisions..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top py-2">
                  <button type="button" className="btn btn-sf-outline btn-sm" onClick={() => setReviewMilestoneId(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-sf-primary btn-sm" disabled={reviewingMilestone}>
                    {reviewingMilestone ? 'Submitting...' : 'Submit Revision Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: PROJECT REVIEWS & RATINGS */}
      <div className="sf-card p-4">
        <h5 className="fw-bold text-dark mb-3 fs-6 d-flex align-items-center gap-2">
          <MessageSquare size={16} />
          Project Reviews &amp; Ratings
        </h5>

        {/* Submit Review Form */}
        {project.status === 'COMPLETED' && (
          <div className="p-3 border rounded-3 mb-4 bg-slate-50" style={{ backgroundColor: '#f8fafc' }}>
            <h6 className="fw-semibold text-dark mb-3 fs-7">+ Submit Review for Completed Project</h6>
            <form onSubmit={handleProjectReview}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label">Rating (1 to 5 Stars)</label>
                  <select className="form-select" value={rating} onChange={(e) => setRating(e.target.value)}>
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Very Good</option>
                    <option value="3">3 - Good</option>
                    <option value="2">2 - Fair</option>
                    <option value="1">1 - Poor</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Review Target Participant</label>
                  <div className="form-control bg-white text-dark fw-semibold">
                    {isClient
                      ? `Assigned Freelancer (User #${project.freelancerId || 'N/A'})`
                      : `Project Client (User #${project.clientId})`}
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Comment</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Share feedback on project collaboration..."
                  value={projectComment}
                  onChange={(e) => setProjectComment(e.target.value)}
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn btn-sf-primary btn-sm" disabled={submittingProjectReview}>
                Submit Review
              </button>
            </form>
          </div>
        )}

        {/* List Reviews */}
        {reviews.length === 0 ? (
          <p className="text-muted mb-0 fs-7">No reviews submitted for this project yet.</p>
        ) : (
          <div className="d-flex flex-column gap-2">
            {reviews.map((r) => (
              <div className="p-3 border rounded-3 bg-white" key={r.id}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="fw-semibold text-dark fs-7">
                    User #{r.reviewerId} rated User #{r.revieweeId}
                  </span>
                  <span className="badge-sf badge-sf-warning">
                    {'★'.repeat(r.rating)} ({r.rating}/5)
                  </span>
                </div>
                <p className="text-muted fs-7 mb-0">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;
