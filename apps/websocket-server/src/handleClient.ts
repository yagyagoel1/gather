import { WebSocket } from 'ws';
import { spaces } from './store';
import prisma from '@repo/db';
import { verifyToken } from './utils/jwtToken';

interface ElementsAccumulator {
  [elementId: string]: {
    x: number;
    y: number;
    height: number;
    width: number;
    static: boolean;
  };
}

export function broadcastToSpace(spaceId: string, message: { type: string; payload: any }) {
  console.log("broadcastToSpace called with spaceId:", spaceId, "message:", message);

  if (!spaces[spaceId]) {
    console.log(`broadcastToSpace: Space with ID ${spaceId} does not exist.`);
    return;
  }

  const usersInSpace = spaces[spaceId].users;
  console.log(`Users in space ${spaceId}:`, Object.keys(usersInSpace));

  Object.entries(usersInSpace).forEach(([userId, user]) => {
    console.log(`Checking userId: ${userId} against initiatorId: ${message.payload.userId}`);
    if (userId !== message.payload.userId) {
      console.log(`Sending message to userId: ${userId}`);
      user.ws.send(JSON.stringify(message));
    } else {
      console.log(`Skipping initiator userId: ${userId}`);
    }
  });
}
export async function handleClientMessage(ws: WebSocket, message: string, user: any): Promise<any> {
  const data = JSON.parse(message);

  if (data.type === 'join') {
    const { spaceId, token } = data.payload;
    console.log(`Handling join for spaceId: ${spaceId}`);

    if (token) {
      const decoded = await verifyToken(token);
      if (decoded) {
        console.log(`Token decoded:`, decoded);
        user = await prisma.user.findFirst({
          where: { id: decoded.id },
        });
        if (!user) {
          ws.send(JSON.stringify({ type: 'unauthorized' }));
          console.log(`Unauthorized user attempted to join spaceId: ${spaceId}`);
          return null;
        }
      } else {
        ws.send(JSON.stringify({ type: 'unauthorized' }));
        console.log(`Invalid token for spaceId: ${spaceId}`);
        return null;
      }
    } else {
      ws.send(JSON.stringify({ type: 'unauthorized' }));
      console.log(`Missing token for spaceId: ${spaceId}`);
      return null;
    }

    // Assign spaceId to user
    user.spaceId = spaceId;
    user.id = user.id ; // Ensure user has an ID

    // Initialize space if it doesn't exist
    if (!spaces[spaceId]) {
      console.log(`Space ${spaceId} does not exist. Initializing space.`);
      const space = await prisma.space.findFirst({
        where: { id: spaceId },
        select: { 
          elements: { 
            select: { 
              id: true, 
              x: true, 
              y: true, 
              element: { 
                select: { height: true, width: true, static: true } 
              } 
            } 
          },
        },
      });

      if (!space) {
        ws.send(JSON.stringify({ type: 'error', message: 'Space not found' }));
        console.log(`Space not found: ${spaceId}`);
        return user;
      }

      spaces[spaceId] = {
        users: {},
        elements: space.elements.reduce((acc: any, element: any) => {
          acc[element.id] = {
            x: element.x,
            y: element.y,
            height: element.element.height,
            width: element.element.width,
            static: element.element.static,
          };
          return acc;
        }, {}),
      };
      console.log(`Initialized space ${spaceId} with elements.`);
    }

    // Add user to the space
    spaces[spaceId].users[user.id] = { x: 0, y: 0, ws };
    console.log(`User ${user.id} joined space ${spaceId}.`);

    // Broadcast 'user-join' to other users in the space
    const joinMessage = {
      type: 'user-join',
      payload: { userId: user.id, x: 0, y: 0 },
    };
    broadcastToSpace(spaceId, joinMessage);
    console.log(`Broadcasted 'user-join' message for user ${user.id} in space ${spaceId}.`);

    // Send 'joined' message back to the user
    ws.send(JSON.stringify({
      type: 'joined',
      payload: {
        spawn: { x: 0, y: 0 },
        userId: user.id,
        users: Object.keys(spaces[spaceId].users).map(id => ({ id })),
      },
    }));
    console.log(`Sent 'joined' message to user ${user.id}.`);

    return user;
  }else if (data.type == 'move') {
    if (!user || !user.spaceId || !spaces[user.spaceId]) return user;

    const { x, y } = data.payload;
    const elements = Object.values(spaces[user.spaceId].elements);
    const userElement = { x, y, width: 1, height: 1 };
    let overlap = false;
    overlap = elements.some((element) => {
      if (!element.static) return false;

      const noOverlapX =
        userElement.x + userElement.width <= element.x || element.x + element.width <= userElement.x;
      const noOverlapY =
        userElement.y + userElement.height <= element.y || element.y + element.height <= userElement.y;

      return !noOverlapX && !noOverlapY;
    });
    // Check if user is out of bounds
    if (x < 0 || y < 0) {
      ws.send(
        JSON.stringify({
          type: 'movement-rejected',
          payload: { x: spaces[user.spaceId].users[user.id].x, y: spaces[user.spaceId].users[user.id].y },
        })
      );
      return user;
    }
    if (overlap) {
      ws.send(
        JSON.stringify({
          type: 'movement-rejected',
          payload: { x: spaces[user.spaceId].users[user.id].x, y: spaces[user.spaceId].users[user.id].y },
        })
      );
      return user;
    }
    overlap = Object.keys(spaces[user.spaceId].users).some((u) => {
      if (u === user.id) return false;
      return (
        spaces[user.spaceId].users[u].x === x && spaces[user.spaceId].users[u].y === y
      );
    });
    if (overlap) {
      ws.send(
        JSON.stringify({
          type: 'movement-rejected',
          payload: { x: spaces[user.spaceId].users[user.id].x, y: spaces[user.spaceId].users[user.id].y },
        })
      );
      return user;
    }
    spaces[user.spaceId].users[user.id].x = x;
    spaces[user.spaceId].users[user.id].y = y;
    ws.send(JSON.stringify({ type: 'movement-accepted', payload: { x, y } }));
    broadcastToSpace(user.spaceId, { type: 'movement', payload: { userId: user.id, x, y } });
    return user;
  } else if (data.type === 'disconnect') {
    if (!user || !user.spaceId || !spaces[user.spaceId]) {
      return user;
    }

    delete spaces[user.spaceId].users[user.id];
    broadcastToSpace(user.spaceId, { type: 'user-leave', payload: { userId: user.id } });
    ws.send(JSON.stringify({ type: 'disconnected' }));
    return user;
  } else {
    ws.send(JSON.stringify({ type: 'error', message: 'Invalid message type' }));
    return user;
  }
}