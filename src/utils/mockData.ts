import { createBlock } from './blockchain';
import type { Block } from './blockchain';

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: 'Pothole' | 'Waste Management' | 'Water Leakage' | 'Streetlight Failure';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: 'Pending' | 'Investigating' | 'In Progress' | 'Resolved';
  reporterHash: string;
  mediaCID?: string;
  upvotes: number;
  verifications: number;
  createdAt: string;
  resolvedAt?: string;
  comments: {
    id: string;
    username: string;
    text: string;
    timestamp: string;
    role?: 'Citizen' | 'Moderator' | 'Authority';
  }[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  unlockedAt?: string;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  points: number;
  badges: string[];
  avatarColor: string;
  isCurrentUser?: boolean;
}

// Initial mock issues
export const initialIssues: Issue[] = [
  {
    id: 'issue-1',
    title: 'Massive Pothole on Main St Crossing',
    description: 'A deep pothole has formed in the middle lane of Main St, right after the crosswalk. Cars are swerving dangerously to avoid it. It is about 1.5 meters wide and 15cm deep.',
    category: 'Pothole',
    priority: 'High',
    location: {
      lat: 40.730610,
      lng: -73.935242,
      address: '42 Main St, Sector 4'
    },
    status: 'In Progress',
    reporterHash: '0x3F8a...B9e2',
    mediaCID: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    upvotes: 42,
    verifications: 12,
    createdAt: '2026-06-25T10:15:30Z',
    comments: [
      {
        id: 'c1',
        username: 'Alex_Green',
        text: 'Hit this yesterday and got a flat tire. Needs immediate repair!',
        timestamp: '2026-06-25T11:00:00Z',
        role: 'Citizen'
      },
      {
        id: 'c2',
        username: 'Officer_Dan',
        text: 'Temporary caution signs placed. Dispatching repair crew tomorrow.',
        timestamp: '2026-06-26T08:30:00Z',
        role: 'Authority'
      }
    ]
  },
  {
    id: 'issue-2',
    title: 'Burst Water Pipe & Flooding',
    description: 'Clean drinking water has been gushing from the sidewalk since 4:00 AM. It has flooded the pedestrian walkway and is starting to reach the local storefronts.',
    category: 'Water Leakage',
    priority: 'Critical',
    location: {
      lat: 40.735820,
      lng: -73.940250,
      address: '109 Oak Avenue, Sector 2'
    },
    status: 'Investigating',
    reporterHash: '0x9E21...C10d',
    mediaCID: 'QmdXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo7abc',
    upvotes: 89,
    verifications: 34,
    createdAt: '2026-06-29T04:20:00Z',
    comments: [
      {
        id: 'c3',
        username: 'Sarah_K',
        text: 'Water pressure in our block has dropped completely. Hope they shut the main valve soon.',
        timestamp: '2026-06-29T05:00:00Z',
        role: 'Citizen'
      }
    ]
  },
  {
    id: 'issue-3',
    title: 'Unattended Garbage Heap Near School Entrance',
    description: 'Trash bins are overflowing and illegal dumping has spread across the corner near the entrance of Sector 5 Elementary School. Stray dogs are scattering waste everywhere, creating health hazards.',
    category: 'Waste Management',
    priority: 'Medium',
    location: {
      lat: 40.725910,
      lng: -73.931890,
      address: 'Sector 5 School Road'
    },
    status: 'Pending',
    reporterHash: '0xAB3f...F402',
    mediaCID: 'QmWknFiJnKLwHCnL72vedxjQkDDP1mXWo6ucoXoypizj123',
    upvotes: 18,
    verifications: 5,
    createdAt: '2026-06-29T11:45:00Z',
    comments: []
  },
  {
    id: 'issue-4',
    title: 'Multiple Broken Streetlights on Park Pathway',
    description: 'Three consecutive streetlights are out along the jogging pathway in Sector 9 Central Park. The entire path is pitch black after 7 PM, causing safety concerns for nighttime runners.',
    category: 'Streetlight Failure',
    priority: 'Low',
    location: {
      lat: 40.728950,
      lng: -73.945820,
      address: 'Central Park Jogging Path, Sector 9'
    },
    status: 'Resolved',
    reporterHash: '0x712a...E88c',
    mediaCID: 'QmP1mXWo6ucoXoypizjW3WknFiJnKLwHCnL72vedxjQkDD12',
    upvotes: 24,
    verifications: 8,
    createdAt: '2026-06-20T21:10:00Z',
    resolvedAt: '2026-06-24T15:30:00Z',
    comments: [
      {
        id: 'c4',
        username: 'JoggerMark',
        text: 'Thank you for resolving this. Path is safe again!',
        timestamp: '2026-06-24T16:00:00Z',
        role: 'Citizen'
      }
    ]
  }
];

// Seed initial blockchain blocks from issues
export function seedBlockchain(): Block[] {
  let chain: Block[] = [];
  
  // Genesis Block
  const genesisData: any = {
    id: 'genesis-0',
    title: 'Community Hero Blockchain Initialized',
    description: 'Genesis block securing the local governance complaint logs.',
    category: 'System',
    priority: 'Low',
    location: { lat: 0, lng: 0, address: 'System Root' },
    status: 'Resolved',
    reporterHash: 'SYSTEM_ROOT'
  };
  
  const genesisBlock = createBlock(0, '2026-06-01T00:00:00Z', genesisData, '0000000000000000000000000000000000000000000000000000000000000000');
  chain.push(genesisBlock);

  // Add historical issues to blockchain
  initialIssues.forEach((issue) => {
    // Re-create issues block data
    const blockData = {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      category: issue.category,
      priority: issue.priority,
      location: issue.location,
      status: issue.status,
      reporterHash: issue.reporterHash,
      mediaCID: issue.mediaCID
    };
    const block = createBlock(
      chain.length,
      issue.createdAt,
      blockData,
      chain[chain.length - 1].hash
    );
    chain.push(block);
  });

  return chain;
}

// Badges list
export const initialBadges: Badge[] = [
  {
    id: 'badge-pioneer',
    title: 'Civic Pioneer',
    description: 'Submit your first community issue report.',
    icon: 'Compass',
    color: 'from-blue-500 to-indigo-500',
    unlockedAt: '2026-06-29T15:02:00Z' // Starts unlocked for demo simplicity (or we can unlock on first submit)
  },
  {
    id: 'badge-voter',
    title: 'Community Guardian',
    description: 'Verify or upvote 5 reports filed by other citizens.',
    icon: 'ShieldCheck',
    color: 'from-emerald-500 to-teal-500'
  },
  {
    id: 'badge-validator',
    title: 'Truth Seeker',
    description: 'Sign off on a status update as an authorized volunteer moderator.',
    icon: 'Fingerprint',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'badge-cleaner',
    title: 'Eco Crusader',
    description: 'File or upvote 3 Waste Management issues.',
    icon: 'Leaf',
    color: 'from-amber-500 to-orange-500'
  },
  {
    id: 'badge-local-hero',
    title: 'Hyperlocal Hero',
    description: 'Reach 1,000 community contribution points.',
    icon: 'Award',
    color: 'from-red-500 to-yellow-500'
  }
];

// Leaderboard Users
export const initialLeaderboard: LeaderboardUser[] = [
  { rank: 1, name: 'Sanjay_Patel', points: 1450, badges: ['badge-pioneer', 'badge-voter', 'badge-cleaner', 'badge-local-hero'], avatarColor: '#8B5CF6' },
  { rank: 2, name: 'GreenCity_Advocate', points: 1210, badges: ['badge-pioneer', 'badge-voter', 'badge-cleaner'], avatarColor: '#10B981' },
  { rank: 3, name: 'StreetLightWatch', points: 980, badges: ['badge-pioneer', 'badge-voter'], avatarColor: '#F59E0B' },
  { rank: 4, name: 'You (Community Hero)', points: 150, badges: ['badge-pioneer'], avatarColor: '#3B82F6', isCurrentUser: true },
  { rank: 5, name: 'CivicReporter99', points: 120, badges: ['badge-pioneer'], avatarColor: '#EC4899' },
  { rank: 6, name: 'Nikhil_K', points: 90, badges: [], avatarColor: '#6B7280' }
];

// Analytics - Historical reports by category (last 6 months)
export const historicalCategoryData = [
  { month: 'Jan', Potholes: 12, Waste: 25, WaterLeaks: 8, Streetlights: 15 },
  { month: 'Feb', Potholes: 15, Waste: 28, WaterLeaks: 10, Streetlights: 12 },
  { month: 'Mar', Potholes: 18, Waste: 22, WaterLeaks: 12, Streetlights: 9 },
  { month: 'Apr', Potholes: 25, Waste: 30, WaterLeaks: 19, Streetlights: 11 },
  { month: 'May', Potholes: 34, Waste: 35, WaterLeaks: 22, Streetlights: 14 },
  { month: 'Jun', Potholes: 45, Waste: 40, WaterLeaks: 38, Streetlights: 20 }
];

// Resolution metrics (days to resolve by category)
export const resolutionTimeData = [
  { name: 'Pothole', days: 4.2, active: 12, resolved: 89 },
  { name: 'Waste Mgmt', days: 1.8, active: 4, resolved: 142 },
  { name: 'Water Leak', days: 2.5, active: 8, resolved: 67 },
  { name: 'Streetlights', days: 5.1, active: 6, resolved: 52 }
];

// Predictive Analytics - Rainfall vs Potholes (monsoon forecasting)
export const monsoonPredictiveData = [
  { rainfall: 50, potholesPredicted: 15, confidence: 95 },
  { rainfall: 100, potholesPredicted: 28, confidence: 92 },
  { rainfall: 180, potholesPredicted: 45, confidence: 89 },
  { rainfall: 250, potholesPredicted: 65, confidence: 85 }, // Peak monsoon (July/August forecast)
  { rainfall: 320, potholesPredicted: 90, confidence: 82 }
];

// Sectors config and predictive threat levels
export interface SectorRisk {
  id: number;
  name: string;
  centerLat: number;
  centerLng: number;
  potholeRisk: 'Low' | 'Medium' | 'High';
  waterLeakRisk: 'Low' | 'Medium' | 'High';
  infrastructureAgeYears: number;
  description: string;
}

export const sectorRisks: SectorRisk[] = [
  {
    id: 1,
    name: 'Sector 2 (Commercial Hub)',
    centerLat: 40.7360,
    centerLng: -73.9400,
    potholeRisk: 'Medium',
    waterLeakRisk: 'High',
    infrastructureAgeYears: 42,
    description: 'High pressure on water mains. Ageing pipelines present elevated risk of leakage during temperature shifts.'
  },
  {
    id: 2,
    name: 'Sector 4 (Old Town)',
    centerLat: 40.7300,
    centerLng: -73.9350,
    potholeRisk: 'High',
    waterLeakRisk: 'Medium',
    infrastructureAgeYears: 58,
    description: 'High asphalt wear. Severe pothole proliferation predicted before the upcoming heavy rainfall season.'
  },
  {
    id: 3,
    name: 'Sector 5 (Residential Belt)',
    centerLat: 40.7250,
    centerLng: -73.9320,
    potholeRisk: 'Low',
    waterLeakRisk: 'Low',
    infrastructureAgeYears: 12,
    description: 'Relatively new developments. Minimal structural risks expected over the next quarter.'
  },
  {
    id: 4,
    name: 'Sector 9 (Park & Recreation)',
    centerLat: 40.7290,
    centerLng: -73.9460,
    potholeRisk: 'Medium',
    waterLeakRisk: 'Low',
    infrastructureAgeYears: 25,
    description: 'Erosion concerns along park pathways. Heavy foot traffic and runoff water might degrade path edges.'
  }
];
