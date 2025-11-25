import { UserData } from "../types";

// --- LOCAL STORAGE IMPLEMENTATION ---
const STORAGE_KEY = 'sobuj_sathi_local_data';

// Default Guest User Data
const INITIAL_DATA: UserData = {
  uid: 'guest_user',
  email: 'guest@sobuj.sathi',
  displayName: 'সবুজ বন্ধু', // Green Friend
  level: 1,
  xp: 0,
  totalXp: 0,
  streak: 1,
  lastCheckIn: Date.now(),
  unlockedCards: [],
  impactStats: { water: 5, oxygen: 10, carbon: 5 }
};

// Event listeners for data updates to simulate real-time subscriptions
const listeners: Record<string, ((data: UserData) => void)[]> = {};

const getLocalData = (): UserData => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        // Merge with initial data to ensure all fields exist if schema changes
        return stored ? { ...INITIAL_DATA, ...JSON.parse(stored) } : INITIAL_DATA;
    } catch {
        return INITIAL_DATA;
    }
};

// Explicitly export it
export const getUserData = getLocalData;

const saveLocalData = (data: UserData) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        // Notify listeners immediately
        if (listeners[data.uid]) {
            listeners[data.uid].forEach(cb => {
                try { cb(data); } catch(e) { console.error("Listener error", e); }
            });
        }
    } catch (e) {
        console.error("Failed to save local data", e);
    }
};

// --- AUTH MOCK EXPORTS ---

export const getAuthInstance = () => {
    // Always returns a logged-in guest user
    return {
        currentUser: {
            uid: 'guest_user',
            displayName: 'সবুজ বন্ধু',
            email: 'guest@sobuj.sathi'
        }
    };
};

// Simulate Auth State Change - fires immediately with the guest user
export const onAuthStateChanged = (_: any, callback: (user: any) => void) => {
    const user = getAuthInstance().currentUser;
    callback(user);
    return () => {}; // Unsubscribe no-op
};

// No-ops for compatibility
export const signInWithGoogle = async () => { console.log("Auto-signed in as Guest"); };
export const signOut = async () => { console.log("Sign out not supported in guest mode"); };

// --- DATA SERVICE EXPORTS ---

export const subscribeToUserData = (uid: string, callback: (data: UserData) => void) => {
    if (!listeners[uid]) listeners[uid] = [];
    listeners[uid].push(callback);
    
    // Initial load
    const data = getLocalData();
    // If it's a fresh load (no storage), save initial data
    if (!localStorage.getItem(STORAGE_KEY)) {
        saveLocalData(INITIAL_DATA);
    }
    
    // Always trigger callback with latest data on subscription
    callback(data);

    return () => {
        if(listeners[uid]) {
            listeners[uid] = listeners[uid].filter(cb => cb !== callback);
        }
    };
};

export const updateUserProgress = async (uid: string, updates: Partial<UserData>) => {
    const current = getLocalData();
    // Verify UID matches if provided, otherwise assume guest context
    if (uid && current.uid !== uid) {
        console.warn("User ID mismatch in update, forcing current user context");
    }
    
    const updated = { ...current, ...updates };
    saveLocalData(updated);
};