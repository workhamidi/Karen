import { format } from 'date-fns';

export const getTodayDateString = () => format(new Date(), 'yyyy-MM-dd');
export const getCurrentTimestampString = () => format(new Date(), 'yyyy-MM-dd HH:mm:ss');