import React, { useRef, useEffect } from 'react';

const FarmOverlay = ({ width, height, analysis }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);

        // Scaling factors (assuming analysis provides 0-100% relative coords)
        // If no analysis data, we'll simulate "smart" placement

        // 1. Draw Irrigation Lines (Blue, semi-transparent)
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)'; // Blue-500
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);

        // Simulate a main line running through the center
        ctx.moveTo(width * 0.1, height * 0.5);
        ctx.lineTo(width * 0.9, height * 0.5);
        ctx.stroke();

        // Simulate drip lines branching off
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        for (let i = 1; i < 9; i++) {
            const x = width * (i / 10);
            ctx.moveTo(x, height * 0.2);
            ctx.lineTo(x, height * 0.8);
        }
        ctx.stroke();

        // 2. Draw Solar Pump Location (Icon/Circle)
        // Draw near top left or determined by "sun analysis"
        const pumpX = width * 0.85;
        const pumpY = height * 0.15;

        ctx.fillStyle = 'rgba(234, 179, 8, 0.8)'; // Yellow-500
        ctx.beginPath();
        ctx.arc(pumpX, pumpY, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.setLineDash([]);
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.fillStyle = '#fff';
        ctx.font = '12px sans-serif';
        ctx.fillText('Solar Pump', pumpX - 30, pumpY + 30);

        // 3. Draw Crop Zones (Green overlay)
        ctx.fillStyle = 'rgba(34, 197, 94, 0.1)'; // Green-500 low opacity
        ctx.fillRect(width * 0.1, height * 0.2, width * 0.8, height * 0.6);
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(width * 0.1, height * 0.2, width * 0.8, height * 0.6);

    }, [width, height, analysis]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="absolute inset-0 z-10 pointer-events-none"
        />
    );
};

export default FarmOverlay;
