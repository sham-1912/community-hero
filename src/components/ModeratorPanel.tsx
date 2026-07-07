import React, { useState } from 'react';
import { Settings, ShieldCheck, RefreshCw } from 'lucide-react';
import type { Issue } from '../utils/mockData';

interface ModeratorPanelProps {
  issues: Issue[];
  onUpdateStatus: (id: string, newStatus: Issue['status'], resolutionComment: string) => void;
  userRole: 'Citizen' | 'Moderator' | 'Authority';
}

export const ModeratorPanel: React.FC<ModeratorPanelProps> = ({
  issues,
  onUpdateStatus,
  userRole,
}) => {
  const [selectedIssueId, setSelectedIssueId] = useState<string>('');
  const [newStatus, setNewStatus] = useState<Issue['status']>('Investigating');
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeIssues = issues.filter(issue => issue.status !== 'Resolved');

  const handleSubmitStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssueId || !commentText.trim()) {
      alert('Please select an issue and enter a status update comment.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      onUpdateStatus(selectedIssueId, newStatus, commentText);
      
      // Reset state
      setSelectedIssueId('');
      setCommentText('');
      setIsSubmitting(false);
    }, 800);
  };

  const getPriorityColorClass = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'priority-critical';
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      default: return 'priority-low';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      <div className="glass-card p-6 border border-white/10" style={{
        background: 'linear-gradient(135deg, rgba(22, 28, 50, 0.45) 0%, rgba(16, 185, 129, 0.03) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <Settings size={22} color="var(--emerald)" />
          <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Authority sign-off & Status Updates</h3>
        </div>
        <p style={{ fontSize: '0.85rem', marginBottom: '20px' }}>
          As an authorized <strong>{userRole}</strong>, you have permission to update complaint statuses. 
          Updating a status automatically appends a new state block to the tamper-proof blockchain ledger, securing the accountability trail.
        </p>

        {activeIssues.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            ✓ All reported community complaints have been resolved! No items in active backlog.
          </div>
        ) : (
          <form onSubmit={handleSubmitStatus} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              
              {/* Select Issue */}
              <div className="input-group">
                <label className="input-label" htmlFor="select-issue">Select Active Complaint</label>
                <select
                  id="select-issue"
                  value={selectedIssueId}
                  onChange={(e) => {
                    setSelectedIssueId(e.target.value);
                    const issue = issues.find(i => i.id === e.target.value);
                    if (issue) {
                      setNewStatus(issue.status);
                    }
                  }}
                  className="form-select"
                >
                  <option value="">-- Choose active report --</option>
                  {activeIssues.map(i => (
                    <option key={i.id} value={i.id} style={{ background: 'var(--bg-surface-solid)' }}>
                      [{i.category}] {i.title.substring(0, 40)}...
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Status */}
              <div className="input-group">
                <label className="input-label" htmlFor="select-status">Transition Status To</label>
                <select
                  id="select-status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="form-select"
                  disabled={!selectedIssueId}
                >
                  <option value="Investigating">Investigating (Under Review)</option>
                  <option value="In Progress">In Progress (Crew Dispatched)</option>
                  <option value="Resolved">Resolved (Complete & Sign Off)</option>
                </select>
              </div>
            </div>

            {/* Comment */}
            <div className="input-group">
              <label className="input-label" htmlFor="mod-comment">Resolution Comment / Actions Taken</label>
              <textarea
                id="mod-comment"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Describe actions taken (e.g. dispatched truck, patched potholes, replaced luminaire bulb)."
                className="form-textarea"
                disabled={!selectedIssueId}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={isSubmitting || !selectedIssueId || !commentText.trim()}
                className="btn btn-primary"
                style={{ background: 'var(--emerald)', boxShadow: '0 4px 12px var(--emerald-glow)' }}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" style={{ animation: 'spin 2s infinite linear' }} />
                    Signing Ledger Block...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    Cryptographically Commit Status Change
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Active Backlog Table */}
      <div className="glass-card p-6 border border-white/10">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Current Active Backlog Details</h3>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '10px' }}>ID</th>
                <th style={{ padding: '10px' }}>Issue Detail</th>
                <th style={{ padding: '10px' }}>Category</th>
                <th style={{ padding: '10px' }}>Priority</th>
                <th style={{ padding: '10px' }}>Coordinates</th>
                <th style={{ padding: '10px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr key={issue.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', opacity: issue.status === 'Resolved' ? 0.5 : 1 }}>
                  <td style={{ padding: '12px 10px', fontFamily: 'var(--font-mono)' }}>{issue.id.substring(0, 8)}</td>
                  <td style={{ padding: '12px 10px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{issue.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{issue.location.address}</div>
                  </td>
                  <td style={{ padding: '12px 10px' }}>{issue.category}</td>
                  <td style={{ padding: '12px 10px' }}>
                    <span className={`priority-pill ${getPriorityColorClass(issue.priority)}`}>
                      {issue.priority}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                    {issue.location.lat.toFixed(4)}, {issue.location.lng.toFixed(4)}
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span className={`status-pill ${
                      issue.status === 'Pending' ? 'status-pending' :
                      issue.status === 'Investigating' ? 'status-investigating' :
                      issue.status === 'In Progress' ? 'status-progress' : 'status-resolved'
                    }`}>
                      {issue.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
