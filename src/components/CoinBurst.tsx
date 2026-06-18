import React, { useEffect, useRef } from 'react';

export default function CoinBurst() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    
    // Resize to container size
    const resize = () => {
      if (canvas) {
        // Find container bounds or fallback to viewport
        const parent = canvas.parentElement;
        canvas.width = parent ? parent.offsetWidth : window.innerWidth;
        canvas.height = parent ? parent.offsetHeight : window.innerHeight;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    // Spawn point: center of screen (approximate coordinates relative to canvas)
    const spawnX = canvas.width / 2;
    const spawnY = canvas.height / 2;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      gravity: number;
      decay: number;
      rotateSpeed: number;
      angle: number;
    }

    const particles: Particle[] = [];

    // Create a burst of gold retro pixelated coin particles!
    const goldCoinsColors = ['#eab308', '#facc15', '#fef08a', '#ca8a04', '#eab308'];
    for (let i = 0; i < 70; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 9;
      particles.push({
        x: spawnX,
        y: spawnY - 60, // spawn slightly above screen center to make it look epic
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3, // slightly upward initial thrust
        size: Math.random() > 0.5 ? 7 : 5, // chunkier retro pixels
        color: goldCoinsColors[Math.floor(Math.random() * goldCoinsColors.length)],
        alpha: 1.0,
        gravity: 0.24,
        decay: 0.01 + Math.random() * 0.008,
        rotateSpeed: (Math.random() - 0.5) * 0.2,
        angle: Math.random() * Math.PI * 2
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.97; // air resistance friction
        p.alpha -= p.decay;
        p.angle += p.rotateSpeed;

        if (p.alpha > 0) {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          
          // Move and rotate for classic spin
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          
          // Draw standard retro chunky 8-bit coin box representation
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          
          // Dark pixelated border around coin
          ctx.strokeStyle = '#854d0e';
          ctx.lineWidth = 1;
          ctx.strokeRect(-p.size / 2, -p.size / 2, p.size, p.size);
          
          // Center detail dot for shine
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-1, -1, 2, 2);

          ctx.restore();
        }
      });

      // Continue animation loop as long as particles remain visible
      const activeCount = particles.filter(p => p.alpha > 0).length;
      if (activeCount > 0) {
        animationId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-30" />;
}
