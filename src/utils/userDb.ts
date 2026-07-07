import { sha256 } from './blockchain';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: 'Citizen' | 'Moderator' | 'Authority';
  points: number;
  badges: string[];
  avatarColor: string;
}

// Municipal Authorization Codes for Demo
export const MUNICIPAL_PASSCODES = {
  Moderator: 'MOD2026',
  Authority: 'GOV2026'
};

// Seed default users for quick hackathon review
export const defaultUsers: UserProfile[] = [
  {
    id: 'user-citizen-1',
    username: 'citizen',
    email: 'citizen@communityhero.org',
    passwordHash: sha256('citizen123'),
    role: 'Citizen',
    points: 150,
    badges: ['badge-pioneer'],
    avatarColor: '#3B82F6'
  },
  {
    id: 'user-moderator-1',
    username: 'moderator',
    email: 'moderator@communityhero.org',
    passwordHash: sha256('mod123'),
    role: 'Moderator',
    points: 450,
    badges: ['badge-pioneer', 'badge-voter'],
    avatarColor: '#8B5CF6'
  },
  {
    id: 'user-authority-1',
    username: 'authority',
    email: 'authority@communityhero.org',
    passwordHash: sha256('gov123'),
    role: 'Authority',
    points: 850,
    badges: ['badge-pioneer', 'badge-voter', 'badge-validator'],
    avatarColor: '#10B981'
  }
];

// Initialize DB in LocalStorage
export function initializeUserDb(): UserProfile[] {
  const saved = localStorage.getItem('civic_user_db');
  if (saved) {
    return JSON.parse(saved);
  }
  localStorage.setItem('civic_user_db', JSON.stringify(defaultUsers));
  return defaultUsers;
}

// Fetch all users
export function getUsers(): UserProfile[] {
  return initializeUserDb();
}

// Save all users
export function saveUsers(users: UserProfile[]) {
  localStorage.setItem('civic_user_db', JSON.stringify(users));
}

// Find user by username
export function findUser(username: string): UserProfile | undefined {
  const users = getUsers();
  return users.find(u => u.username.toLowerCase() === username.toLowerCase());
}

// Register a new user
export function registerUser(
  username: string, 
  email: string, 
  password: string, 
  role: 'Citizen' | 'Moderator' | 'Authority',
  passcode?: string
): { success: boolean; error?: string; user?: UserProfile } {
  const users = getUsers();
  
  // 1. Check duplicate username
  const existing = findUser(username);
  if (existing) {
    return { success: false, error: 'Username already registered.' };
  }

  // 2. Validate passcode for authority/mod role
  if (role === 'Moderator' && passcode !== MUNICIPAL_PASSCODES.Moderator) {
    return { success: false, error: 'Invalid Municipal Passcode for Volunteer Moderator role.' };
  }
  if (role === 'Authority' && passcode !== MUNICIPAL_PASSCODES.Authority) {
    return { success: false, error: 'Invalid Municipal Passcode for City Authority role.' };
  }

  // 3. Create profile
  const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#EF4444'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  const newUser: UserProfile = {
    id: `user-${Date.now()}`,
    username,
    email,
    passwordHash: sha256(password),
    role,
    points: 0, // starting points
    badges: [],
    avatarColor: randomColor
  };

  const updatedUsers = [...users, newUser];
  saveUsers(updatedUsers);

  return { success: true, user: newUser };
}

// Verify credentials on login
export function loginUser(username: string, password: string): { success: boolean; error?: string; user?: UserProfile } {
  const user = findUser(username);
  if (!user) {
    return { success: false, error: 'Username not found.' };
  }

  const hash = sha256(password);
  if (user.passwordHash !== hash) {
    return { success: false, error: 'Incorrect password.' };
  }

  return { success: true, user };
}

// Update user points and badges
export function updateUserProfile(userId: string, points: number, badges: string[]) {
  const users = getUsers();
  const updated = users.map(user => {
    if (user.id === userId) {
      return {
        ...user,
        points,
        badges
      };
    }
    return user;
  });
  saveUsers(updated);
}
