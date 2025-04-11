import { format } from 'date-fns';

export const getTodayDateString = () => format(new Date(), 'yyyy-MM-dd');
export const getCurrentTimestampString = () => format(new Date(), 'yyyy-MM-dd HH:mm:ss');

export const shuffleArray = (array) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

export const safeJsonParse = (jsonString, defaultValue = null) => {
  if (!jsonString || typeof jsonString !== 'string' || jsonString.trim() === '') return defaultValue;
  try {
    if (jsonString.startsWith('[') || jsonString.startsWith('{')) {
      return JSON.parse(jsonString);
    }
    return defaultValue;
  } catch (e) {
    return defaultValue;
  }
};