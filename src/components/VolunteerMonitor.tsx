import React, { useState } from 'react';
import { Users, Shield, ShieldCheck, ShieldAlert, Search } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Volunteer {
  id: string;
  username: string;
  auditsCount: number;
  points: number;
  status: 'Active' | 'Under Audit' | 'Suspended';
  accuracy: number;
  lastAction: string;
  lastActionTime: string;
}

interface VolunteerMonitorProps {
  onAddNotification: (text: string) => void;
}

export const VolunteerMonitor: React.FC<VolunteerMonitorProps> = ({ onAddNotification }) => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([
    {
      id: 'vol-1',
      username: 'moderator',
      auditsCount: 14,
      points: 450,
      status: 'Active',
      accuracy: 98.6,
      lastAction: 'Approved Waste Dump Report #3',
      lastActionTime: '10 mins ago'
    },
    {
      id: 'vol-2',
      username: 'sarah_k',
      auditsCount: 9,
      points: 310,
      status: 'Active',
      accuracy: 95.8,
      lastAction: 'Flagged duplicate water leak #102',
      lastActionTime: '2 hours ago'
    },
    {
      id: 'vol-3',
      username: 'civic_guard_23',
      auditsCount: 6,
      points: 210,
      status: 'Under Audit',
      accuracy: 89.2,
      lastAction: 'Classified streetlight malfunction',
      lastActionTime: '1 day ago'
    },
    {
      id: 'vol-4',
      username: 'pavement_auditor',
      auditsCount: 18,
      points: 580,
      status: 'Active',
      accuracy: 99.4,
      lastAction: 'Approved pothole location grid shift',
      lastActionTime: '45 mins ago'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  // Revoke credentials action
  const handleRevokeCredentials = (id: string, username: string) => {
    setVolunteers(prev => prev.map(vol => {
      if (vol.id === id) {
        return { ...vol, status: 'Suspended', accuracy: 0 };
      }
      return vol;
    }));
    onAddNotification(`REVOCATION COMPLETED: Node credentials for volunteer @${username} have been suspended. Transaction logged on blockchain.`);
    confetti({ particleCount: 50, spread: 40 });
  };

  // Run audit verification action
  const handlePerformAudit = (id: string, username: string) => {
    setVolunteers(prev => prev.map(vol => {
      if (vol.id === id) {
        return { ...vol, status: 'Active', accuracy: Math.min(99.8, vol.accuracy + 0.4) };
      }
      return vol;
    }));
    onAddNotification(`AUDIT COMPLETED: Verification pass completed for @${username}. Node signature validated.`);
    confetti({ particleCount: 30, spread: 20 });
  };

  const filteredVolunteers = volunteers.filter(vol =>
    vol.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      
      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        <div className="glass-card p-4 border border-white/10" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '10px', borderRadius: '8px', color: 'var(--secondary)' }}>
            <Users size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block' }}>Active Moderators</span>
            <strong style={{ fontSize: '1.2rem' }}>{volunteers.filter(v => v.status === 'Active').length} Nodes</strong>
          </div>
        </div>

        <div className="glass-card p-4 border border-white/10" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '10px', borderRadius: '8px', color: 'var(--emerald)' }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block' }}>Consensus Accuracy</span>
            <strong style={{ fontSize: '1.2rem' }}>95.7% (High)</strong>
          </div>
        </div>

        <div className="glass-card p-4 border border-white/10" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '10px', borderRadius: '8px', color: 'var(--amber)' }}>
            <ShieldAlert size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block' }}>Pending Audits</span>
            <strong style={{ fontSize: '1.2rem' }}>{volunteers.filter(v => v.status === 'Under Audit').length} Flagged</strong>
          </div>
        </div>

      </div>

      {/* Main Volunteers Table List */}
      <div className="glass-card p-6 border border-white/10">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} color="var(--primary)" /> Volunteer Moderator Directory
          </h3>
          
          {/* Search bar */}
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search volunteers..."
              className="form-input"
              style={{ padding: '6px 12px 6px 34px', fontSize: '0.8rem', width: '100%' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '10px' }}>Volunteer Node</th>
                <th style={{ padding: '10px' }}>Reviews Count</th>
                <th style={{ padding: '10px' }}>Audit Accuracy</th>
                <th style={{ padding: '10px' }}>Latest Action Log</th>
                <th style={{ padding: '10px' }}>Node Status</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Security Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVolunteers.map((vol) => (
                <tr key={vol.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  {/* Name and avatar */}
                  <td style={{ padding: '12px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'rgba(139, 92, 246, 0.15)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.75rem'
                      }}>
                        {vol.username[0].toUpperCase()}
                      </div>
                      <strong style={{ color: '#FFF' }}>@{vol.username}</strong>
                    </div>
                  </td>

                  {/* Reviews */}
                  <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>
                    {vol.auditsCount} checks
                  </td>

                  {/* Accuracy */}
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{
                      fontWeight: 600,
                      color: vol.accuracy > 95 ? 'var(--emerald)' : vol.accuracy > 90 ? 'var(--amber)' : 'var(--rose)'
                    }}>
                      {vol.status === 'Suspended' ? '0.0%' : `${vol.accuracy}%`}
                    </span>
                  </td>

                  {/* Last Action */}
                  <td style={{ padding: '12px 10px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#FFF' }}>{vol.lastAction}</div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{vol.lastActionTime}</span>
                  </td>

                  {/* Status Badge */}
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: vol.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : vol.status === 'Under Audit' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: vol.status === 'Active' ? 'var(--emerald)' : vol.status === 'Under Audit' ? 'var(--amber)' : 'var(--rose)'
                    }}>
                      {vol.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handlePerformAudit(vol.id, vol.username)}
                        disabled={vol.status === 'Suspended'}
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '0.75rem', borderColor: 'rgba(255,255,255,0.06)' }}
                      >
                        Run Audit Check
                      </button>
                      <button
                        onClick={() => handleRevokeCredentials(vol.id, vol.username)}
                        disabled={vol.status === 'Suspended'}
                        className="btn btn-primary"
                        style={{
                          padding: '4px 8px',
                          fontSize: '0.75rem',
                          background: 'rgba(239, 68, 68, 0.12)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          color: '#FCA5A5'
                        }}
                      >
                        Revoke Node
                      </button>
                    </div>
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
