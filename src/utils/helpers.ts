import { format, addDays, startOfWeek, isBefore, addHours } from 'date-fns';
import { ru } from 'date-fns/locale';

export const formatDate = (date: Date): string => {
  return format(date, 'dd MMMM yyyy, HH:mm', { locale: ru });
};

export const formatTime = (date: Date): string => {
  return format(date, 'HH:mm');
};

export const getDayName = (dayOfWeek: number): string => {
  const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  return days[dayOfWeek];
};

export const getNextWeekDates = (): Date[] => {
  const dates: Date[] = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    dates.push(addDays(today, i));
  }
  
  return dates;
};

export const isAdmin = (userId: number): boolean => {
  const adminIds = process.env.ADMIN_IDS?.split(',').map(id => parseInt(id.trim())) || [];
  return adminIds.includes(userId);
};

export const shouldSendReminder = (trainingDate: Date): boolean => {
  const now = new Date();
  const oneHourBefore = addHours(trainingDate, -1);
  const fiveMinutesAfter = addHours(oneHourBefore, 0.083); // 5 минут
  
  return now >= oneHourBefore && now <= fiveMinutesAfter;
};
