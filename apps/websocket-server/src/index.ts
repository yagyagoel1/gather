import websocket from 'ws';
import { broadcastToSpace, handleClientMessage } from './handleClient';
import { spaces } from './store';

const wss = new websocket.Server({ noServer: true });

const HEARTBEAT_INTERVAL = 30000;
const HEARTBEAT_TIMEOUT = 60000;

wss.on('connection', function connection(ws:websocket) {
    let user:any = null;
    ws.on('message', async (message:string)=>{
        user = await handleClientMessage(ws,message,user)
    })
    ws.on('close', function close() {
        if (!user) return;
        const space = Object.values(spaces).find(s => s.users[user.id]);
        if (space) {
          delete space.users[user.id];
          broadcastToSpace(user.spaceId, { type: 'user-left', payload: { userId:user.id} });
        }
        
    });
})