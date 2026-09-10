# Bingo Virtual — servidor

Bingo 1–75 con cartones 5×5 y salas multijugador.

## Ejecutar localmente
1. Instala Node.js 18+.
2. Abre una terminal en esta carpeta.
3. Ejecuta `npm install`.
4. Ejecuta `npm start`.
5. Abre `http://localhost:3000`.

## Publicación
El proyecto está preparado para un servicio Node que ejecute `npm start`.
La variable `PORT` la proporciona el servicio de hosting.

## Funcionamiento
- El primer jugador de una sala es el anfitrión.
- Solo el anfitrión puede sacar números y reiniciar.
- Cada jugador recibe su propio cartón.
- Todos los jugadores de la misma sala ven los números en tiempo real.
- El estado vive en memoria del servidor; si el servidor se reinicia, las salas se reinician.
