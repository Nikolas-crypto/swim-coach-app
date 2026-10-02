export type UserRole = 'admin' | 'swimmer';

export interface AppUser {
  uid: string;
  email?: string | null;
  displayName: string;
  role: UserRole;
  photoURL?: string | null;
  swimmerName?: string;
  assignedLane?: number;
  lastLoginAt?: string;
}
