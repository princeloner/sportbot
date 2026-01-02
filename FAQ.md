# ❓ Часто задаваемые вопросы (FAQ)

## 🚀 Установка и настройка

### Как получить Bot Token?
1. Откройте Telegram
2. Найдите [@BotFather](https://t.me/BotFather)
3. Отправьте `/newbot`
4. Следуйте инструкциям
5. Скопируйте полученный токен

### Как узнать свой Telegram ID?
1. Найдите [@userinfobot](https://t.me/userinfobot)
2. Отправьте любое сообщение
3. Бот пришлет ваш ID

### Где взять MongoDB?
**Локально:**
- macOS: `brew install mongodb-community`
- Linux: `sudo apt-get install mongodb`
- Windows: [Скачать с сайта](https://www.mongodb.com/try/download/community)

**Облако (бесплатно):**
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Создайте кластер
- Получите connection string

### Как изменить часовой пояс?
В файле `.env` измените:
```env
TZ=Europe/Moscow  # Ваш часовой пояс
```

Список часовых поясов: [Wikipedia](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

---

## 🔧 Использование

### Как добавить временные слоты?
**Вариант 1: Через скрипт**
```bash
npm run init-db
```

**Вариант 2: Через MongoDB**
```javascript
mongosh swimming-coach-bot

db.timeslots.insertOne({
  dayOfWeek: 1,        // 0=Вс, 1=Пн, ..., 6=Сб
  startTime: "14:00",
  endTime: "15:00",
  isActive: true,
  maxClients: 1
})
```

### Как добавить нескольких админов?
В `.env` укажите ID через запятую:
```env
ADMIN_IDS=123456789,987654321,555666777
```

### Как изменить длительность тренировки?
В модели `Training.ts`:
```typescript
duration: { type: Number, default: 90 }  // 90 минут вместо 60
```

### Как изменить время напоминания?
В `services/reminderService.ts`:
```typescript
const oneHourBefore = addHours(trainingDate, -2);  // За 2 часа вместо 1
```

### Как отключить напоминания для клиента?
Клиент может отключить в настройках (если реализовано), или через MongoDB:
```javascript
db.users.updateOne(
  { telegramId: 123456789 },
  { $set: { notificationsEnabled: false } }
)
```

---

## 🐛 Решение проблем

### Бот не отвечает на сообщения

**Проверьте:**
1. Запущен ли бот? (`npm run dev`)
2. Правильный ли BOT_TOKEN в `.env`?
3. Есть ли ошибки в консоли?

**Решение:**
```bash
# Перезапустите бота
npm run dev

# Проверьте логи
```

### Ошибка подключения к MongoDB

**Ошибка:**
```
MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```

**Решение:**
```bash
# Проверьте, запущена ли MongoDB
mongosh

# Если нет, запустите:
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Docker
docker run -d -p 27017:27017 mongo
```

### Нет доступа к админ-панели

**Проверьте:**
1. Ваш ID в ADMIN_IDS?
2. Перезапустили бота после изменения .env?

**Решение:**
```bash
# 1. Узнайте свой ID через @userinfobot
# 2. Добавьте в .env
ADMIN_IDS=ваш_id

# 3. Перезапустите бота
npm run dev

# 4. Отправьте /start боту заново
```

### Не приходят напоминания

**Причины:**
- Напоминания отправляются за 1 час до тренировки
- Проверка каждые 5 минут
- Уведомления отключены у пользователя

**Тестирование:**
```javascript
// Создайте тестовую тренировку через MongoDB
db.trainings.insertOne({
  clientId: ObjectId("ваш_user_id"),
  date: new Date(Date.now() + 3600000),  // Через 1 час
  status: "scheduled",
  reminderSent: false
})
```

### Ошибка "Cannot find module"

**Решение:**
```bash
# Удалите node_modules и переустановите
rm -rf node_modules package-lock.json
npm install
```

### TypeScript ошибки компиляции

**Решение:**
```bash
# Очистите dist и пересоберите
rm -rf dist
npm run build
```

---

## 💾 База данных

### Как посмотреть всех пользователей?
```javascript
mongosh swimming-coach-bot
db.users.find().pretty()
```

### Как посмотреть все тренировки?
```javascript
db.trainings.find().sort({ date: -1 }).limit(10).pretty()
```

### Как удалить старые тренировки?
```javascript
// Удалить тренировки старше 3 месяцев
db.trainings.deleteMany({
  date: { $lt: new Date(Date.now() - 90*24*60*60*1000) },
  status: { $in: ["completed", "cancelled"] }
})
```

### Как сделать бэкап?
```bash
# Создать бэкап
mongodump --db swimming-coach-bot --out ./backup

# Восстановить бэкап
mongorestore --db swimming-coach-bot ./backup/swimming-coach-bot
```

### Как очистить всю базу?
```javascript
mongosh swimming-coach-bot

db.users.deleteMany({})
db.trainings.deleteMany({})
db.timeslots.deleteMany({})
```

---

## 🚀 Деплой

### Где хостить бота?

**Бесплатные варианты:**
- [Railway](https://railway.app/) - 500 часов/месяц
- [Render](https://render.com/) - бесплатный tier
- [Fly.io](https://fly.io/) - бесплатный tier

**Платные варианты:**
- [DigitalOcean](https://www.digitalocean.com/) - от $5/месяц
- [AWS EC2](https://aws.amazon.com/ec2/) - от $3.5/месяц
- [Hetzner](https://www.hetzner.com/) - от €3/месяц

### Как запустить на VPS?

```bash
# 1. Подключитесь к серверу
ssh user@your-server.com

# 2. Установите Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Установите MongoDB
# См. https://www.mongodb.com/docs/manual/installation/

# 4. Клонируйте репозиторий
git clone <your-repo>
cd swimming-coach-bot

# 5. Установите зависимости
npm install

# 6. Настройте .env
nano .env

# 7. Инициализируйте БД
npm run init-db

# 8. Соберите проект
npm run build

# 9. Установите PM2
npm install -g pm2

# 10. Запустите бота
pm2 start dist/index.js --name swimming-bot
pm2 save
pm2 startup
```

### Как обновить бота на сервере?

```bash
# 1. Подключитесь к серверу
ssh user@your-server.com
cd swimming-coach-bot

# 2. Получите изменения
git pull

# 3. Установите новые зависимости
npm install

# 4. Пересоберите
npm run build

# 5. Перезапустите
pm2 restart swimming-bot
```

### Как использовать Docker?

```bash
# 1. Создайте .env файл
cp .env.example .env
nano .env

# 2. Запустите через Docker Compose
docker-compose up -d

# 3. Проверьте логи
docker-compose logs -f bot

# 4. Остановите
docker-compose down
```

---

## 📊 Статистика и аналитика

### Как посмотреть количество пользователей?
```javascript
db.users.countDocuments()
```

### Как посмотреть активных пользователей?
```javascript
// Пользователи с тренировками за последний месяц
db.trainings.aggregate([
  {
    $match: {
      date: { $gte: new Date(Date.now() - 30*24*60*60*1000) }
    }
  },
  {
    $group: { _id: "$clientId" }
  },
  {
    $count: "activeUsers"
  }
])
```

### Как посмотреть самые популярные слоты?
```javascript
db.trainings.aggregate([
  {
    $group: {
      _id: { $hour: "$date" },
      count: { $sum: 1 }
    }
  },
  {
    $sort: { count: -1 }
  }
])
```

---

## 🔐 Безопасность

### Как защитить бота от спама?

Добавьте rate limiting:
```bash
npm install telegraf-ratelimit
```

```typescript
import rateLimit from 'telegraf-ratelimit';

const limitConfig = {
  window: 3000,
  limit: 1,
  onLimitExceeded: (ctx) => ctx.reply('Слишком быстро!')
};

bot.use(rateLimit(limitConfig));
```

### Как заблокировать пользователя?

```javascript
db.users.updateOne(
  { telegramId: 123456789 },
  { $set: { isBlocked: true } }
)
```

Затем в коде:
```typescript
bot.use(async (ctx, next) => {
  const user = await User.findOne({ telegramId: ctx.from.id });
  if (user?.isBlocked) {
    return ctx.reply('Вы заблокированы');
  }
  return next();
});
```

---

## 💡 Расширение функционала

### Как добавить оплату?

**ЮKassa:**
```bash
npm install @a2seven/yoo-checkout
```

```typescript
import { YooCheckout } from '@a2seven/yoo-checkout';

const checkout = new YooCheckout({
  shopId: process.env.YOOKASSA_SHOP_ID,
  secretKey: process.env.YOOKASSA_SECRET_KEY
});

const payment = await checkout.createPayment({
  amount: { value: '1000.00', currency: 'RUB' },
  description: 'Оплата тренировки'
});
```

### Как добавить фото/видео?

```typescript
bot.hears('Упражнения', async (ctx) => {
  await ctx.replyWithPhoto(
    { source: './images/exercise1.jpg' },
    { caption: 'Упражнение 1: Кроль' }
  );
  
  await ctx.replyWithVideo(
    { source: './videos/technique.mp4' },
    { caption: 'Техника плавания' }
  );
});
```

### Как добавить экспорт в Excel?

```bash
npm install exceljs
```

```typescript
import ExcelJS from 'exceljs';

const exportTrainings = async (userId: string) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Тренировки');
  
  worksheet.columns = [
    { header: 'Дата', key: 'date' },
    { header: 'Статус', key: 'status' }
  ];
  
  const trainings = await Training.find({ clientId: userId });
  trainings.forEach(t => {
    worksheet.addRow({ date: t.date, status: t.status });
  });
  
  await workbook.xlsx.writeFile('trainings.xlsx');
};
```

---

## 📱 Интеграции

### Как интегрировать с Google Calendar?

```bash
npm install googleapis
```

```typescript
import { google } from 'googleapis';

const calendar = google.calendar('v3');
const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json',
  scopes: ['https://www.googleapis.com/auth/calendar']
});

const event = {
  summary: 'Тренировка',
  start: { dateTime: training.date.toISOString() },
  end: { dateTime: addHours(training.date, 1).toISOString() }
};

await calendar.events.insert({
  auth,
  calendarId: 'primary',
  resource: event
});
```

### Как добавить уведомления в Email?

```bash
npm install nodemailer
```

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: client.email,
  subject: 'Напоминание о тренировке',
  text: `У вас тренировка ${formatDate(training.date)}`
});
```

---

## 🎓 Обучение

### Где изучить Telegraf?
- [Официальная документация](https://telegraf.js.org/)
- [GitHub примеры](https://github.com/telegraf/telegraf/tree/develop/docs/examples)
- [Telegram Bot API](https://core.telegram.org/bots/api)

### Где изучить MongoDB?
- [MongoDB University](https://university.mongodb.com/) - бесплатные курсы
- [Официальная документация](https://www.mongodb.com/docs/)
- [Mongoose документация](https://mongoosejs.com/docs/)

### Где изучить TypeScript?
- [Официальный handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

---

## 💬 Поддержка

### Где получить помощь?
- GitHub Issues (если есть репозиторий)
- [Telegraf чат](https://t.me/TelegrafJSChat)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/telegraf)

### Как сообщить об ошибке?
1. Проверьте, что ошибка воспроизводится
2. Соберите информацию:
   - Версия Node.js (`node -v`)
   - Версия MongoDB
   - Логи ошибки
   - Шаги для воспроизведения
3. Создайте Issue с подробным описанием

---

## 🎉 Дополнительно

### Как изменить язык бота?
Создайте файл `locales/ru.json` и `locales/en.json`, затем используйте библиотеку i18n.

### Как добавить голосовые сообщения?
```typescript
bot.on('voice', async (ctx) => {
  await ctx.reply('Голосовые сообщения пока не поддерживаются');
});
```

### Как добавить inline режим?
```typescript
bot.on('inline_query', async (ctx) => {
  const results = [
    {
      type: 'article',
      id: '1',
      title: 'Записаться на тренировку',
      input_message_content: {
        message_text: 'Хочу записаться!'
      }
    }
  ];
  
  await ctx.answerInlineQuery(results);
});
```

---

Не нашли ответ на свой вопрос? Создайте Issue! 🚀
