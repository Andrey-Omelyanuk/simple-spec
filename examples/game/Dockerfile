# Среда разработки примера game. На хосте Node/npm не нужны.
FROM node:22-alpine
WORKDIR /app
# Зависимости ставятся в рантайме в volume node_modules
# (docker compose run --rm dev npm install), а не на хост.
# Когда появится package.json, установку можно будет «запечь» в образ.
EXPOSE 3000
