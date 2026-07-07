import React from 'react';
import { Shield, Map, PlusCircle, Database, Award, BarChart3, Settings, LogOut, Users } from 'lucide-react';
import type { UserProfile } from '../utils/userDb';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userPoints: number;
  pendingCount: number;
  resolvedCount: number;
  currentUser: UserProfile;
  onLogout: () => void;
  onOpenLevelPath: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userPoints,
  pendingCount,
  resolvedCount,
  currentUser,
  onLogout,
  onOpenLevelPath,
}) => {
  // Resolve dynamic tabs list based on authorization role flowchart
  const getRoleTabs = (role: 'Citizen' | 'Moderator' | 'Authority') => {
    const mapTab = { id: 'map', label: 'Civic Map', icon: Map };
    const reportTab = { id: 'report', label: 'Report Issue', icon: PlusCircle };
    const ledgerTab = { id: 'ledger', label: 'Tamper-Proof Ledger', icon: Database };
    const rewardsTab = { id: 'gamification', label: 'Rewards & Leaderboard', icon: Award };
    const analyticsTab = { id: 'analytics', label: 'Predictive Analytics', icon: BarChart3 };
    const moderationTab = { id: 'moderation', label: 'Moderator Console', icon: Settings };
    const volsMonitorTab = { id: 'vols-monitor', label: 'Volunteer Monitor', icon: Users };

    switch (role) {
      case 'Citizen':
        // Citizens see map, report wizard, ledger checks, and achievements
        return [mapTab, reportTab, ledgerTab, rewardsTab];
      case 'Moderator':
        // Volunteer Moderators see map, ledger, rewards, predictions, and moderator tools
        return [mapTab, ledgerTab, rewardsTab, analyticsTab, moderationTab];
      case 'Authority':
        // City Authorities see map, ledger, predictions, moderator actions, and volunteer audits
        return [mapTab, ledgerTab, analyticsTab, moderationTab, volsMonitorTab];
      default:
        return [mapTab, reportTab, ledgerTab, rewardsTab];
    }
  };

  const tabs = getRoleTabs(currentUser.role);

  // Simple level calculation (100 points per level)
  const userLevel = Math.floor(userPoints / 100) + 1;
  const progressToNextLevel = userPoints % 100;

  return (
    <header className="glass-card mb-6 mt-4 p-4 border-b border-white/10" style={{ borderRadius: 'var(--radius-md)' }}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Brand Logo & Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            padding: '10px',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Shield size={24} color="#FFF" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="gradient-text">Community Hero</span>
            </h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
              Civic Accountability Platform
            </span>
          </div>
        </div>

        {/* Global Stats Counter */}
        <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem' }} className="hidden md:flex">
          <div className="glass-card" style={{ padding: '6px 12px', background: 'rgba(245, 158, 11, 0.08)', borderColor: 'rgba(245, 158, 11, 0.2)', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--amber)' }}></span>
            <span style={{ color: 'var(--text-secondary)' }}>Pending Issues:</span>
            <strong style={{ color: 'var(--amber)' }}>{pendingCount}</strong>
          </div>
          <div className="glass-card" style={{ padding: '6px 12px', background: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.2)', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--emerald)' }}></span>
            <span style={{ color: 'var(--text-secondary)' }}>Resolved:</span>
            <strong style={{ color: 'var(--emerald)' }}>{resolvedCount}</strong>
          </div>
        </div>

        {/* User Badge / Level Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          
          {/* User profile avatar and details (Clickable to open Profile page) */}
          <div
            onClick={() => setActiveTab('profile')}
            title="View My Profile Details"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '8px',
              background: activeTab === 'profile' ? 'rgba(255,255,255,0.04)' : 'transparent',
              transition: 'background var(--transition-fast)'
            }}
          >
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: currentUser.avatarColor,
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.95rem',
              border: activeTab === 'profile' ? '2px solid var(--primary)' : '2px solid rgba(255,255,255,0.12)',
              textShadow: '0 1px 3px rgba(0,0,0,0.3)',
              boxShadow: activeTab === 'profile' ? '0 0 8px var(--primary-glow)' : 'none',
              transition: 'all 0.2s'
            }}>
              {currentUser.username[0].toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: activeTab === 'profile' ? 'var(--primary)' : '#FFF', transition: 'color var(--transition-fast)' }}>
                @{currentUser.username}
              </span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                color: currentUser.role === 'Authority' ? 'var(--emerald)' : currentUser.role === 'Moderator' ? '#A78BFA' : 'var(--secondary)',
                textTransform: 'uppercase'
              }}>
                {currentUser.role === 'Authority' ? 'City Authority' : currentUser.role === 'Moderator' ? 'Volunteer Moderator' : 'Citizen'}
              </span>
            </div>
          </div>

          {/* Conditional Gamified Stats or Government Node Status */}
          {currentUser.role !== 'Authority' ? (
            <div
              onClick={onOpenLevelPath}
              title="Click to view Level Progression Trail"
              className="glass-card glow-on-hover"
              style={{
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(255, 255, 255, 0.03)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Level <span style={{ color: '#FFF', fontWeight: 700 }}>{userLevel}</span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
                  {userPoints} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>pts</span>
                </div>
              </div>
              {/* Tiny circular progress indicator */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: `conic-gradient(var(--primary) ${progressToNextLevel}%, rgba(255,255,255,0.1) ${progressToNextLevel}%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3px'
              }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-surface-solid)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 700
                }}>
                  ⭐
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.15)' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--emerald)', boxShadow: '0 0 8px var(--emerald)', animation: 'pulse 2s infinite' }}></span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Gov Node: <strong style={{ color: 'var(--emerald)' }}>Online (SLA Active)</strong></span>
            </div>
          )}

          {/* Secure Logout Button */}
          <button
            onClick={onLogout}
            title="Log Out Securely"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#FCA5A5',
              padding: '8px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
            }}
          >
            <LogOut size={16} />
          </button>

        </div>
      </div>

      {/* Tabs list */}
      <nav style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '16px', paddingTop: '12px', overflowX: 'auto', gap: '8px' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                border: 'none',
                background: isActive ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                borderRadius: '6px 6px 0 0',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)'
              }}
              className={isActive ? 'glow-on-hover' : ''}
            >
              <Icon size={16} color={isActive ? 'var(--primary)' : 'var(--text-secondary)'} />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
