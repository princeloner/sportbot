import cron from 'node-cron';
import Training from '../models/Training';
import User from '../models/User';
import { Telegraf } from 'telegraf';
import { formatDate } from '../utils/helpers';
import { addHours } from 'date-fns';

export const startReminderService = (bot: Telegraf) => {
  // Проверка каждые 5 минут
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();
      const oneHourLater = addHours(now, 1);
      const oneHourFiveMinLater = addHours(now, 1.083); // +5 минут

      const trainings = await Training.find({
        date: { 
          $gte: oneHourLater, 
          $lte: oneHourFiveMinLater 
        },
        status: 'scheduled',
        reminderSent: false
      }).populate('clientId');

      for (const training of trainings) {
        const client = training.clientId as any;
        
        if (client && client.notificationsEnabled) {
          try {
            await bot.telegram.sendMessage(
              client.telegramId,
              `⏰ Напоминание!\n\n🏊‍♂️ Через час у вас тренировка!\n\n📅 ${formatDate(training.date)}\n\nНе забудьте взять с собой все необходимое! 💪`
            );

            training.reminderSent = true;
            await training.save();

            console.log(`Напоминание отправлено клиенту ${client.firstName}`);
          } catch (error) {
            console.error(`Ошибка отправки напоминания клиенту ${client.telegramId}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Ошибка в reminderService:', error);
    }
  });

  console.log('✅ Сервис напоминаний запущен');
};
