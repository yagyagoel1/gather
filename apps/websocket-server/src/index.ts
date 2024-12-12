import http from 'http';
import { broadcastToSpace, handleClientMessage } from './handleClient';
import { spaces } from './store';
import { WebSocket, WebSocketServer } from 'ws';


const server = http.createServer();
const wss = new WebSocketServer({ server });
const PING_INTERVAL = 30000; 
const TIMEOUT_THRESHOLD = 5000;

const clients =  new Map<WebSocket, { user: any; lastPing: number }>();

wss.on('connection', function connection(ws:WebSocket) {
    let user: any = null;
    clients.set(ws, { user: null, lastPing: Date.now() });
    ws.on('message', async (message:string)=>{
        user = await handleClientMessage(ws,message,user)
    const clientData = clients.get(ws);
    if (clientData) {
      clientData.user = user;
        clientData.lastPing = Date.now();
      clients.set(ws, clientData);
    } else {
        clients.set(ws, { user, lastPing: Date.now() });
    }
    })
    ws.on('close', function close() {
        if (!user) return;
        const space = Object.values(spaces).find(s => s.users[user.id]);
        if (space) {
          delete space.users[user.id];
          broadcastToSpace(user.spaceId, { type: 'user-left', payload: { userId:user.id} });
          
        }
        clients.delete(ws); 
    });
    ws.on('pong', () => {
        const clientData = clients.get(ws);
        if (clientData) {
            clientData.lastPing = Date.now();
            clients.set(ws, clientData);
        }
    });
})
function removeUserFromSpace(user: any) {
    const space = spaces[user.spaceId];
    if (space) {
        delete space.users[user.id];
        broadcastToSpace(user.spaceId, { type: 'user-left', payload: { userId: user.id } });
        if (Object.keys(space.users).length === 0) {
            delete spaces[user.spaceId];
        }
    }
}

setInterval(() => {
    console.log('pinging');
        // console.log(clients);
        console.log(JSON.stringify(spaces))
    wss.clients.forEach((ws: WebSocket) => {
        
        const clientData = clients.get(ws);
        
        if (clientData && Date.now() - clientData.lastPing > PING_INTERVAL + TIMEOUT_THRESHOLD) {
            const { user } = clientData;
            ws.terminate(); 
            removeUserFromSpace(user); 
            clients.delete(ws);
        } else {
            ws.ping(); 
        }
    });
}, PING_INTERVAL);


server.listen(4001, () => {
    console.log(`WebSocket server is running on ws://localhost:${process.env.WS_PORT||4001}`);
});