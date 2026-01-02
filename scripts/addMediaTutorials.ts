import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Tutorial from '../src/models/Tutorial';
import fs from 'fs';
import path from 'path';

const scanMediaFolder = () => {
  const mediaPath = path.resolve(process.cwd(), 'media');
  const photos = path.join(mediaPath, 'photos');
  const voices = path.join(mediaPath, 'voices');
  const videos = path.join(mediaPath, 'videos');

  const result: any = {
    photos: [],
    voices: [],
    videos: []
  };

  // Сканируем фото
  if (fs.existsSync(photos)) {
    result.photos = fs.readdirSync(photos)
      .filter(f => !f.startsWith('.'))
      .map(f => path.join('media', 'photos', f));
  }

  // Сканируем голосовые
  if (fs.existsSync(voices)) {
    result.voices = fs.readdirSync(voices)
      .filter(f => !f.startsWith('.'))
      .map(f => path.join('media', 'voices', f));
  }

  // Сканируем видео
  if (fs.existsSync(videos)) {
    result.videos = fs.readdirSync(videos)
      .filter(f => !f.startsWith('.'))
      .map(f => path.join('media', 'videos', f));
  }

  return result;
};

const addMediaTutorials = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Подключено к MongoDB');

    const media = scanMediaFolder();
    
    console.log('\n📁 Найденные файлы:');
    console.log(`📸 Фото: ${media.photos.length}`);
    media.photos.forEach((p: string) => console.log(`   - ${p}`));
    console.log(`🎤 Голосовые: ${media.voices.length}`);
    media.voices.forEach((v: string) => console.log(`   - ${v}`));
    console.log(`🎥 Видео: ${media.videos.length}`);
    media.videos.forEach((v: string) => console.log(`   - ${v}`));

    // Материалы с медиа-файлами
    const tutorials = [
      // Баттерфляй с медиа
      {
        style: 'butterfly',
        title: 'Техника баттерфляя для начинающих',
        description: '🦋 Основы техники плавания баттерфляем:\n\n1. Волнообразное движение тела\n2. Синхронная работа рук\n3. Правильное дыхание\n4. Координация движений\n\n💪 Важно: начинайте с коротких дистанций!\n\n👇 Смотрите фото, слушайте объяснение и смотрите видео-демонстрацию!',
        photoPath: media.photos.find((p: string) => p.includes('butterfly')) || undefined,
        voicePath: media.voices.find((v: string) => v.includes('butterfly')) || undefined,
        videoPath: media.videos.find((v: string) => v.includes('butterfly')) || undefined,
        order: 1,
        isActive: true
      },
      {
        style: 'butterfly',
        title: 'Упражнения для баттерфляя',
        description: '🏊‍♂️ Подготовительные упражнения:\n\n• Волна на груди с доской\n• Работа ног у бортика\n• Одна рука баттерфляй\n• Дельфин под водой\n\n📝 Выполняйте каждое упражнение 4x25 метров',
        order: 2,
        isActive: true
      },

      // Вольный стиль
      {
        style: 'freestyle',
        title: 'Техника вольного стиля',
        description: '🏊 Основы кроля:\n\n1. Положение тела - горизонтально\n2. Гребок - от плеча до бедра\n3. Дыхание - в сторону\n4. Работа ног - от бедра\n\n⚡ Самый быстрый и эффективный стиль!',
        photoPath: media.photos.find((p: string) => p.includes('freestyle')) || undefined,
        voicePath: media.voices.find((v: string) => v.includes('freestyle')) || undefined,
        videoPath: media.videos.find((v: string) => v.includes('freestyle')) || undefined,
        order: 1,
        isActive: true
      },
      {
        style: 'freestyle',
        title: 'Дыхание в кроле',
        description: '💨 Правильное дыхание:\n\n• Выдох в воду\n• Вдох в сторону\n• Голова следует за телом\n• Ритм: 3-5-7 гребков\n\n⚠️ Не поднимайте голову вверх!',
        order: 2,
        isActive: true
      },

      // На спине
      {
        style: 'backstroke',
        title: 'Плавание на спине',
        description: '🔙 Техника кроля на спине:\n\n1. Тело на поверхности\n2. Взгляд вверх-назад\n3. Гребок прямой рукой\n4. Непрерывная работа ног\n\n😌 Отличный стиль для отдыха!',
        photoPath: media.photos.find((p: string) => p.includes('backstroke')) || undefined,
        voicePath: media.voices.find((v: string) => v.includes('backstroke')) || undefined,
        videoPath: media.videos.find((v: string) => v.includes('backstroke')) || undefined,
        order: 1,
        isActive: true
      },

      // Брасс
      {
        style: 'breaststroke',
        title: 'Техника брасса',
        description: '🐸 Основы брасса:\n\n1. Гребок руками - в стороны\n2. Толчок ногами - лягушкой\n3. Скольжение после толчка\n4. Дыхание - на каждый цикл\n\n🎯 Самый медленный, но технически сложный стиль!',
        photoPath: media.photos.find((p: string) => p.includes('breaststroke') || p.includes('brass')) || undefined,
        voicePath: media.voices.find((v: string) => v.includes('breaststroke') || v.includes('brass')) || undefined,
        videoPath: media.videos.find((v: string) => v.includes('breaststroke') || v.includes('brass')) || undefined,
        order: 1,
        isActive: true
      },
      {
        style: 'breaststroke',
        title: 'Работа ног в брассе',
        description: '🦵 Правильный толчок:\n\n• Подтянуть пятки к ягодицам\n• Развернуть стопы наружу\n• Толчок в стороны-назад\n• Соединить ноги\n\n⭐ Самая важная часть брасса!',
        order: 2,
        isActive: true
      },

      // Общие советы
      {
        style: 'general',
        title: 'Разминка перед плаванием',
        description: '🔥 Обязательная разминка:\n\n1. Вращения руками - 10 раз\n2. Наклоны в стороны - 10 раз\n3. Приседания - 15 раз\n4. Растяжка плеч\n5. Растяжка ног\n\n✅ Разминка предотвращает травмы!',
        photoPath: media.photos.find((p: string) => p.includes('warmup') || p.includes('warm-up')) || undefined,
        order: 1,
        isActive: true
      },
      {
        style: 'general',
        title: 'Правила безопасности',
        description: '⚠️ Важные правила:\n\n🚫 Не плавайте сразу после еды\n🚫 Не ныряйте в незнакомых местах\n❤️ Следите за самочувствием\n💧 Пейте воду до и после\n🥽 Используйте шапочку и очки\n\n🛡️ Безопасность превыше всего!',
        order: 2,
        isActive: true
      }
    ];

    console.log('\n📝 Добавление материалов...\n');

    for (const tutorial of tutorials) {
      const existing = await Tutorial.findOne({
        style: tutorial.style,
        title: tutorial.title
      });

      if (!existing) {
        await Tutorial.create(tutorial);
        const mediaInfo = [];
        if (tutorial.photoPath) mediaInfo.push('📸 фото');
        if (tutorial.voicePath) mediaInfo.push('🎤 голосовое');
        if (tutorial.videoPath) mediaInfo.push('🎥 видео');
        const mediaStr = mediaInfo.length > 0 ? ` [${mediaInfo.join(', ')}]` : '';
        console.log(`✅ Добавлен: ${tutorial.title}${mediaStr}`);
      } else {
        // Обновляем существующий материал с новыми путями к медиа
        const updates: any = {};
        if (tutorial.photoPath) updates.photoPath = tutorial.photoPath;
        if (tutorial.voicePath) updates.voicePath = tutorial.voicePath;
        if (tutorial.videoPath) updates.videoPath = tutorial.videoPath;
        
        if (Object.keys(updates).length > 0) {
          await Tutorial.updateOne(
            { style: tutorial.style, title: tutorial.title },
            { $set: updates }
          );
          console.log(`🔄 Обновлен: ${tutorial.title}`);
        } else {
          console.log(`⏭️  Уже существует: ${tutorial.title}`);
        }
      }
    }

    console.log('\n✅ Обучающие материалы добавлены!');
    console.log(`📊 Всего материалов в базе: ${await Tutorial.countDocuments()}`);
    
    // Показываем статистику по медиа
    const withPhoto = await Tutorial.countDocuments({ photoPath: { $exists: true, $ne: null } });
    const withVoice = await Tutorial.countDocuments({ voicePath: { $exists: true, $ne: null } });
    const withVideo = await Tutorial.countDocuments({ videoPath: { $exists: true, $ne: null } });
    
    console.log('\n📊 Статистика медиа:');
    console.log(`📸 С фото: ${withPhoto}`);
    console.log(`🎤 С голосовыми: ${withVoice}`);
    console.log(`🎥 С видео: ${withVideo}`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
};

addMediaTutorials();
