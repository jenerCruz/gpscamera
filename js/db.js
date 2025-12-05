export const DB_NAME = "TimeLocusDB";
export const STORE = "fichajes";
export let db = null;

export function initDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);

    req.onupgradeneeded = e => {
      const database = e.target.result;
      if (!database.objectStoreNames.contains(STORE))
        database.createObjectStore(STORE, { keyPath: "id" });
    };

    req.onsuccess = e => {
      db = e.target.result;
      resolve();
    };

    req.onerror = e => reject(e.target.error);
  });
}

export function savePhoto(record) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE], "readwrite");
    const store = tx.objectStore(STORE);

    const req = store.add(record);

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
