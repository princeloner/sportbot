import { Context } from 'telegraf';
import User from '../models/User';
import { mainKeyboard, adminKeyboard } from '../utils/keyboards';
import { isAdmin } from '../utils/helpers';

export const handleStart = async (ctx: Context) => {
  try {
    const telegramId = ctx.from!.id;
    const firstName = ctx.from!.first_name;
    const lastName = ctx.from!.last_name;
    const username = ctx.from!.username;

    let user = await User.findOne({ telegramId });

    if (!user) {
      user = await User.create({
        telegramId,
        firstName,
        lastName,
        username,
        isAdmin: isAdmin(telegramId)
      });
    } else {
      // Обновляем информацию существующего пользователя
      user.firstName = firstName;
      user.lastName = lastName;
      user.username = username;
      user.isAdmin = isAdmin(telegramId);
      await user.save();
    }

    const welcomeMessage = `
👋 Привет, ${firstName}!

Добро пожаловать в бот для записи на тренировки по плаванию! 🏊‍♂️

Здесь вы можете:
📅 Записаться на тренировку
📋 Посмотреть свои тренировки
🕐 Узнать расписание тренера
❌ Отменить запись

Вы будете получать напоминания за час до тренировки! ⏰
    `.trim();

    const keyboard = user.isAdmin ? adminKeyboard() : mainKeyboard();
    await ctx.reply(welcomeMessage, keyboard);
  } catch (error) {
    console.error('Ошибка в handleStart:', error);
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
};
