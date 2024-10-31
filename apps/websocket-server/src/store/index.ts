import WebSocket from 'ws';

export const spaces: {
  [spaceId: string]: {                 
    users: {                            
      [userId: string]: {
        x: number;                      
        y: number;        
        ws: WebSocket;             
      };
    },
    elements: {
        [elementId: string]: {
            x: number;
            y: number;
            height: number;
            width: number;
            static: boolean;
        };
  };
} 
}= {};
