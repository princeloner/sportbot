import { Context } from 'telegraf';
import { Markup } from 'telegraf';
import Training from '../models/Training';
import User from '../models/User';
import { formatDate } from '../utils/helpers';

export const handleMyTrainings = async (ctx: Context) => {
  try {
    const user = await User.findOne({ telegramId: ctx.from!.id });
    if (!user) {
      await ctx.reply('Пользователь не найден');
      return;
    }

    const trainings = await Training.find({
      clientId: user._id,
      date: { $gte: new Date() },
      status: 'scheduled'
    }).sort({ date: 1 }).limit(10);

    if (trainings.length === 0) {
      await ctx.reply('У вас пока нет запланированных тренировок.');
      return;
    }

    let message = '📋 Ваши предстоящие тренировки:\n\n';
    trainings.forEach((training, index) => {
      message += `${index + 1}. 📅 ${formatDate(training.date)}\n`;
    });

    await ctx.reply(message);
  } catch (error) {
    console.error('Ошибка в handleMyTrainings:', error);
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
};
