'use client';

import React, { useEffect, useRef } from 'react';

export default function WarpBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      // Handle high DPI displays for crisp lines
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);
      
      // 1. Gradient Background based on #49997E (Teal)
      // Creating a soft, premium feel similar to the reference but with our brand color
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#F0F9F6');    // Very light teal/white
      gradient.addColorStop(0.5, '#E6F5F0');  // Soft mint
      gradient.addColorStop(1, '#D1EBE3');    // Slightly deeper mint at bottom right
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 2. Grid Settings
      ctx.strokeStyle = 'rgba(73, 153, 126, 0.15)'; // #49997E at 15% opacity
      ctx.lineWidth = 1;
      
      const gridSize = 50;
      
      // Warp parameters
      // Creating a large, slow moving wave that affects the whole grid
      const waveX = (x: number, y: number, t: number) => {
        return x + Math.sin((y * 0.005) + (t * 0.002)) * 40 
                 + Math.sin((y * 0.002) + (t * 0.001)) * 20;
      };

      const waveY = (x: number, y: number, t: number) => {
        return y + Math.cos((x * 0.005) + (t * 0.002)) * 40
                 + Math.cos((x * 0.002) + (t * 0.001)) * 20;
      };

      // Vertical lines
      for (let x = 0; x <= width + gridSize; x += gridSize) {
        ctx.beginPath();
        for (let y = -100; y <= height + 100; y += 20) {
          const wx = waveX(x, y, time);
          const wy = waveY(x, y, time);
          if (y === -100) ctx.moveTo(wx, wy);
          else ctx.lineTo(wx, wy);
        }
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y <= height + gridSize; y += gridSize) {
        ctx.beginPath();
        for (let x = -100; x <= width + 100; x += 20) {
          const wx = waveX(x, y, time);
          const wy = waveY(x, y, time);
          if (x === -100) ctx.moveTo(wx, wy);
          else ctx.lineTo(wx, wy);
        }
        ctx.stroke();
      }

      time += 0.5;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-50 pointer-events-none"
    />
  );
}
