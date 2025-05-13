
FROM node:16-alpine

WORKDIR /app
COPY . .
RUN npm install ethers express ws cors dotenv

EXPOSE 4000
CMD ["node", "index.js"]
