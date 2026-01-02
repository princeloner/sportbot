import { Context } from 'telegraf';
import { Markup } from 'telegraf';
import Training from '../models/Training';
import TimeSlot from '../models/TimeSlot';
import User from '../models/User';
import { formatDate, getNextWeekDates, getDayName } from '../utils/helpers';
import { addDays, setHours, setMinutes, startOfDay } from 'date-fns';

export const handleBooking = async (ctx: Context) => {
  try {
    const dates = getNextWeekDates();
    const buttons = dates.map((date, index) => {
      const dayName = getDayName(date.getDay());
      const dateStr = formatDate(date).split(',')[0];
      return [Markup.button.callback(`${dayName} - ${dateStr}`, `book_date_${index}`)];
    });

    buttons.push([Markup.button.callback('❌ Отмена', 'cancel')]);

    await ctx.reply(
      '📅 Выберите день для тренировки:',
      Markup.inlineKeyboard(buttons)
    );
  } catch (error) {
    console.error('Ошибка в handleBooking:', error);
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
};

export const handleDateSelection = async (ctx: Context) => {
  try {
    const callbackData = (ctx.callbackQuery as any).data;
    const dateIndex = parseInt(callbackData.split('_')[2]);
    const selectedDate = addDays(new Date(), dateIndex);
    const dayOfWeek = selectedDate.getDay();

    const timeSlots = await TimeSlot.find({ 
      dayOfWeek, 
      isActive: true 
    }).sort({ startTime: 1 });

    if (timeSlots.length === 0) {
      await ctx.answerCbQuery();
      await ctx.reply('К сожалению, на этот день нет доступных слотов.');
      return;
    }

    const buttons = [];
    for (const slot of timeSlots) {
      const [hours, minutes] = slot.startTime.split(':').map(Number);
      const slotDate = setMinutes(setHours(startOfDay(selectedDate), hours), minutes);
      
      const existingTrainings = await Training.countDocuments({
        date: slotDate,
        status: { $in: ['scheduled', 'completed'] }
      });

      if (existingTrainings < slot.maxClients) {
        buttons.push([
          Markup.button.callback(
            `${slot.startTime} - ${slot.endTime} ✅`,
            `book_time_${dateIndex}_${slot.startTime}`
          )
        ]);
      } else {
        buttons.push([
          Markup.button.callback(
            `${slot.startTime} - ${slot.endTime} ❌ Занято`,
            'occupied'
          )
        ]);
      }
    }

    buttons.push([Markup.button.callback('⬅️ Назад', 'back_to_dates')]);

    await ctx.answerCbQuery();
    await ctx.editMessageText(
      `Выберите время на ${formatDate(selectedDate).split(',')[0]}:`,
      Markup.inlineKeyboard(buttons)
    );
  } catch (error) {
    console.error('Ошибка в handleDateSelection:', error);
    await ctx.answerCbQuery('Произошла ошибка');
  }
};

export const handleTimeSelection = async (ctx: Context) => {
  try {
    const callbackData = (ctx.callbackQuery as any).data;
    const parts = callbackData.split('_');
    const dateIndex = parseInt(parts[2]);
    const timeStr = parts[3];

    const selectedDate = addDays(new Date(), dateIndex);
    const [hours, minutes] = timeStr.split(':').map(Number);
    const trainingDate = setMinutes(setHours(startOfDay(selectedDate), hours), minutes);

    const user = await User.findOne({ telegramId: ctx.from!.id });
    if (!user) {
      await ctx.answerCbQuery('Пользователь не найден');
      return;
    }

    const existingTraining = await Training.findOne({
      clientId: user._id,
      date: trainingDate,
      status: 'scheduled'
    });

    if (existingTraining) {
      await ctx.answerCbQuery('Вы уже записаны на это время!');
      return;
    }

    await Training.create({
      clientId: user._id,
      date: trainingDate,
      status: 'scheduled'
    });

    await ctx.answerCbQuery('✅ Вы успешно записаны!');
    await ctx.editMessageText(
      `✅ Отлично! Вы записаны на тренировку:\n\n📅 ${formatDate(trainingDate)}\n\n⏰ Вы получите напоминание за час до тренировки!`
    );
  } catch (error) {
    console.error('Ошибка в handleTimeSelection:', error);
    await ctx.answerCbQuery('Произошла ошибка');
  }
};
