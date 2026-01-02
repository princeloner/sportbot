import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

const fixDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Подключено к MongoDB');

    const db = mongoose.connection.db;
    
    if (!db) {
      throw new Error('База данных не подключена');
    }
    
    // Удаляем проблемный индекс username_1 из коллекции users
    try {
      await db.collection('users').dropIndex('username_1');
      console.log('✅ Удален индекс username_1');
    } catch (error: any) {
      if (error.code === 27) {
        console.log('ℹ️  Индекс username_1 не найден (это нормально)');
      } else {
        console.log('⚠️  Ошибка при удалении индекса:', error.message);
      }
    }

    // Показываем текущие индексы
    const indexes = await db.collection('users').indexes();
    console.log('\n📋 Текущие индексы в коллекции users:');
    indexes.forEach(index => {
      console.log(`   - ${index.name}:`, JSON.stringify(index.key));
    });

    console.log('\n✅ База данных исправлена!');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
};

fixDatabase();
