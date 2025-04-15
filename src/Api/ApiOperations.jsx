import { initDB, enqueueOfflineOperation, processOfflineQueue } from './dbUtils';
import { mapRowToWordObject, mapWordObjectToRow, findWordRowIndex } from './sheetUtils';
import { getCurrentTimestampString } from '../utils/Helpers';

const SHEET_NAME = 'Sheet1';
const SHEET_COLUMN_RANGE = 'A:AF';
const SHEET_START_ROW = 2;
const SHEET_DATA_RANGE = `${SHEET_NAME}!${SHEET_COLUMN_RANGE}${SHEET_START_ROW}`;

export const getAllWords = async ({ spreadsheetId, executeApiCall, isOnline }, { forceRefresh = false } = {}) => {
  const db = await initDB();
  if (!forceRefresh) {
    const words = await db.getAll('words');
    const validWords = words.filter(word => word && !word.is_deleted);
    if (validWords.length > 0) {
      return validWords;
    }
  }
  if (!isOnline) {
    const words = await db.getAll('words');
    return words.filter(word => word && !word.is_deleted);
  }
  const result = await executeApiCall(
    window.gapi.client.sheets.spreadsheets.values.get,
    { spreadsheetId, range: SHEET_DATA_RANGE },
    'getAllWords'
  );
  const rows = result?.values || [];
  const words = rows.map(mapRowToWordObject).filter(Boolean);
  const tx = db.transaction('words', 'readwrite');
  const store = tx.objectStore('words');
  await store.clear();
  for (const word of words) {
    await store.put(word);
  }
  await tx.done;
  return words.filter(word => !word.is_deleted);
};

export const updateWord = async ({ spreadsheetId, executeApiCall, findWordRowIndex, isOnline }, wordIdentifier, wordData) => {
  const db = await initDB();
  if (!isOnline) {
    await enqueueOfflineOperation({ type: 'update', word: wordIdentifier, data: wordData });
    await db.put('words', { ...wordData, word: wordIdentifier });
    return true;
  }
  const rowIndex = await findWordRowIndex({ spreadsheetId, executeApiCall }, wordIdentifier);
  if (rowIndex === -1) throw new Error(`Word "${wordIdentifier}" not found for update.`);
  const sheetRowIndex = rowIndex + SHEET_START_ROW;
  const updateRange = `${SHEET_NAME}!A${sheetRowIndex}:${SHEET_COLUMN_RANGE.split(':')[1]}${sheetRowIndex}`;
  const updatedData = { ...wordData, version: (wordData.version || 0) + 1 };
  const values = [mapWordObjectToRow(updatedData)];
  await executeApiCall(
    window.gapi.client.sheets.spreadsheets.values.update,
    { spreadsheetId, range: updateRange, valueInputOption: 'USER_ENTERED', resource: { values } },
    'updateWord'
  );
  await db.put('words', { ...updatedData, word: wordIdentifier });
  return true;
};

export const deleteWord = async ({ spreadsheetId, executeApiCall, findWordRowIndex, updateWord, isOnline }, word) => {
  const db = await initDB();
  if (!isOnline) {
    await enqueueOfflineOperation({ type: 'delete', word });
    const existingWord = await db.get('words', word);
    if (existingWord) {
      await db.put('words', { ...existingWord, is_deleted: true, last_reviewed: getCurrentTimestampString(), version: (existingWord.version || 0) + 1 });
    }
    return true;
  }
  const rowIndex = await findWordRowIndex({ spreadsheetId, executeApiCall }, word);
  if (rowIndex === -1) throw new Error(`Word "${word}" not found for deletion.`);
  const sheetRowIndex = rowIndex + SHEET_START_ROW;
  const rangeToGet = `${SHEET_NAME}!A${sheetRowIndex}:${SHEET_COLUMN_RANGE.split(':')[1]}${sheetRowIndex}`;
  const result = await executeApiCall(
    window.gapi.client.sheets.spreadsheets.values.get,
    { spreadsheetId, range: rangeToGet },
    'deleteWord - get existing'
  );
  const rowData = result?.values?.[0];
  if (!rowData) throw new Error(`Could not get data for word "${word}" before deleting.`);
  const wordObject = mapRowToWordObject(rowData);
  wordObject.is_deleted = true;
  wordObject.last_reviewed = getCurrentTimestampString();
  wordObject.version = (wordObject.version || 0) + 1;
  await updateWord({ spreadsheetId, executeApiCall, findWordRowIndex, isOnline }, word, wordObject);
  return true;
};

export const addWords = async ({ spreadsheetId, executeApiCall, findWordRowIndex, isOnline }, wordsData) => {
  const db = await initDB();
  if (!wordsData || wordsData.length === 0) return null;
  const newWords = [];
  for (const wordData of wordsData) {
    const existingIndex = await findWordRowIndex({ spreadsheetId, executeApiCall }, wordData.word);
    if (existingIndex === -1) {
      newWords.push(wordData);
    }
  }
  if (newWords.length === 0) return null;
  if (!isOnline) {
    await enqueueOfflineOperation({ type: 'add', data: newWords });
    for (const wordData of newWords) {
      await db.put('words', { ...wordData, version: 0 });
    }
    return true;
  }
  const values = newWords.map(mapWordObjectToRow);
  const appendRange = `${SHEET_NAME}!A${SHEET_START_ROW}`;
  const result = await executeApiCall(
    window.gapi.client.sheets.spreadsheets.values.append,
    { spreadsheetId, range: appendRange, valueInputOption: 'USER_ENTERED', insertDataOption: 'INSERT_ROWS', resource: { values } },
    'addWords'
  );
  for (const wordData of newWords) {
    await db.put('words', { ...wordData, version: 0 });
  }
  return result;
};