import React from 'react';
import { Compass, ShieldCheck, Fingerprint, Leaf, Award, Lock, Trophy, Zap, Star } from 'lucide-react';
import type { Badge, LeaderboardUser } from '../utils/mockData';

interface GamificationCenterProps {
  userPoints: number;
  badges: Badge[];
  leaderboard: LeaderboardUser[];
}

export const GamificationCenter: React.FC<GamificationCenterProps> = ({
  userPoints,
  badges,
  leaderboard,
}) => {
  const userLevel = Math.floor(userPoints / 100) + 1;
  const nextLevelPoints = userLevel * 100;
  const currentLevelPoints = (userLevel - 1) * 100;
  const levelProgressPoints = userPoints - currentLevelPoints;
  const progressPercent = Math.min((levelProgressPoints / 100) * 100, 100);

  // Map icon strings to Lucide components
  const renderBadgeIcon = (iconName: string, size = 20) => {
    switch (iconName) {
      case 'Compass': return <Compass size={size} />;
      case 'ShieldCheck': return <ShieldCheck size={size} />;
      case 'Fingerprint': return <Fingerprint size={size} />;
      case 'Leaf': return <Leaf size={size} />;
      case 'Award': return <Award size={size} />;
      default: return <Award size={size} />;
    }
  };

  return (
    <div className="dashboard-grid">
      {/* Achievements Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Progress Card */}
        <div className="glass-card p-6 border border-white/10" style={{
          background: 'linear-gradient(135deg, rgba(22, 28, 50, 0.45) 0%, rgba(139, 92, 246, 0.05) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.15)', padding: '10px', borderRadius: '10px' }}>
              <Zap size={24} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Civic Rank Progression</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Earn karma points by reporting issues, upvoting, and verifying status updates.</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 600 }}>
            <span>Level {userLevel} Citizen</span>
            <span style={{ color: 'var(--primary)' }}>{userPoints} / {nextLevelPoints} Karma Pts</span>
          </div>

          {/* Custom level bar */}
          <div style={{ width: '100%', height: '10px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '5px', overflow: 'hidden', marginBottom: '14px' }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--secondary) 0%, var(--primary) 100%)',
              borderRadius: '5px',
              transition: 'width var(--transition-slow)'
            }} />
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Star size={12} color="var(--amber)" />
            <span>Need {100 - levelProgressPoints} more points to level up. Leveling unlocks priority moderators tools.</span>
          </div>
        </div>

        {/* Badges Cabinet */}
        <div className="glass-card p-6 border border-white/10">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={18} color="var(--amber)" /> Badges Cabinet
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
            {badges.map((badge) => {
              const isUnlocked = !!badge.unlockedAt;

              return (
                <div
                  key={badge.id}
                  className="glass-card interactive"
                  style={{
                    padding: '16px 12px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    background: isUnlocked
                      ? 'rgba(255, 255, 255, 0.02)'
                      : 'rgba(255,255,255,0.01)',
                    borderColor: isUnlocked
                      ? 'rgba(139, 92, 246, 0.25)'
                      : 'rgba(255, 255, 255, 0.03)',
                    opacity: isUnlocked ? 1 : 0.4
                  }}
                  title={badge.description}
                >
                  {/* Icon with circular color gradient */}
                  <div
                    className={isUnlocked ? 'glow-on-hover' : ''}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: isUnlocked
                        ? `linear-gradient(135deg, ${badge.color.split(' ')[1]} 0%, ${badge.color.split(' ')[3]} 100%)`
                        : 'rgba(255,255,255,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isUnlocked ? '#FFF' : 'var(--text-muted)',
                      boxShadow: isUnlocked ? '0 4px 12px rgba(0, 0, 0, 0.3)' : 'none',
                      position: 'relative'
                    }}
                  >
                    {renderBadgeIcon(badge.icon)}
                    {!isUnlocked && (
                      <div style={{
                        position: 'absolute',
                        bottom: '-2px',
                        right: '-2px',
                        background: '#1F2937',
                        padding: '2px',
                        borderRadius: '50%',
                        border: '1px solid var(--border)'
                      }}>
                        <Lock size={10} color="var(--text-muted)" />
                      </div>
                    )}
                  </div>

                  <div>
                    <strong style={{ fontSize: '0.85rem', display: 'block', color: isUnlocked ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {badge.title}
                    </strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px', lineHeight: '1.2' }}>
                      {badge.description}
                    </span>
                  </div>

                  {isUnlocked && (
                    <span style={{ fontSize: '0.65rem', color: 'var(--emerald)', fontWeight: 700 }}>
                      UNLOCKED
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Leaderboard Column */}
      <div className="glass-card p-6 border border-white/10" style={{ height: 'fit-content' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trophy size={18} color="var(--primary)" /> Top Civic Heros
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {leaderboard
            .sort((a, b) => b.points - a.points)
            .map((user, idx) => {
              const rank = idx + 1;
              return (
                <div
                  key={user.name}
                  className="glass-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 14px',
                    background: user.isCurrentUser ? 'rgba(139, 92, 246, 0.12)' : 'rgba(255,255,255,0.01)',
                    borderColor: user.isCurrentUser ? 'var(--primary)' : 'var(--border)',
                    borderWidth: user.isCurrentUser ? '1.5px' : '1px'
                  }}
                >
                  {/* Rank */}
                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    width: '24px',
                    color: rank === 1 ? 'var(--amber)' : rank === 2 ? '#94A3B8' : rank === 3 ? '#B45309' : 'var(--text-muted)'
                  }}>
                    #{rank}
                  </div>

                  {/* Avatar */}
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: user.avatarColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: '#FFF',
                    marginRight: '12px'
                  }}>
                    {user.name.substring(0, 2).toUpperCase()}
                  </div>

                  {/* Name & badges */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: user.isCurrentUser ? 700 : 500 }}>
                        {user.name}
                      </span>
                      {user.isCurrentUser && (
                        <span style={{
                          fontSize: '0.6rem',
                          background: 'var(--primary)',
                          color: '#FFF',
                          padding: '1px 4px',
                          borderRadius: '3px',
                          fontWeight: 700
                        }}>
                          YOU
                        </span>
                      )}
                    </div>
                    {/* Mini badges icons */}
                    <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
                      {user.badges.map(badgeId => {
                        const bg = badges.find(b => b.id === badgeId);
                        if (!bg) return null;
                        return (
                          <span
                            key={badgeId}
                            title={bg.title}
                            style={{ fontSize: '0.65rem', filter: 'brightness(1.2)' }}
                          >
                            {bg.icon === 'Compass' ? '🧭' : bg.icon === 'ShieldCheck' ? '🛡️' : bg.icon === 'Fingerprint' ? '👤' : bg.icon === 'Leaf' ? '🍃' : '🏆'}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Points */}
                  <div style={{ textAlign: 'right', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {user.points} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>Karma</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
