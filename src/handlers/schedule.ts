import { Context } from 'telegraf';
import TimeSlot from '../models/TimeSlot';
import { getDayName } from '../utils/helpers';

export const handleSchedule = async (ctx: Context) => {
  try {
    const timeSlots = await TimeSlot.find({ isActive: true }).sort({ 
      dayOfWeek: 1, 
      startTime: 1 
    });

    if (timeSlots.length === 0) {
      await ctx.reply('Расписание пока не установлено.');
      return;
    }

    let message = '🕐 Расписание тренера:\n\n';
    let currentDay = -1;

    timeSlots.forEach(slot => {
      if (slot.dayOfWeek !== currentDay) {
        currentDay = slot.dayOfWeek;
        message += `\n📅 ${getDayName(slot.dayOfWeek)}:\n`;
      }
      message += `   ⏰ ${slot.startTime} - ${slot.endTime}\n`;
    });

    await ctx.reply(message);
  } catch (error) {
    console.error('Ошибка в handleSchedule:', error);
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
};
