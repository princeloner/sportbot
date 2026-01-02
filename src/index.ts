import dotenv from 'dotenv';
dotenv.config();

import { Telegraf } from 'telegraf';
import { connectDB } from './config/database';
import { startReminderService } from './services/reminderService';

// Handlers
import { handleStart } from './handlers/start';
import { handleBooking, handleDateSelection, handleTimeSelection } from './handlers/booking';
import { handleMyTrainings } from './handlers/myTrainings';
import { handleSchedule } from './handlers/schedule';
import { handleCancelBooking, handleCancelConfirm } from './handlers/cancel';
import { 
  handleAdminPanel, 
  handleStatistics, 
  handleClientsList,
  handleManageSchedule,
  handleListSlots,
  handleAllTrainings
} from './handlers/admin';
import { handleTutorials, handleTutorialStyle } from './handlers/tutorials';

import { mainKeyboard, adminKeyboard } from './utils/keyboards';
import User from './models/User';

const bot = new Telegraf(process.env.BOT_TOKEN!);

// Команды
bot.command('start', handleStart);

// Текстовые кнопки
bot.hears('📅 Записаться на тренировку', handleBooking);
bot.hears('📋 Мои тренировки', handleMyTrainings);
bot.hears('🕐 Расписание тренера', handleSchedule);
bot.hears('❌ Отменить запись', handleCancelBooking);
bot.hears('📚 Обучение', handleTutorials);
bot.hears('👨‍💼 Админ-панель', handleAdminPanel);
bot.hears('📊 Статистика', handleStatistics);
bot.hears('👥 Список клиентов', handleClientsList);
bot.hears('🕐 Управление графиком', handleManageSchedule);
bot.hears('📅 Все тренировки', handleAllTrainings);

bot.hears('⬅️ Назад', async (ctx) => {
  const user = await User.findOne({ telegramId: ctx.from.id });
  const keyboard = user?.isAdmin ? adminKeyboard() : mainKeyboard();
  await ctx.reply('Главное меню:', keyboard);
});

// Callback queries
bot.action(/^book_date_\d+$/, handleDateSelection);
bot.action(/^book_time_\d+_\d{2}:\d{2}$/, handleTimeSelection);
bot.action(/^cancel_training_/, handleCancelConfirm);
bot.action(/^tutorial_/, handleTutorialStyle);
bot.action('back_to_dates', handleBooking);
bot.action('list_slots', handleListSlots);
bot.action('cancel', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.deleteMessage();
});
bot.action('occupied', async (ctx) => {
  await ctx.answerCbQuery('Это время уже занято');
});

// Запуск
const start = async () => {
  try {
    await connectDB();
    startReminderService(bot);
    
    await bot.launch();
    console.log('🤖 Бот запущен!');

    // Graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
  } catch (error) {
    console.error('Ошибка запуска бота:', error);
    process.exit(1);
  }
};

start();
