import React, { useRef, useEffect, useState } from 'react';
import { Eraser, Pencil, Square, Circle, Undo, Redo } from 'lucide-react';
import { useCollaboration } from '../hooks/useCollaboration';

interface DrawingAction {
  type: 'path' | 'rectangle' | 'circle';
  points: { x: number; y: number }[];
  color: string;
  size: number;
}

export default function InteractiveWhiteboard({ roomId }: { roomId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pencil' | 'eraser' | 'rectangle' | 'circle'>('pencil');
  const [color, setColor] = useState('#ffffff');
  const [size, setSize] = useState(2);
  const { getData, setData } = useCollaboration(roomId);
  const [actions, setActions] = useState<DrawingAction[]>([]);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const storedActions = getData('actions') || [];
    setActions(storedActions);
    redrawCanvas();
  }, [getData]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    actions.forEach((action) => {
      ctx.beginPath();
      ctx.strokeStyle = action.color;
      ctx.lineWidth = action.size;

      if (action.type === 'path') {
        action.points.forEach((point, i) => {
          if (i === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
      } else if (action.type === 'rectangle') {
        const [start, end] = action.points;
        ctx.strokeRect(
          start.x,
          start.y,
          end.x - start.x,
          end.y - start.y
        );
      } else if (action.type === 'circle') {
        const [start, end] = action.points;
        const radius = Math.sqrt(
          Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
        );
        ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
      }

      ctx.stroke();
    });
  };

  const startDrawing = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setCurrentPath([{ x, y }]);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentPath([...currentPath, { x, y }]);
    redrawCanvas();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;

    const newAction: DrawingAction = {
      type: tool === 'pencil' || tool === 'eraser' ? 'path' : tool,
      points: currentPath,
      color: tool === 'eraser' ? '#000000' : color,
      size: tool === 'eraser' ? 20 : size,
    };

    const updatedActions = [...actions, newAction];
    setActions(updatedActions);
    setData('actions', updatedActions);
    setIsDrawing(false);
    setCurrentPath([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setTool('pencil')}
            className={`p-2 rounded ${
              tool === 'pencil' ? 'bg-primary' : 'bg-surface-light'
            }`}
          >
            <Pencil className="h-5 w-5" />
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`p-2 rounded ${
              tool === 'eraser' ? 'bg-primary' : 'bg-surface-light'
            }`}
          >
            <Eraser className="h-5 w-5" />
          </button>
          <button
            onClick={() => setTool('rectangle')}
            className={`p-2 rounded ${
              tool === 'rectangle' ? 'bg-primary' : 'bg-surface-light'
            }`}
          >
            <Square className="h-5 w-5" />
          </button>
          <button
            onClick={() => setTool('circle')}
            className={`p-2 rounded ${
              tool === 'circle' ? 'bg-primary' : 'bg-surface-light'
            }`}
          >
            <Circle className="h-5 w-5" />
          </button>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-9 w-9 rounded bg-surface-light p-1"
          />
          <input
            type="range"
            min="1"
            max="10"
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value))}
            className="w-32"
          />
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              const updatedActions = [...actions];
              updatedActions.pop();
              setActions(updatedActions);
              setData('actions', updatedActions);
              redrawCanvas();
            }}
            className="p-2 rounded bg-surface-light"
          >
            <Undo className="h-5 w-5" />
          </button>
          <button
            onClick={() => {
              setActions([]);
              setData('actions', []);
              redrawCanvas();
            }}
            className="p-2 rounded bg-surface-light"
          >
            Clear
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        className="w-full h-[600px] bg-black rounded-lg cursor-crosshair"
      />
    </div>
  );
}