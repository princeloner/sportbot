import { Context } from 'telegraf';
import { Markup } from 'telegraf';
import Tutorial from '../models/Tutorial';
import fs from 'fs';
import path from 'path';

const STYLES = {
  butterfly: { name: '🦋 Баттерфляй', emoji: '🦋' },
  freestyle: { name: '🏊 Вольный стиль', emoji: '🏊' },
  backstroke: { name: '🔙 На спине', emoji: '🔙' },
  breaststroke: { name: '🐸 Брасс', emoji: '🐸' },
  general: { name: '📖 Общие советы', emoji: '📖' }
};

export const handleTutorials = async (ctx: Context) => {
  try {
    const buttons = [
      [Markup.button.callback('🦋 Баттерфляй', 'tutorial_butterfly')],
      [Markup.button.callback('🏊 Вольный стиль', 'tutorial_freestyle')],
      [Markup.button.callback('🔙 На спине', 'tutorial_backstroke')],
      [Markup.button.callback('🐸 Брасс', 'tutorial_breaststroke')],
      [Markup.button.callback('📖 Общие советы', 'tutorial_general')],
      [Markup.button.callback('❌ Закрыть', 'cancel')]
    ];

    await ctx.reply(
      '📚 Обучающие материалы\n\nВыберите стиль плавания:',
      Markup.inlineKeyboard(buttons)
    );
  } catch (error) {
    console.error('Ошибка в handleTutorials:', error);
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
};

export const handleTutorialStyle = async (ctx: Context) => {
  try {
    const callbackData = (ctx.callbackQuery as any).data;
    const style = callbackData.split('_')[1];

    await ctx.answerCbQuery();

    const tutorials = await Tutorial.find({ 
      style, 
      isActive: true 
    }).sort({ order: 1 });

    if (tutorials.length === 0) {
      await ctx.reply(
        `${STYLES[style as keyof typeof STYLES].emoji} Материалы по стилю "${STYLES[style as keyof typeof STYLES].name}" скоро появятся!`
      );
      return;
    }

    await ctx.editMessageText(
      `${STYLES[style as keyof typeof STYLES].emoji} ${STYLES[style as keyof typeof STYLES].name}\n\nОтправляю материалы...`
    );

    for (const tutorial of tutorials) {
      await sendTutorial(ctx, tutorial);
      // Небольшая задержка между сообщениями
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    await ctx.reply(
      '✅ Все материалы отправлены!\n\nЕсли есть вопросы - пишите тренеру! 💪'
    );
  } catch (error) {
    console.error('Ошибка в handleTutorialStyle:', error);
    await ctx.answerCbQuery('Произошла ошибка');
  }
};

const sendTutorial = async (ctx: Context, tutorial: ITutorial) => {
  try {
    // Отправляем фото если есть
    if (tutorial.photoPath || tutorial.photoUrl) {
      let photoSource: any;
      
      if (tutorial.photoPath) {
        // Локальный файл
        const fullPath = path.resolve(process.cwd(), tutorial.photoPath);
        if (fs.existsSync(fullPath)) {
          photoSource = { source: fs.createReadStream(fullPath) };
        } else {
          console.error(`Файл не найден: ${fullPath}`);
          photoSource = tutorial.photoUrl ? { url: tutorial.photoUrl } : null;
        }
      } else {
        // URL или File ID
        photoSource = tutorial.photoUrl!;
      }

      if (photoSource) {
        await ctx.replyWithPhoto(photoSource, {
          caption: `${tutorial.title}\n\n${tutorial.description}`
        });
      }
    }

    // Отправляем голосовое если есть
    if (tutorial.voicePath || tutorial.voiceUrl) {
      let voiceSource: any;
      
      if (tutorial.voicePath) {
        const fullPath = path.resolve(process.cwd(), tutorial.voicePath);
        if (fs.existsSync(fullPath)) {
          voiceSource = { source: fs.createReadStream(fullPath) };
        } else {
          console.error(`Файл не найден: ${fullPath}`);
          voiceSource = tutorial.voiceUrl ? { url: tutorial.voiceUrl } : null;
        }
      } else {
        voiceSource = tutorial.voiceUrl!;
      }

      if (voiceSource) {
        await ctx.replyWithVoice(voiceSource, {
          caption: `🎤 Голосовое объяснение: ${tutorial.title}`
        });
      }
    }

    // Отправляем видео если есть
    if (tutorial.videoPath || tutorial.videoUrl) {
      let videoSource: any;
      
      if (tutorial.videoPath) {
        const fullPath = path.resolve(process.cwd(), tutorial.videoPath);
        if (fs.existsSync(fullPath)) {
          videoSource = { source: fs.createReadStream(fullPath) };
        } else {
          console.error(`Файл не найден: ${fullPath}`);
          videoSource = tutorial.videoUrl ? { url: tutorial.videoUrl } : null;
        }
      } else {
        videoSource = tutorial.videoUrl!;
      }

      if (videoSource) {
        await ctx.replyWithVideo(videoSource, {
          caption: `🎥 Видео: ${tutorial.title}`
        });
      }
    }

    // Если нет медиа, отправляем текст
    if (!tutorial.photoPath && !tutorial.photoUrl && 
        !tutorial.voicePath && !tutorial.voiceUrl &&
        !tutorial.videoPath && !tutorial.videoUrl) {
      await ctx.reply(`📝 ${tutorial.title}\n\n${tutorial.description}`);
    }
  } catch (error) {
    console.error('Ошибка отправки материала:', error);
    await ctx.reply(`❌ Ошибка при отправке материала "${tutorial.title}"`);
  }
};

// Админ функции для управления материалами
export const handleAddTutorial = async (ctx: Context, tutorialData: Partial<ITutorial>) => {
  try {
    const tutorial = await Tutorial.create(tutorialData);
    return tutorial;
  } catch (error) {
    console.error('Ошибка создания материала:', error);
    throw error;
  }
};

export const handleUpdateTutorial = async (ctx: Context, tutorialId: string, updates: Partial<ITutorial>) => {
  try {
    const tutorial = await Tutorial.findByIdAndUpdate(
      tutorialId,
      updates,
      { new: true }
    );
    return tutorial;
  } catch (error) {
    console.error('Ошибка обновления материала:', error);
    throw error;
  }
};

export const handleDeleteTutorial = async (ctx: Context, tutorialId: string) => {
  try {
    await Tutorial.findByIdAndDelete(tutorialId);
  } catch (error) {
    console.error('Ошибка удаления материала:', error);
    throw error;
  }
};
