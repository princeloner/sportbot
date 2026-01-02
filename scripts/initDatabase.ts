import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import TimeSlot from '../src/models/TimeSlot';

const initDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Подключено к MongoDB');

    // Очистка существующих слотов (опционально)
    // await TimeSlot.deleteMany({});

    // Создание примерных временных слотов
    const slots = [
      // Понедельник
      { dayOfWeek: 1, startTime: '09:00', endTime: '10:00', isActive: true, maxClients: 1 },
      { dayOfWeek: 1, startTime: '10:00', endTime: '11:00', isActive: true, maxClients: 1 },
      { dayOfWeek: 1, startTime: '18:00', endTime: '19:00', isActive: true, maxClients: 1 },
      
      // Среда
      { dayOfWeek: 3, startTime: '09:00', endTime: '10:00', isActive: true, maxClients: 1 },
      { dayOfWeek: 3, startTime: '10:00', endTime: '11:00', isActive: true, maxClients: 1 },
      { dayOfWeek: 3, startTime: '18:00', endTime: '19:00', isActive: true, maxClients: 1 },
      
      // Пятница
      { dayOfWeek: 5, startTime: '09:00', endTime: '10:00', isActive: true, maxClients: 1 },
      { dayOfWeek: 5, startTime: '10:00', endTime: '11:00', isActive: true, maxClients: 1 },
      { dayOfWeek: 5, startTime: '18:00', endTime: '19:00', isActive: true, maxClients: 1 },
    ];

    for (const slot of slots) {
      const existing = await TimeSlot.findOne({
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime
      });

      if (!existing) {
        await TimeSlot.create(slot);
        console.log(`✅ Создан слот: ${getDayName(slot.dayOfWeek)} ${slot.startTime}-${slot.endTime}`);
      } else {
        console.log(`⏭️  Слот уже существует: ${getDayName(slot.dayOfWeek)} ${slot.startTime}-${slot.endTime}`);
      }
    }

    console.log('\n✅ База данных инициализирована!');
    console.log(`📊 Всего слотов: ${await TimeSlot.countDocuments()}`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка инициализации:', error);
    process.exit(1);
  }
};

const getDayName = (day: number): string => {
  const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  return days[day];
};

initDatabase();
