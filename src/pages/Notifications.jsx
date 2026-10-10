import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Inbox, 
  Clock
} from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.get('/notifications');
      setNotifications(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await axiosInstance.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch {
      // ignore
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axiosInstance.patch('/notifications/read-all');
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/notifications/${id}`);
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading notifications...</span>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="container py-4">
      {/* Header Banner */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h2 className="fw-bold mb-0 text-dark fs-3" style={{ letterSpacing: '-0.03em' }}>Notifications</h2>
            <span className="badge-sf badge-sf-indigo">{unreadCount} Unread</span>
          </div>
          <p className="text-muted mb-0 fs-7">System alerts regarding proposal updates, milestone reviews, and payments</p>
        </div>
        {notifications.length > 0 && unreadCount > 0 && (
          <button
            className="btn btn-sf-outline btn-sm d-inline-flex align-items-center gap-1.5"
            onClick={handleMarkAllAsRead}
          >
            <CheckCheck size={14} />
            Mark All as Read
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-danger shadow-sm mb-4" role="alert">
          {error}
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="sf-card text-center py-5">
          <div className="p-4">
            <Inbox size={36} className="text-muted mb-2 opacity-50" />
            <h5 className="fw-semibold text-dark mb-1">No Notifications</h5>
            <p className="text-muted mb-0 fs-7">You are all caught up! New proposal and milestone events will appear here.</p>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`sf-card p-3.5 ${
                !n.read ? 'border-start border-4 border-indigo-600 bg-slate-50' : ''
              }`}
              style={{ borderLeftColor: !n.read ? '#4f46e5' : undefined }}
            >
              <div className="d-flex justify-content-between align-items-start gap-3">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="badge-sf badge-sf-indigo fs-8">
                      <Bell size={10} />
                      {n.type}
                    </span>
                    {!n.read && <span className="badge-sf badge-sf-danger fs-8">UNREAD</span>}
                  </div>
                  <p className="mb-1 fw-medium text-dark fs-7" style={{ lineHeight: '1.5' }}>{n.message}</p>
                  <small className="text-muted fs-8 d-inline-flex align-items-center gap-1">
                    <Clock size={11} />
                    {n.timestamp}
                  </small>
                </div>

                <div className="d-flex gap-2 flex-shrink-0">
                  {!n.read && (
                    <button
                      className="btn btn-sf-outline btn-sm py-1 px-2.5 fs-8 d-inline-flex align-items-center gap-1"
                      onClick={() => handleMarkAsRead(n.id)}
                    >
                      <CheckCheck size={13} />
                      Mark Read
                    </button>
                  )}
                  <button
                    className="btn btn-sf-outline btn-sm py-1 px-2.5 fs-8 text-danger border-rose-200"
                    onClick={() => handleDelete(n.id)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
