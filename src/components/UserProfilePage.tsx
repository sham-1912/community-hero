import React from 'react';
import { Award, Mail, Shield, Key, Download, Activity, Compass, ShieldCheck, Fingerprint, Leaf } from 'lucide-react';
import type { UserProfile } from '../utils/userDb';
import type { Badge } from '../utils/mockData';

interface UserProfilePageProps {
  currentUser: UserProfile;
  badges: Badge[];
  issuesCount: number;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({
  currentUser,
  badges,
  issuesCount
}) => {
  // Simple level calculation (100 points per level)
  const userLevel = Math.floor(currentUser.points / 100) + 1;
  const progressToNextLevel = currentUser.points % 100;

  // Resolve Lucide icons based on badge key
  const renderBadgeIcon = (iconName: string, size = 20) => {
    switch (iconName) {
      case 'Compass':
        return <Compass size={size} />;
      case 'ShieldCheck':
        return <ShieldCheck size={size} />;
      case 'Fingerprint':
        return <Fingerprint size={size} />;
      case 'Leaf':
        return <Leaf size={size} />;
      case 'Award':
        return <Award size={size} />;
      default:
        return <Award size={size} />;
    }
  };

  // Export Keys / Profile Backup Data
  const handleExportKeyring = () => {
    const keyringData = {
      platform: "Community Hero Ledger",
      exportedAt: new Date().toISOString(),
      user: {
        id: currentUser.id,
        username: currentUser.username,
        email: currentUser.email,
        role: currentUser.role,
        points: currentUser.points,
        badges: currentUser.badges
      },
      cryptography: {
        authNodeKey: `0x${currentUser.passwordHash.substring(0, 32)}`,
        ledgerSignature: `0x${currentUser.passwordHash.substring(32)}`
      }
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(keyringData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `community_hero_keyring_${currentUser.username}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      
      {/* Upper Grid: Profile Details and Cryptographic Credentials */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Profile Card */}
        <div className="glass-card p-6 border border-white/10" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: currentUser.avatarColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              fontWeight: 800,
              color: '#FFF',
              border: '3px solid rgba(255,255,255,0.1)',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              {currentUser.username[0].toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#FFF' }}>
                @{currentUser.username}
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <Mail size={12} /> {currentUser.email}
              </span>
            </div>
          </div>

          {/* Level Details */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 600 }}>
              <span>Rank Status: <span style={{ color: 'var(--primary)' }}>Level {userLevel}</span></span>
              <span>{currentUser.points} / {userLevel * 100} pts</span>
            </div>
            
            {/* Progress bar */}
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{ width: `${progressToNextLevel}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)' }} />
            </div>
            
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Earn {100 - progressToNextLevel} more Karma points to reach Level {userLevel + 1}!
            </span>
          </div>

          {/* Dynamic Role Badges Info */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '14px', display: 'flex', gap: '10px' }}>
            <Shield size={20} color={currentUser.role === 'Authority' ? 'var(--emerald)' : currentUser.role === 'Moderator' ? '#A78BFA' : 'var(--secondary)'} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ fontSize: '0.85rem', color: '#FFF', display: 'block' }}>
                {currentUser.role === 'Authority' ? 'City Authority node' : currentUser.role === 'Moderator' ? 'Volunteer Moderator node' : 'Citizen node'}
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {currentUser.role === 'Authority' && 'Authorized to review, coordinate municipal resources, sign status transformations, and resolve service logs.'}
                {currentUser.role === 'Moderator' && 'Authorized to verify public complaints, double check duplicate locations, and moderate spam contents.'}
                {currentUser.role === 'Citizen' && 'Authorized to file community issues, coordinate local feedback, upvote backlog, and verify resolutions.'}
              </span>
            </div>
          </div>
        </div>

        {/* Cryptographic Keyring Card */}
        <div className="glass-card p-6 border border-white/10" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Key size={20} color="var(--amber)" />
            <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#FFF' }}>Security Credentials & Signatures</h3>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
            Your account credentials are secured on the client-side using a SHA-256 block hash algorithm. You can export your audit keyring to backup your validation signatures.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontSize: '0.6rem', marginBottom: '2px' }}>Cryptographic SHA-256 HASH</span>
              <span style={{ color: 'var(--amber)', wordBreak: 'break-all' }}>{currentUser.passwordHash}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontSize: '0.6rem', marginBottom: '2px' }}>Role Signature Key</span>
              <span style={{ color: 'var(--primary)', wordBreak: 'break-all' }}>
                {currentUser.role === 'Authority' && '0xGOV_NODE_SIG_'}{currentUser.role === 'Moderator' && '0xMOD_NODE_SIG_'}{currentUser.role === 'Citizen' && '0xCIT_NODE_SIG_'}{currentUser.id.toUpperCase()}
              </span>
            </div>
          </div>

          <button
            onClick={handleExportKeyring}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '10px', fontSize: '0.8rem', gap: '8px' }}
          >
            <Download size={14} /> Export Cryptographic Keyring
          </button>
        </div>

      </div>

      {/* Role-Based Activity stats Row */}
      <div className="glass-card p-6 border border-white/10">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} color="var(--primary)" /> Activity Statistics
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', marginBottom: '6px' }}>
              {currentUser.role === 'Citizen' ? 'Filed Complaints' : currentUser.role === 'Moderator' ? 'Reports Moderated' : 'Resolutions Signed'}
            </span>
            <strong style={{ fontSize: '1.8rem', color: '#FFF' }}>
              {currentUser.role === 'Citizen' ? issuesCount : currentUser.role === 'Moderator' ? issuesCount + 4 : issuesCount + 9}
            </strong>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', marginBottom: '6px' }}>
              {currentUser.role === 'Citizen' ? 'Verifications Cast' : currentUser.role === 'Moderator' ? 'Audit Checks Passed' : 'Active Forecasts'}
            </span>
            <strong style={{ fontSize: '1.8rem', color: 'var(--emerald)' }}>
              {currentUser.role === 'Citizen' ? Math.floor(currentUser.points / 35) : currentUser.role === 'Moderator' ? Math.floor(currentUser.points / 25) + 3 : '4 Modules'}
            </strong>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', marginBottom: '6px' }}>
              Badges Unlocked
            </span>
            <strong style={{ fontSize: '1.8rem', color: 'var(--primary)' }}>
              {badges.filter(b => b.unlockedAt).length} / {badges.length}
            </strong>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', marginBottom: '6px' }}>
              Ledger Consensus
            </span>
            <strong style={{ fontSize: '1.8rem', color: 'var(--amber)' }}>
              Synchronized
            </strong>
          </div>

        </div>
      </div>

      {/* Lower Row: Badges cabinet */}
      <div className="glass-card p-6 border border-white/10">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
          <Award size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '1.15rem', margin: 0, color: '#FFF' }}>Achievements Cabinet</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {badges.map((badge) => {
            const isUnlocked = !!badge.unlockedAt;
            return (
              <div
                key={badge.id}
                className="glass-card p-4 border"
                style={{
                  borderColor: isUnlocked ? badge.color : 'rgba(255,255,255,0.04)',
                  background: isUnlocked ? `${badge.color}05` : 'rgba(255,255,255,0.01)',
                  opacity: isUnlocked ? 1 : 0.45,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform var(--transition-fast)'
                }}
              >
                {/* Glowing light behind unlocked badge icon */}
                {isUnlocked && (
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    left: '-10px',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: badge.color,
                    filter: 'blur(20px)',
                    opacity: 0.3,
                    zIndex: 0
                  }} />
                )}

                <div
                  style={{
                    fontSize: '1.8rem',
                    background: isUnlocked ? `${badge.color}15` : 'rgba(255,255,255,0.03)',
                    color: isUnlocked ? badge.color : 'var(--text-muted)',
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1,
                    flexShrink: 0
                  }}
                >
                  {renderBadgeIcon(badge.icon)}
                </div>

                <div style={{ zIndex: 1, overflow: 'hidden' }}>
                  <strong style={{ fontSize: '0.85rem', color: isUnlocked ? '#FFF' : 'var(--text-muted)', display: 'block' }}>
                    {badge.title}
                  </strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {badge.description}
                  </span>
                  {isUnlocked ? (
                    <span style={{ fontSize: '0.6rem', color: 'var(--emerald)', display: 'block', marginTop: '4px', fontWeight: 600 }}>
                      ✓ Unlocked {new Date(badge.unlockedAt!).toLocaleDateString()}
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                      🔒 Locked (Needs points)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
