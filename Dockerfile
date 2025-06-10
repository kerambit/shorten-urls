FROM node:22-alpine

WORKDIR /usr/src/app

COPY . ./

RUN cd backend && npm install && npm run build
RUN cd frontend && npm install && npm run build

RUN mv frontend/dist backend/public
RUN rm -rf frontend

EXPOSE 3000

CMD ["node", "backend/dist/main.js"]
