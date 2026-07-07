import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MapDashboard } from './components/MapDashboard';
import { ReportWizard } from './components/ReportWizard';
import { BlockchainLedger } from './components/BlockchainLedger';
import { GamificationCenter } from './components/GamificationCenter';
import { AnalyticsView } from './components/AnalyticsView';
import { ModeratorPanel } from './components/ModeratorPanel';
import { initialIssues, seedBlockchain, initialBadges, initialLeaderboard } from './utils/mockData';
import type { Issue, Badge, LeaderboardUser } from './utils/mockData';
import { createBlock } from './utils/blockchain';
import type { Block } from './utils/blockchain';
import { Bell, Database } from 'lucide-react';
import { AuthScreen } from './components/AuthScreen';
import { initializeUserDb, updateUserProfile } from './utils/userDb';
import type { UserProfile } from './utils/userDb';
import { UserProfilePage } from './components/UserProfilePage';
import { VolunteerMonitor } from './components/VolunteerMonitor';
import { LevelPathwayModal } from './components/LevelPathwayModal';
import { AiHelper } from './components/AiHelper';

// Initialize user database on boot
initializeUserDb();

function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Navigation state
  const [activeTab, setActiveTab] = useState<string>('map');
  const [showLevelPath, setShowLevelPath] = useState<boolean>(false);
  
  // Data States
  const [issues, setIssues] = useState<Issue[]>(() => {
    const saved = localStorage.getItem('civic_issues');
    return saved ? JSON.parse(saved) : initialIssues;
  });

  const [blockchain, setBlockchain] = useState<Block[]>(() => {
    const saved = localStorage.getItem('civic_blockchain');
    return saved ? JSON.parse(saved) : seedBlockchain();
  });

  // Gamification States
  const [userPoints, setUserPoints] = useState<number>(() => {
    const saved = localStorage.getItem('civic_user_points');
    return saved ? Number(saved) : 150;
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
    const saved = localStorage.getItem('civic_badges');
    return saved ? JSON.parse(saved) : initialBadges;
  });

  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>(() => {
    const saved = localStorage.getItem('civic_leaderboard');
    return saved ? JSON.parse(saved) : initialLeaderboard;
  });

  // Logs / Alerts States
  const [notifications, setNotifications] = useState<string[]>([]);

  // Synchronize to LocalStorage
  useEffect(() => {
    localStorage.setItem('civic_issues', JSON.stringify(issues));
  }, [issues]);

  useEffect(() => {
    localStorage.setItem('civic_blockchain', JSON.stringify(blockchain));
  }, [blockchain]);

  useEffect(() => {
    localStorage.setItem('civic_user_points', String(userPoints));
    
    // Update user rank on the leaderboard
    setLeaderboard(prev => prev.map(user => {
      if (user.isCurrentUser && currentUser) {
        const userBadges = badges.filter(b => b.unlockedAt).map(b => b.id);
        return {
          ...user,
          username: currentUser.username,
          points: userPoints,
          badges: userBadges
        };
      }
      return user;
    }));
  }, [userPoints, currentUser]);

  useEffect(() => {
    localStorage.setItem('civic_badges', JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    localStorage.setItem('civic_leaderboard', JSON.stringify(leaderboard));
  }, [leaderboard]);

  // Synchronize points & badges back to User database
  useEffect(() => {
    if (currentUser) {
      const unlockedBadgeIds = badges.filter(b => b.unlockedAt).map(b => b.id);
      updateUserProfile(currentUser.id, userPoints, unlockedBadgeIds);
    }
  }, [userPoints, badges, currentUser]);

  // Add Notification Helper
  const addNotification = (text: string) => {
    setNotifications(prev => [
      `[${new Date().toLocaleTimeString()}] ${text}`,
      ...prev.slice(0, 19)
    ]);
  };

  // On App Mount & Geolocation shift (runs only when user is authenticated)
  useEffect(() => {
    if (!currentUser) return;
    
    addNotification(`Welcome back @${currentUser.username}! Logged in as ${currentUser.role}.`);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const uLat = position.coords.latitude;
          const uLng = position.coords.longitude;
          
          const defaultLat = 40.730610;
          const defaultLng = -73.935242;
          
          const latDiff = uLat - defaultLat;
          const lngDiff = uLng - defaultLng;
          
          const hasShifted = localStorage.getItem('civic_shifted_gps') === 'true';
          
          if (!hasShifted) {
            // Shift issue coordinates
            setIssues(prev => prev.map(issue => ({
              ...issue,
              location: {
                ...issue.location,
                lat: issue.location.lat + latDiff,
                lng: issue.location.lng + lngDiff
              }
            })));
            
            // Shift blockchain coordinates
            setBlockchain(prev => prev.map(block => {
              if (block.index === 0) return block;
              return {
                ...block,
                data: {
                  ...block.data,
                  location: {
                    ...block.data.location,
                    lat: block.data.location.lat + latDiff,
                    lng: block.data.location.lng + lngDiff
                  }
                }
              };
            }));
            
            localStorage.setItem('civic_shifted_gps', 'true');
            addNotification(`GPS GRANTED: Relocating active complaint registry to your neighborhood.`);
          } else {
            addNotification(`GPS GRANTED: Centered dashboard map on your neighborhood.`);
          }
        },
        (error) => {
          console.warn('GPS denied:', error);
          addNotification('GPS authorization denied or timeout. Keeping default city view.');
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, [currentUser]);

  // Handlers
  const handleAddPoints = (points: number) => {
    setUserPoints(prev => prev + points);
    
    // Unlock Local Hero badge if points > 1000
    if (userPoints + points >= 1000) {
      unlockBadge('badge-local-hero');
    }
  };

  const unlockBadge = (badgeId: string) => {
    setBadges(prev => prev.map(b => {
      if (b.id === badgeId && !b.unlockedAt) {
        addNotification(`⭐ BADGE UNLOCKED: "${b.title}"! ${b.description}`);
        return {
          ...b,
          unlockedAt: new Date().toISOString()
        };
      }
      return b;
    }));
  };

  const handleUpvoteIssue = (id: string) => {
    setIssues(prev => prev.map(issue => {
      if (issue.id === id) {
        const upvotes = issue.upvotes + 1;
        // Verify Upvotes trigger Badge
        const totalActivity = upvotes + issue.verifications;
        if (totalActivity >= 5) {
          unlockBadge('badge-voter');
        }
        return { ...issue, upvotes };
      }
      return issue;
    }));
  };

  const handleVerifyIssue = (id: string) => {
    setIssues(prev => prev.map(issue => {
      if (issue.id === id) {
        const verifications = issue.verifications + 1;
        const totalActivity = issue.upvotes + verifications;
        if (totalActivity >= 5) {
          unlockBadge('badge-voter');
        }
        return { ...issue, verifications };
      }
      return issue;
    }));
  };

  const handleSubmitIssue = (newIssue: Omit<Issue, 'id' | 'upvotes' | 'verifications' | 'createdAt' | 'comments'>) => {
    const id = `issue-${Date.now()}`;
    const createdAt = new Date().toISOString();
    
    const createdIssue: Issue = {
      ...newIssue,
      id,
      upvotes: 1,
      verifications: 0,
      createdAt,
      comments: []
    };

    // 1. Add to issues state
    setIssues(prev => [createdIssue, ...prev]);

    // 2. Append new block to blockchain
    const blockData = {
      id,
      title: newIssue.title,
      description: newIssue.description,
      category: newIssue.category,
      priority: newIssue.priority,
      location: newIssue.location,
      status: newIssue.status,
      reporterHash: newIssue.reporterHash,
      mediaCID: newIssue.mediaCID
    };

    const prevBlock = blockchain[blockchain.length - 1];
    const newBlock = createBlock(
      blockchain.length,
      createdAt,
      blockData,
      prevBlock.hash
    );

    setBlockchain(prev => [...prev, newBlock]);
    
    // Unlock Pioneer Badge
    unlockBadge('badge-pioneer');

    // Check if Eco Crusader (3 waste management issues reported/upvoted)
    if (newIssue.category === 'Waste Management') {
      const wasteCount = issues.filter(i => i.category === 'Waste Management').length + 1;
      if (wasteCount >= 3) {
        unlockBadge('badge-cleaner');
      }
    }
  };

  const handleUpdateStatus = (id: string, newStatus: Issue['status'], resolutionComment: string) => {
    if (!currentUser) return;

    // 1. Update issue state with the new comment & status
    setIssues(prev => prev.map(issue => {
      if (issue.id === id) {
        const comment = {
          id: `comment-${Date.now()}`,
          username: currentUser.username,
          text: resolutionComment,
          timestamp: new Date().toISOString(),
          role: currentUser.role
        };
        return {
          ...issue,
          status: newStatus,
          comments: [...issue.comments, comment],
          resolvedAt: newStatus === 'Resolved' ? new Date().toISOString() : undefined
        };
      }
      return issue;
    }));

    // 2. Add block transition event to Blockchain
    const targetIssue = issues.find(i => i.id === id);
    if (targetIssue) {
      const blockData = {
        id,
        title: `STATUS TRANSITION: ${newStatus}`,
        description: `Status of complaint "${targetIssue.title}" changed to ${newStatus}. Action comments: ${resolutionComment}`,
        category: targetIssue.category,
        priority: targetIssue.priority,
        location: targetIssue.location,
        status: newStatus,
        reporterHash: currentUser.role === 'Authority' ? 'AUTHORITY_NODE_01' : 'MODERATOR_NODE_05'
      };

      const prevBlock = blockchain[blockchain.length - 1];
      const newBlock = createBlock(
        blockchain.length,
        new Date().toISOString(),
        blockData,
        prevBlock.hash
      );

      setBlockchain(prev => [...prev, newBlock]);
      
      // Award authority points
      handleAddPoints(35);
      
      // Unlock badge for mod action
      if (currentUser.role === 'Moderator' || currentUser.role === 'Authority') {
        unlockBadge('badge-validator');
      }

      addNotification(`Blockchain ledger block #${newBlock.index} written for transition: ${newStatus}.`);
    }
  };

  // Tampering simulation
  const handleTamperBlock = (index: number, newTitle: string) => {
    setBlockchain(prev => prev.map(block => {
      if (block.index === index) {
        addNotification(`⚠️ TAMPER EVENT: Database record at Block #${index} modified. HASH CHECKSUM UNCHANGED!`);
        return {
          ...block,
          data: {
            ...block.data,
            title: newTitle
          }
        };
      }
      return block;
    }));
  };

  // Restore chain integrity
  const handleRestoreChain = () => {
    localStorage.removeItem('civic_blockchain');
    localStorage.removeItem('civic_issues');
    setBlockchain(seedBlockchain());
    setIssues(initialIssues);
    addNotification('Re-sync request committed. Ledger state restored to original verified hashes.');
  };

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('civic_current_user', JSON.stringify(user));
    
    // Load points & badges of authenticated user
    setUserPoints(user.points);
    setBadges(prev => prev.map(b => ({
      ...b,
      unlockedAt: user.badges.includes(b.id) ? new Date().toISOString() : undefined
    })));

    setActiveTab('map');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('civic_current_user');
    localStorage.removeItem('civic_shifted_gps');
  };

  if (!currentUser) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="app-container">
      {/* Header & Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userPoints={userPoints}
        pendingCount={issues.filter(i => i.status !== 'Resolved').length}
        resolvedCount={issues.filter(i => i.status === 'Resolved').length}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenLevelPath={() => setShowLevelPath(true)}
      />

      {/* Two-Column Workspace Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1.1fr', gap: '24px', flex: 1, paddingBottom: '40px' }} className="responsive-grid-main">
        {/* Main Content Area */}
        <main>
          {activeTab === 'map' && (
            <MapDashboard
              issues={issues}
              onUpvoteIssue={handleUpvoteIssue}
              onVerifyIssue={handleVerifyIssue}
              onAddPoints={handleAddPoints}
              onAddNotification={addNotification}
            />
          )}

          {activeTab === 'report' && (
            <ReportWizard
              existingIssues={issues}
              onSubmitIssue={handleSubmitIssue}
              onAddPoints={handleAddPoints}
              onAddNotification={addNotification}
              currentUsername={currentUser.username}
            />
          )}

          {activeTab === 'ledger' && (
            <BlockchainLedger
              blockchain={blockchain}
              onTamperBlock={handleTamperBlock}
              onRestoreChain={handleRestoreChain}
            />
          )}

          {activeTab === 'gamification' && (
            <GamificationCenter
              userPoints={userPoints}
              badges={badges}
              leaderboard={leaderboard}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              issues={issues}
              onAddNotification={addNotification}
            />
          )}

          {activeTab === 'moderation' && (
            <ModeratorPanel
              issues={issues}
              onUpdateStatus={handleUpdateStatus}
              userRole={currentUser.role}
            />
          )}

          {activeTab === 'vols-monitor' && (
            <VolunteerMonitor onAddNotification={addNotification} />
          )}

          {activeTab === 'profile' && (
            <UserProfilePage
              currentUser={currentUser}
              badges={badges}
              issuesCount={issues.filter(i => i.reporterHash.toLowerCase().startsWith(currentUser.username.toLowerCase())).length}
            />
          )}
        </main>

        {/* Sidebar: Live activity feed */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Notifications Card */}
          <div className="glass-card p-4 border border-white/10" style={{ height: '100%', maxHeight: '420px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
              <Bell size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '0.95rem', margin: 0 }}>Live Activity Feed</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flex: 1, fontSize: '0.8rem', paddingRight: '4px' }}>
              {notifications.map((note, index) => {
                const isWarning = note.includes('TAMPER') || note.includes('BREACHED') || note.includes('integrity');
                const isBadge = note.includes('BADGE');
                return (
                  <div
                    key={index}
                    style={{
                      background: isWarning ? 'rgba(239, 68, 68, 0.04)' : isBadge ? 'rgba(245, 158, 11, 0.04)' : 'rgba(255, 255, 255, 0.01)',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      borderLeft: '3px solid',
                      borderColor: isWarning ? 'var(--rose)' : isBadge ? 'var(--amber)' : 'rgba(255,255,255,0.1)',
                      color: isWarning ? '#FFA1A1' : isBadge ? '#FFE0A3' : 'var(--text-secondary)',
                      lineHeight: '1.4'
                    }}
                  >
                    {note}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick instructions widget */}
          <div className="glass-card p-4 border border-white/10" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
              <Database size={16} color="var(--emerald)" />
              <h4 style={{ fontSize: '0.85rem', margin: 0 }}>Ledger Checksums</h4>
            </div>
            <p style={{ fontSize: '0.75rem', margin: 0, color: 'var(--text-muted)' }}>
              Active blockchain is secured on the client-side. Run a manual verification scan in the <strong>Tamper-Proof Ledger</strong> tab to test security.
            </p>
          </div>
        </aside>
      </div>

      {/* Hackathon Footer */}
      <footer style={{
        marginTop: 'auto',
        padding: '20px 0',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        textAlign: 'center',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '10px'
      }}>
        <span>© 2026 Community Hero Inc. Hackathon Submission Prototype.</span>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>Multimodal AI Powered</span>
          <span>•</span>
          <span>SHA-256 Blockchain Verified</span>
          <span>•</span>
          <span>Predictive Climate Analytics</span>
        </div>
      </footer>

      <LevelPathwayModal
        show={showLevelPath}
        onClose={() => setShowLevelPath(false)}
        userPoints={userPoints}
      />

      {currentUser && currentUser.role === 'Citizen' && (
        <AiHelper />
      )}

      {/* Responsive Grid styling details */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 1024px) {
          .responsive-grid-main {
            grid-template-columns: 1fr !important;
          }
          aside {
            max-height: 300px;
          }
        }
      `}} />
    </div>
  );
}

export default App;
