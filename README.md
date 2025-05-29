### CHATBOT Whatsapp (Baileys Provider)

## Localhost

```
npm install
npm install --cpu=wasm32 sharp
npm run start
```

## Produccion

1. Copie el archivo .env.example a .env

```
cp .env.example .env
```

2. Complete las variables del .env

```
PORT=3000
```
3. Instale los modulos

```
docker-compose run --rm miventa-bot npm install --ignore-scripts=false --foreground-scripts --verbose sharp
```

4. Ejecute el contenedor de Pedidos Bot

```
docker-compose up -d
```
