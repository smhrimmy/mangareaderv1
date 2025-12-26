import { useEffect } from 'react';
import { toast } from 'sonner';

// Increment this version whenever you deploy a major update that requires cache clearing
const APP_VERSION = '1.0.1'; 
const VERSION_KEY = 'manga_reader_version';

export const VersionManager = () => {
  useEffect(() => {
    const checkVersion = () => {
      const storedVersion = localStorage.getItem(VERSION_KEY);

      if (storedVersion !== APP_VERSION) {
        console.log(`New version detected: ${APP_VERSION} (was ${storedVersion}). Clearing cache...`);
        
        // List of keys to PRESERVE (User settings, Auth)
        const keysToKeep = [
          'sb-access-token', // Supabase/Auth
          'sb-refresh-token',
          'secret_pin',      // Vault PIN
          'secret_enabled',
          'theme',           // Theme preference
          'reading-history'  // Maybe keep reading history?
        ];

        // Clear everything else (Cache, old data, temp state)
        // Note: We can't clear HTTP cache via JS, but we can clear LocalStorage/SessionStorage
        const allKeys = Object.keys(localStorage);
        allKeys.forEach(key => {
          if (!keysToKeep.some(keep => key.startsWith(keep))) {
            localStorage.removeItem(key);
          }
        });
        
        // Update version
        localStorage.setItem(VERSION_KEY, APP_VERSION);
        
        // Notify user
        toast.info("App updated! Refreshing for the best experience...", {
          duration: 3000,
        });

        // Optional: Force reload to ensure new assets are fetched
        // We set a timeout to let the toast show briefly
        if (storedVersion) { // Only reload if it's an update, not first visit
             setTimeout(() => {
               window.location.reload();
             }, 1500);
        }
      }
    };

    checkVersion();
  }, []);

  return null;
};
