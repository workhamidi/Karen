import { openDB } from 'idb';

const DB_NAME = 'FlashcardDB';
const WORDS_STORE = 'words';
const QUEUE_STORE = 'offlineQueue';

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(WORDS_STORE)) {
        const wordStore = db.createObjectStore(WORDS_STORE, { keyPath: 'word' });
        wordStore.createIndex('category', 'category');
      }
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE, { autoIncrement: true });
      }
    },
  });
};

export const enqueueOfflineOperation = async (operation) => {
  const db = await initDB();
  await db.add(QUEUE_STORE, operation);
};

export const processOfflineQueue = async (isOnline, addWords, updateWord, deleteWord) => {
  if (!isOnline) return;
  const db = await initDB();
  const tx = db.transaction(QUEUE_STORE, 'readwrite');
  const store = tx.objectStore(QUEUE_STORE);
  const operations = await store.getAll();
  for (const op of operations) {
    if (op.type === 'add') {
      await addWords(op.data);
    } else if (op.type === 'update') {
      await updateWord(op.word, op.data);
    } else if (op.type === 'delete') {
      await deleteWord(op.word);
    }
  }
  if (operations.length === 0) return;
  await store.clear();
  await tx.done;
};