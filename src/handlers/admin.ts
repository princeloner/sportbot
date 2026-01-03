import { Context } from 'telegraf';
import { Markup } from 'telegraf';
import Training from '../models/Training';
import User from '../models/User';
import TimeSlot from '../models/TimeSlot';
import { formatDate, getDayName } from '../utils/helpers';
import { adminPanelKeyboard } from '../utils/keyboards';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export const handleAdminPanel = async (ctx: Context) => {
  try {
    const user = await User.findOne({ telegramId: ctx.from!.id });
    
    if (!user || !user.isAdmin) {
      await ctx.reply('У вас нет доступа к админ-панели.');
      return;
    }

    await ctx.reply(
      '👨‍💼 Админ-панель\n\nВыберите действие:',
      adminPanelKeyboard()
    );
  } catch (error) {
    console.error('Ошибка в handleAdminPanel:', error);
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
};
///
export const handleStatistics = async (ctx: Context) => {
  try {
    const user = await User.findOne({ telegramId: ctx.from!.id });
    if (!user || !user.isAdmin) return;

    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const totalClients = await User.countDocuments({ isAdmin: false });
    
    const weekTrainings = await Training.countDocuments({
      date: { $gte: weekStart, $lte: weekEnd },
      status: 'completed'
    });

    const monthTrainings = await Training.countDocuments({
      date: { $gte: monthStart, $lte: monthEnd },
      status: 'completed'
    });

    const scheduledTrainings = await Training.countDocuments({
      date: { $gte: now },
      status: 'scheduled'
    });

    const cancelledThisMonth = await Training.countDocuments({
      date: { $gte: monthStart, $lte: monthEnd },
      status: 'cancelled'
    });

    const message = `
📊 Статистика:

👥 Всего клиентов: ${totalClients}
📅 Запланировано тренировок: ${scheduledTrainings}

📈 За эту неделю:
   ✅ Проведено: ${weekTrainings}

📈 За этот месяц:
   ✅ Проведено: ${monthTrainings}
   ❌ Отменено: ${cancelledThisMonth}
    `.trim();

    await ctx.reply(message);
  } catch (error) {
    console.error('Ошибка в handleStatistics:', error);
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
};

export const handleClientsList = async (ctx: Context) => {
  try {
    const user = await User.findOne({ telegramId: ctx.from!.id });
    if (!user || !user.isAdmin) return;

    const clients = await User.find({ isAdmin: false }).sort({ createdAt: -1 });

    if (clients.length === 0) {
      await ctx.reply('Пока нет зарегистрированных клиентов.');
      return;
    }

    let message = '👥 Список клиентов:\n\n';
    
    for (const client of clients) {
      const trainingsCount = await Training.countDocuments({
        clientId: client._id,
        status: 'completed'
      });

      message += `👤 ${client.firstName} ${client.lastName || ''}\n`;
      message += `   @${client.username || 'нет username'}\n`;
      message += `   📊 Тренировок: ${trainingsCount}\n\n`;
    }

    await ctx.reply(message);
  } catch (error) {
    console.error('Ошибка в handleClientsList:', error);
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
};

export const handleManageSchedule = async (ctx: Context) => {
  try {
    const user = await User.findOne({ telegramId: ctx.from!.id });
    if (!user || !user.isAdmin) return;

    const buttons = [
      [Markup.button.callback('➕ Добавить слот', 'add_slot')],
      [Markup.button.callback('📋 Список слотов', 'list_slots')],
      [Markup.button.callback('⬅️ Назад', 'back_admin')]
    ];

    await ctx.reply(
      '🕐 Управление графиком:',
      Markup.inlineKeyboard(buttons)
    );
  } catch (error) {
    console.error('Ошибка в handleManageSchedule:', error);
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
};

export const handleListSlots = async (ctx: Context) => {
  try {
    const slots = await TimeSlot.find().sort({ dayOfWeek: 1, startTime: 1 });

    if (slots.length === 0) {
      await ctx.answerCbQuery();
      await ctx.reply('Слоты не настроены.');
      return;
    }

    let message = '📋 Временные слоты:\n\n';
    let currentDay = -1;

    for (const slot of slots) {
      if (slot.dayOfWeek !== currentDay) {
        currentDay = slot.dayOfWeek;
        message += `\n📅 ${getDayName(slot.dayOfWeek)}:\n`;
      }
      const status = slot.isActive ? '✅' : '❌';
      message += `   ${status} ${slot.startTime} - ${slot.endTime} (макс: ${slot.maxClients})\n`;
    }

    await ctx.answerCbQuery();
    await ctx.reply(message);
  } catch (error) {
    console.error('Ошибка в handleListSlots:', error);
    await ctx.answerCbQuery('Произошла ошибка');
  }
};

export const handleAllTrainings = async (ctx: Context) => {
  try {
    const user = await User.findOne({ telegramId: ctx.from!.id });
    if (!user || !user.isAdmin) return;

    const trainings = await Training.find({
      date: { $gte: new Date() },
      status: 'scheduled'
    })
    .populate('clientId')
    .sort({ date: 1 })
    .limit(20);

    if (trainings.length === 0) {
      await ctx.reply('Нет запланированных тренировок.');
      return;
    }

    let message = '📅 Предстоящие тренировки:\n\n';
    
    trainings.forEach((training: any, index) => {
      const client = training.clientId;
      message += `${index + 1}. ${formatDate(training.date)}\n`;
      message += `   👤 ${client.firstName} ${client.lastName || ''}\n`;
      message += `   @${client.username || 'нет username'}\n\n`;
    });

    await ctx.reply(message);
  } catch (error) {
    console.error('Ошибка в handleAllTrainings:', error);
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
};
