# 🛡️ Лучшие практики и рекомендации

## 🔐 Безопасность

### 1. Защита токенов и ключей

**❌ Плохо:**
```typescript
const bot = new Telegraf('123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11');
```

**✅ Хорошо:**
```typescript
import dotenv from 'dotenv';
dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN!);
```

### 2. Валидация входных данных

**❌ Плохо:**
```typescript
const userId = ctx.from.id;
await User.findOne({ telegramId: userId });
```

**✅ Хорошо:**
```typescript
if (!ctx.from || !ctx.from.id) {
  return ctx.reply('Ошибка: пользователь не определен');
}

const userId = ctx.from.id;
if (typeof userId !== 'number' || userId <= 0) {
  return ctx.reply('Некорректный ID пользователя');
}

await User.findOne({ telegramId: userId });
```

### 3. Проверка прав доступа

**❌ Плохо:**
```typescript
bot.hears('Админ-панель', async (ctx) => {
  // Показать админ-панель всем
});
```

**✅ Хорошо:**
```typescript
bot.hears('Админ-панель', async (ctx) => {
  const user = await User.findOne({ telegramId: ctx.from.id });
  
  if (!user || !user.isAdmin) {
    return ctx.reply('У вас нет доступа к админ-панели.');
  }
  
  // Показать админ-панель
});
```

### 4. Защита от SQL/NoSQL инъекций

**❌ Плохо:**
```typescript
const query = `db.users.find({ username: "${username}" })`;
eval(query);
```

**✅ Хорошо:**
```typescript
// Mongoose автоматически защищает от инъекций
await User.findOne({ username: username });
```

### 5. Rate Limiting

```typescript
import rateLimit from 'telegraf-ratelimit';

const limitConfig = {
  window: 3000,  // 3 секунды
  limit: 1,      // 1 сообщение
  onLimitExceeded: (ctx) => ctx.reply('Слишком много запросов. Подождите.')
};

bot.use(rateLimit(limitConfig));
```

---

## ⚡ Производительность

### 1. Индексы в MongoDB

**❌ Плохо:**
```typescript
// Без индексов
const trainings = await Training.find({ clientId: userId });
```

**✅ Хорошо:**
```typescript
// В модели Training.ts
TrainingSchema.index({ clientId: 1, date: 1 });
TrainingSchema.index({ date: 1, status: 1 });

// Теперь запросы будут быстрее
const trainings = await Training.find({ clientId: userId });
```

### 2. Пагинация

**❌ Плохо:**
```typescript
// Загрузка всех тренировок
const trainings = await Training.find({ clientId: userId });
```

**✅ Хорошо:**
```typescript
// Ограничение количества
const trainings = await Training.find({ clientId: userId })
  .sort({ date: -1 })
  .limit(10);
```

### 3. Кэширование

```typescript
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 600 }); // 10 минут

export const getSchedule = async () => {
  const cached = cache.get('schedule');
  if (cached) return cached;
  
  const schedule = await TimeSlot.find({ isActive: true });
  cache.set('schedule', schedule);
  
  return schedule;
};
```

### 4. Batch операции

**❌ Плохо:**
```typescript
for (const training of trainings) {
  await bot.telegram.sendMessage(training.clientId, 'Напоминание');
}
```

**✅ Хорошо:**
```typescript
const promises = trainings.map(training => 
  bot.telegram.sendMessage(training.clientId, 'Напоминание')
    .catch(err => console.error(`Ошибка для ${training.clientId}:`, err))
);

await Promise.allSettled(promises);
```

---

## 🧹 Чистый код

### 1. Обработка ошибок

**❌ Плохо:**
```typescript
bot.command('start', async (ctx) => {
  const user = await User.create({ telegramId: ctx.from.id });
  ctx.reply('Привет!');
});
```

**✅ Хорошо:**
```typescript
bot.command('start', async (ctx) => {
  try {
    const user = await User.create({ 
      telegramId: ctx.from.id,
      firstName: ctx.from.first_name 
    });
    await ctx.reply('Привет!');
  } catch (error) {
    console.error('Ошибка в /start:', error);
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
});
```

### 2. Константы вместо магических чисел

**❌ Плохо:**
```typescript
if (trainings.length > 20) {
  // ...
}
```

**✅ Хорошо:**
```typescript
const MAX_TRAININGS_DISPLAY = 20;

if (trainings.length > MAX_TRAININGS_DISPLAY) {
  // ...
}
```

### 3. Переиспользование кода

**❌ Плохо:**
```typescript
bot.hears('Мои тренировки', async (ctx) => {
  const user = await User.findOne({ telegramId: ctx.from.id });
  if (!user) return ctx.reply('Пользователь не найден');
  // ...
});

bot.hears('Отменить запись', async (ctx) => {
  const user = await User.findOne({ telegramId: ctx.from.id });
  if (!user) return ctx.reply('Пользователь не найден');
  // ...
});
```

**✅ Хорошо:**
```typescript
// utils/middleware.ts
export const requireUser = async (ctx, next) => {
  const user = await User.findOne({ telegramId: ctx.from.id });
  if (!user) {
    return ctx.reply('Пользователь не найден');
  }
  ctx.state.user = user;
  return next();
};

// index.ts
bot.hears('Мои тренировки', requireUser, async (ctx) => {
  const user = ctx.state.user;
  // ...
});
```

---

## 📊 Логирование

### 1. Структурированные логи

**❌ Плохо:**
```typescript
console.log('User registered');
```

**✅ Хорошо:**
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

logger.info('User registered', { 
  userId: user.telegramId, 
  timestamp: new Date() 
});
```

### 2. Уровни логирования

```typescript
logger.error('Критическая ошибка', { error });
logger.warn('Предупреждение', { details });
logger.info('Информация', { data });
logger.debug('Отладка', { debug });
```

---

## 🧪 Тестирование

### 1. Unit тесты

```typescript
// __tests__/helpers.test.ts
import { formatDate, isAdmin } from '../src/utils/helpers';

describe('Helpers', () => {
  test('formatDate форматирует дату правильно', () => {
    const date = new Date('2026-01-03T10:00:00');
    expect(formatDate(date)).toContain('03 января 2026');
  });

  test('isAdmin проверяет админа', () => {
    process.env.ADMIN_IDS = '123,456';
    expect(isAdmin(123)).toBe(true);
    expect(isAdmin(789)).toBe(false);
  });
});
```

### 2. Integration тесты

```typescript
// __tests__/booking.test.ts
import { connectDB } from '../src/config/database';
import Training from '../src/models/Training';
import User from '../src/models/User';

beforeAll(async () => {
  await connectDB();
});

describe('Booking', () => {
  test('создание тренировки', async () => {
    const user = await User.create({
      telegramId: 123,
      firstName: 'Test'
    });

    const training = await Training.create({
      clientId: user._id,
      date: new Date(),
      status: 'scheduled'
    });

    expect(training.status).toBe('scheduled');
  });
});
```

---

## 🚀 Деплой

### 1. Environment-specific конфигурация

```typescript
// config/index.ts
export const config = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  botToken: process.env.BOT_TOKEN!,
  mongoUri: process.env.MONGODB_URI!,
  logLevel: process.env.LOG_LEVEL || 'info'
};
```

### 2. Graceful shutdown

```typescript
const gracefulShutdown = async () => {
  console.log('Получен сигнал завершения...');
  
  // Остановить бота
  bot.stop('SIGTERM');
  
  // Закрыть соединение с БД
  await mongoose.connection.close();
  
  console.log('Приложение остановлено');
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
```

### 3. Health checks

```typescript
import express from 'express';

const app = express();

app.get('/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'ok' : 'error';
  
  res.json({
    status: 'ok',
    database: dbStatus,
    uptime: process.uptime()
  });
});

app.listen(3000);
```

---

## 📈 Мониторинг

### 1. Метрики

```typescript
import { Counter, Histogram } from 'prom-client';

const messageCounter = new Counter({
  name: 'bot_messages_total',
  help: 'Total number of messages'
});

const responseTime = new Histogram({
  name: 'bot_response_time',
  help: 'Response time in ms'
});

bot.use(async (ctx, next) => {
  messageCounter.inc();
  const start = Date.now();
  await next();
  responseTime.observe(Date.now() - start);
});
```

### 2. Алерты

```typescript
import axios from 'axios';

const sendAlert = async (message: string) => {
  if (process.env.ALERT_WEBHOOK) {
    await axios.post(process.env.ALERT_WEBHOOK, { text: message });
  }
};

// При критической ошибке
try {
  // ...
} catch (error) {
  await sendAlert(`Критическая ошибка: ${error.message}`);
  throw error;
}
```

---

## 💾 Бэкапы

### 1. Автоматический бэкап MongoDB

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"

mongodump --db swimming-coach-bot --out "$BACKUP_DIR/$DATE"

# Удалить старые бэкапы (старше 7 дней)
find "$BACKUP_DIR" -type d -mtime +7 -exec rm -rf {} \;
```

### 2. Cron для бэкапов

```bash
# Добавить в crontab
0 2 * * * /path/to/backup.sh
```

---

## 🔄 CI/CD

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to server
        run: |
          # Ваш скрипт деплоя
```

---

## 📱 UX лучшие практики

### 1. Быстрые ответы

```typescript
bot.action(/.*/, async (ctx) => {
  // Сразу ответить на callback
  await ctx.answerCbQuery();
  
  // Затем обработать
  // ...
});
```

### 2. Информативные сообщения

**❌ Плохо:**
```typescript
await ctx.reply('Ошибка');
```

**✅ Хорошо:**
```typescript
await ctx.reply(
  '❌ К сожалению, это время уже занято.\n\n' +
  'Попробуйте выбрать другое время или день.'
);
```

### 3. Прогресс-индикаторы

```typescript
bot.hears('Статистика', async (ctx) => {
  const msg = await ctx.reply('⏳ Загружаю статистику...');
  
  // Получить данные
  const stats = await getStatistics();
  
  // Обновить сообщение
  await ctx.telegram.editMessageText(
    ctx.chat.id,
    msg.message_id,
    undefined,
    formatStatistics(stats)
  );
});
```

---

## 🎯 Итоговый чек-лист

### Безопасность
- [ ] Токены в .env
- [ ] Валидация входных данных
- [ ] Проверка прав доступа
- [ ] Rate limiting
- [ ] HTTPS для webhook

### Производительность
- [ ] Индексы в MongoDB
- [ ] Пагинация
- [ ] Кэширование
- [ ] Batch операции

### Качество кода
- [ ] Обработка ошибок
- [ ] Логирование
- [ ] Тесты
- [ ] Документация

### Деплой
- [ ] Environment конфигурация
- [ ] Graceful shutdown
- [ ] Health checks
- [ ] Мониторинг

### Бэкапы
- [ ] Автоматические бэкапы
- [ ] Тестирование восстановления
- [ ] Хранение в безопасном месте

---

Следуя этим практикам, вы создадите надежное, безопасное и производительное приложение! 🚀
