import React from 'react';
import { X, Lock, CheckCircle2, Star, Shield, Trophy } from 'lucide-react';

interface MilestoneNode {
  level: number;
  title: string;
  pointsRequired: number;
  description: string;
  icon: React.ReactNode;
}

interface LevelPathwayModalProps {
  show: boolean;
  onClose: () => void;
  userPoints: number;
}

export const LevelPathwayModal: React.FC<LevelPathwayModalProps> = ({ show, onClose, userPoints }) => {
  if (!show) return null;

  const currentLevel = Math.floor(userPoints / 100) + 1;

  const milestones: MilestoneNode[] = [
    {
      level: 1,
      title: 'Civic Recruit',
      pointsRequired: 0,
      description: 'Enter the ledger register and log your neighborhood coordinates.',
      icon: <Star size={20} />
    },
    {
      level: 2,
      title: 'Neighborhood Guardian',
      pointsRequired: 100,
      description: 'Submit reported complaints and verify active road wear issues.',
      icon: <Shield size={20} />
    },
    {
      level: 3,
      title: 'Community Steward',
      pointsRequired: 200,
      description: 'Sign auditing ledgers and coordinate trash accumulation clears.',
      icon: <CheckCircle2 size={20} />
    },
    {
      level: 4,
      title: 'Urban Sentinel',
      pointsRequired: 300,
      description: 'Earn public endorsements, vote duplicates, and audit local alerts.',
      icon: <Trophy size={20} />
    },
    {
      level: 5,
      title: 'Metropolitan Hero',
      pointsRequired: 500,
      description: 'Attain absolute consensus. Optimize civic ML modeling datasets.',
      icon: <Trophy size={20} style={{ color: 'var(--amber)' }} />
    }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(7, 9, 19, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div className="glass-card border border-white/10 animate-fade-in" style={{
        width: '100%',
        maxWidth: '520px',
        padding: '24px',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            🏆 Civic Progression Pathway
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Info Header */}
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          Perform reports and upvote items in the map registry to earn points and step up your status trail. Your current score: <strong style={{ color: 'var(--primary)' }}>{userPoints} pts</strong>.
        </div>

        {/* Trail Path */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          position: 'relative',
          padding: '20px 0'
        }}>
          {/* Vertical Connecting Line */}
          <div style={{
            position: 'absolute',
            top: '40px',
            bottom: '40px',
            width: '4px',
            background: 'rgba(255,255,255,0.05)',
            zIndex: 0
          }} />

          {milestones.map((node, index) => {
            const isCompleted = userPoints >= node.pointsRequired;
            const isActive = currentLevel === node.level;
            const isLocked = userPoints < node.pointsRequired;

            // Snake-like left/right indentation offsets
            const offsetStyle = {
              marginLeft: index % 2 === 0 ? '-30px' : '30px'
            };

            return (
              <div
                key={node.level}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  zIndex: 1,
                  width: '100%',
                  justifyContent: 'center',
                  ...offsetStyle
                }}
              >
                {/* Milestone Node Badge */}
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: isCompleted ? 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' : 'rgba(255,255,255,0.04)',
                    border: '3px solid',
                    borderColor: isActive ? 'var(--amber)' : isCompleted ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isCompleted ? '#FFF' : 'var(--text-muted)',
                    boxShadow: isActive ? '0 0 16px var(--amber)' : 'none',
                    position: 'relative',
                    animation: isActive ? 'pulse 2s infinite' : 'none',
                    cursor: 'pointer'
                  }}
                  title={node.description}
                >
                  {isLocked ? <Lock size={16} color="var(--text-muted)" /> : node.icon}

                  {/* Level text bubble */}
                  <span style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    background: isActive ? 'var(--amber)' : 'rgba(255,255,255,0.08)',
                    color: isActive ? '#000' : '#FFF',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {node.level}
                  </span>
                </div>

                {/* Info Box */}
                <div className="glass-card" style={{
                  padding: '12px 16px',
                  width: '240px',
                  background: isActive ? 'rgba(139, 92, 246, 0.08)' : 'rgba(255,255,255,0.01)',
                  borderColor: isActive ? 'rgba(139, 92, 246, 0.25)' : 'rgba(255,255,255,0.04)'
                }}>
                  <strong style={{ fontSize: '0.85rem', color: isLocked ? 'var(--text-muted)' : '#FFF', display: 'block' }}>
                    {node.title}
                  </strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                    {node.description}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: isCompleted ? 'var(--emerald)' : 'var(--amber)', display: 'block', marginTop: '4px', fontWeight: 600 }}>
                    {isCompleted ? '✓ Unlocked' : `Requires ${node.pointsRequired} pts`}
                  </span>
                </div>

              </div>
            );
          })}
        </div>

        {/* Footer */}
        <button className="btn btn-secondary" onClick={onClose} style={{ width: '100%', padding: '10px' }}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};
