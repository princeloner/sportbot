import { Context } from 'telegraf';
import { Markup } from 'telegraf';
import Training from '../models/Training';
import User from '../models/User';
import { formatDate } from '../utils/helpers';

export const handleCancelBooking = async (ctx: Context) => {
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
    }).sort({ date: 1 });

    if (trainings.length === 0) {
      await ctx.reply('У вас нет запланированных тренировок для отмены.');
      return;
    }

    const buttons = trainings.map(training => [
      Markup.button.callback(
        `${formatDate(training.date)}`,
        `cancel_training_${training._id}`
      )
    ]);

    buttons.push([Markup.button.callback('❌ Отмена', 'cancel')]);

    await ctx.reply(
      '❌ Выберите тренировку для отмены:',
      Markup.inlineKeyboard(buttons)
    );
  } catch (error) {
    console.error('Ошибка в handleCancelBooking:', error);
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
};

export const handleCancelConfirm = async (ctx: Context) => {
  try {
    const callbackData = (ctx.callbackQuery as any).data;
    const trainingId = callbackData.split('_')[2];

    const training = await Training.findById(trainingId);
    if (!training) {
      await ctx.answerCbQuery('Тренировка не найдена');
      return;
    }

    training.status = 'cancelled';
    await training.save();

    await ctx.answerCbQuery('✅ Тренировка отменена');
    await ctx.editMessageText(
      `✅ Тренировка на ${formatDate(training.date)} успешно отменена.`
    );
  } catch (error) {
    console.error('Ошибка в handleCancelConfirm:', error);
    await ctx.answerCbQuery('Произошла ошибка');
  }
};
