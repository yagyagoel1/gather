import React, { useCallback, useEffect, useRef, useState } from 'react';

interface User {
  x: number;
  y: number;
  userId: string;
}

interface Params {
  token: string;
  spaceId: string;
}


const Arena = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<Map<string, User>>(new Map());
  const [params, setParams] = useState<Params>({ token: '', spaceId: '' });
  const [elements, setElements] = useState<any[]>([]);
  const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(new Map());

  useEffect(() => {
    // Remove the "Example:" text and add proper error logging
    fetch(`http://localhost:5001/api/v1/space/elements/${params.spaceId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${params.token}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Received elements:', data.elements); // Debug log
        setElements(data.elements);
      })
      .catch(error => console.error('Fetch Error:', error));
  }, [params.spaceId, params.token]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    // const token = urlParams.get('token') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtNGtpZHI1NjAwMDBwbWlkNDgzcWYyaDQiLCJpYXQiOjE3MzM5NTg5MzcsImV4cCI6MTc1NDk0OTM3fQ.oWRq4DOjckuNQ8_ruatG3I3RPH2i4GkvcqhkfcDT8O8';

    const token = urlParams.get('token') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtNGtkcTkyYTAwMDAxMnpweHkxNmhwamUiLCJpYXQiOjE3MzM5NTExMjIsImV4cCI6MTc2NTQ4NzEyMn0.rzZwnChM20FqkRdm-EzmpZGb4hJd9NwJ-H40GOK88MA';
    const spaceId = urlParams.get('spaceId') || 'cm4kidr8m000cpmids94a82gk';
    setParams({ token, spaceId });

    wsRef.current = new WebSocket('ws://localhost:3000'); // Replace with your WS_URL
    
    wsRef.current.onopen = () => {
      wsRef.current?.send(JSON.stringify({
        type: 'join',
        payload: { spaceId, token }
      }));
    };

    wsRef.current.onmessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      handleWebSocketMessage(message);
    };

    return () => {
      wsRef.current?.close();
    };
  }, []);

  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case 'joined':
        setCurrentUser({
          x: message.payload.spawn.x,
          y: message.payload.spawn.y,
          userId: message.payload.users[0].id // Ensure this is correctly assigned
        });
        console.log(currentUser)
        const userMap = new Map<string, User>();
        message.payload.users.forEach((user: { id: string }) => {
          if (user.id !== message.payload.userId) {
            userMap.set(user.id, { x: 0, y: 0, userId: user.id });
          }
        });
        setUsers(userMap);
        console.log(users)
        break;
      case 'user-joined':
        setUsers(prev => {
          const newUsers = new Map(prev);
          const user = newUsers.get(message.payload.userId);
          if (user) {
            user.x = message.payload.x;
            user.y = message.payload.y;
            newUsers.set(message.payload.userId, user);
          }else{
            newUsers.set(message.payload.userId, { x: message.payload.x, y: message.payload.y, userId: message.payload.userId });
          }
          return newUsers;
        })
        break;
      case 'movement':
        setUsers(prev => {
          const newUsers = new Map(prev);
          const user = newUsers.get(message.payload.userId);
          if (user) {
            user.x = message.payload.x;
            user.y = message.payload.y;
            newUsers.set(message.payload.userId, user);
          }else{
            newUsers.set(message.payload.userId, { x: message.payload.x, y: message.payload.y, userId: message.payload.userId });
          }
          return newUsers;
        });
        break;
      case 'movement-rejected':
        setCurrentUser(prev => prev ? { ...prev, x: message.payload.x, y: message.payload.y } : null);
        break;
        case 'movement-accepted':
      setCurrentUser(prev => prev ? { ...prev, x: message.payload.x, y: message.payload.y } : null);
      break;
      case 'user-left':
        setUsers(prev => {
          const newUsers = new Map(prev);
          newUsers.delete(message.payload.userId);
          return newUsers;
        });
        break;
    }
  };

  const handleMove = useCallback((newX: number, newY: number) => {
    if (!currentUser) return;
    wsRef.current?.send(JSON.stringify({
      type: 'move',
      payload: { x: newX, y: newY ,userId: currentUser.userId}
    }));
  }, [currentUser]);

  useEffect(() => {
    elements.forEach(element => {
      if (!loadedImages.has(element.imageUrl)) {
        console.log('Loading image:', element.imageUrl); // Debug log
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Add this if images are from different domain
        
        img.onload = () => {
          console.log('Image loaded successfully:', element.imageUrl); // Debug log
          setLoadedImages(prev => {
            const newMap = new Map(prev);
            newMap.set(element.imageUrl, img);
            return newMap;
          });
        };

        img.onerror = (error) => {
          console.error('Error loading image:', element.imageUrl, error); // Error log
        };

        img.src = element.imageUrl;
      }
    });
  }, [elements]);

  const drawArena = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#eee';
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Debug log for elements and loaded images
    console.log('Drawing elements:', elements);
    console.log('Loaded images:', loadedImages);

    // Draw elements
    elements.forEach(element => {
      const img = loadedImages.get(element.imageUrl);
      if (img) {
        try {
          ctx.drawImage(img, element.x * 50, element.y * 50, element.width * 50, element.height * 50);
        } catch (error) {
          console.error('Error drawing image:', error);
        }
      } else {
        console.log('Image not loaded yet for:', element.imageUrl);
      }
    });

    // Draw current user
    if (currentUser) {
      ctx.beginPath();
      ctx.fillStyle = '#FF6B6B';
      ctx.arc(currentUser.x * 50, currentUser.y * 50, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('You', currentUser.x * 50, currentUser.y * 50 + 40);
    }
    console.log("users",users)
    // Draw other users
    users.forEach(user => {
      
      if (!user.x) return;
      ctx.beginPath();
      ctx.fillStyle = '#4ECDC4';
      ctx.arc(user.x * 50, user.y * 50, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`User ${user.userId}`, user.x * 50, user.y * 50 + 40);
    });
  };

  useEffect(() => {
    drawArena();
  }, [currentUser, users, elements, loadedImages]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentUser) return;
      const { x, y } = currentUser;
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          handleMove(x, y - 1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleMove(x, y + 1);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleMove(x - 1, y);
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleMove(x + 1, y);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentUser, handleMove]);

  return (
    <div className="p-4" tabIndex={0}>
      <h1 className="text-2xl font-bold mb-4">Arena</h1>
      <div className="mb-4">
        <p className="text-sm text-gray-600">Token: {params.token}</p>
        <p className="text-sm text-gray-600">Space ID: {params.spaceId}</p>
        <p className="text-sm text-gray-600">Connected Users: {users.size + (currentUser ? 1 : 0)}</p>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <canvas ref={canvasRef} width={2000} height={2000} className="bg-white" />
      </div>
      <p className="mt-2 text-sm text-gray-500">Use arrow keys to move your avatar</p>
    </div>
  );
};

export default Arena;