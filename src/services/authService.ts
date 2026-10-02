import { doc, setDoc } from 'firebase/firestore';
import { 
  auth, 
  db, 
  googleAuthProvider, 
  signInWithPopup, 
  firebaseSignOut, 
  handleFirestoreError, 
  OperationType 
} from '../firebase';
import { AppUser, UserRole } from '../types/auth';

const STORAGE_KEY_USER = 'swim_coach_auth_user_v2';
const COACH_PASSCODE = 'cambosquad';
const OWNER_EMAIL = 'nikolas.heinloth@ehrenmueller.ai';

export function getStoredUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading stored user', err);
    return null;
  }
}

export function saveStoredUser(user: AppUser | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  } catch (err) {
    console.error('Error saving user to storage', err);
  }
}

async function syncUserToFirestore(user: AppUser): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      uid: user.uid,
      displayName: user.displayName || (user.role === 'admin' ? 'Coach Admin' : 'Swimmer'),
      email: user.email || '',
      role: user.role,
      swimmerName: user.swimmerName || '',
      assignedLane: user.assignedLane || null,
      lastLoginAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    // Non-blocking sync error
    try {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    } catch {
      // Logged
    }
  }
}

export async function loginAsAdmin(passcode: string, coachName: string = 'Coach Nikolas'): Promise<AppUser> {
  const cleanPasscode = passcode.trim().toLowerCase();
  const validPasscodes = [COACH_PASSCODE, 'admin', 'coach', 'squadcoach'];
  
  if (!validPasscodes.includes(cleanPasscode)) {
    throw new Error('Invalid Coach/Admin passcode. Please check with the squad director.');
  }

  const user: AppUser = {
    uid: auth.currentUser?.uid || `admin_${Date.now()}`,
    email: auth.currentUser?.email || OWNER_EMAIL,
    displayName: coachName.trim() || 'Head Coach',
    role: 'admin',
    lastLoginAt: new Date().toISOString()
  };

  saveStoredUser(user);
  await syncUserToFirestore(user);
  return user;
}

export async function loginAsSwimmer(swimmerName: string, assignedLane?: number): Promise<AppUser> {
  const cleanName = swimmerName.trim() || 'Squad Swimmer';
  const user: AppUser = {
    uid: auth.currentUser?.uid || `swimmer_${Date.now()}`,
    email: auth.currentUser?.email || null,
    displayName: cleanName,
    swimmerName: cleanName,
    role: 'swimmer',
    assignedLane: assignedLane || 1,
    lastLoginAt: new Date().toISOString()
  };

  saveStoredUser(user);
  await syncUserToFirestore(user);
  return user;
}

export async function signInWithGoogle(preferredRole: UserRole = 'admin'): Promise<AppUser> {
  try {
    const result = await signInWithPopup(auth, googleAuthProvider);
    const fbUser = result.user;
    
    // Automatically designate owner email or coach emails as admin
    const email = fbUser.email?.toLowerCase() || '';
    let role: UserRole = preferredRole;
    if (email === OWNER_EMAIL.toLowerCase() || email.includes('coach') || email.includes('admin')) {
      role = 'admin';
    }

    const user: AppUser = {
      uid: fbUser.uid,
      email: fbUser.email,
      displayName: fbUser.displayName || (role === 'admin' ? 'Coach' : 'Swimmer'),
      photoURL: fbUser.photoURL,
      role,
      lastLoginAt: new Date().toISOString()
    };

    saveStoredUser(user);
    await syncUserToFirestore(user);
    return user;
  } catch (err: unknown) {
    const errorObj = err as { code?: string; message?: string };
    if (errorObj?.code === 'auth/popup-closed-by-user') {
      throw new Error('Google sign-in popup was closed before completing.');
    }
    throw new Error(errorObj?.message || 'Google authentication failed. You can sign in using squad passcodes.');
  }
}

export function quickDemoLogin(role: UserRole, customName?: string): AppUser {
  const user: AppUser = {
    uid: `demo_${role}_${Date.now()}`,
    email: role === 'admin' ? OWNER_EMAIL : 'swimmer@cambosquad.org',
    displayName: customName || (role === 'admin' ? 'Coach Nikolas' : 'Sarah M. (Lane 1)'),
    role,
    swimmerName: role === 'swimmer' ? (customName || 'Sarah M.') : undefined,
    assignedLane: role === 'swimmer' ? 1 : undefined,
    lastLoginAt: new Date().toISOString()
  };

  saveStoredUser(user);
  syncUserToFirestore(user);
  return user;
}

export async function logoutUser(): Promise<void> {
  saveStoredUser(null);
  try {
    await firebaseSignOut(auth);
  } catch {
    // Non-blocking
  }
}
