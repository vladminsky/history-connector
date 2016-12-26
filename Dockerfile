FROM alpine:edge


WORKDIR /budget-connector

COPY . /budget-connector


RUN apk add -U curl git nodejs && npm install pm2 -g && npm install

EXPOSE 8080

ENV NODE_ENV production
ENV PORT 8080

ENTRYPOINT ["sh", "manage.sh"]

CMD ["run-server"]
