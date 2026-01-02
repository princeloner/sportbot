FROM node:18-alpine

WORKDIR /app

# Копируем package файлы
COPY package*.json ./
COPY tsconfig.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем исходный код
COPY src ./src

# Компилируем TypeScript
RUN npm run build

# Запускаем приложение
CMD ["npm", "start"]
