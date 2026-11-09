import React, { useState, useRef, useEffect } from 'react';
import { ChevronsLeftRight } from 'lucide-react';

const CompareSlider = ({ beforeImage, afterImage, onOverlayToggle, showOverlay }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);

    const handleDrag = (e) => {
        if (!isDragging || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const percent = (x / rect.width) * 100;

        setSliderPosition(percent);
    };

    const handleMouseDown = () => setIsDragging(true);
    const handleMouseUp = () => setIsDragging(false);

    useEffect(() => {
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleDrag);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full overflow-hidden select-none group cursor-ew-resize"
            onMouseDown={handleMouseDown}
        >
            {/* Before Image (Background) */}
            <img
                src={beforeImage}
                alt="Barren Land"
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Overlay Component (passed as prop to sit on top of Before image but under After image if logic dictates, 
          OR we want Overlay ONLY on the 'Before' side? 
          For now, let's say Overlay is a separate toggle, but if we want it strictly on the 'Plan' side, we might need to adjust.
          Let's assume After Image covers the Before Image.
      */}

            {/* After Image (Foreground - Clipped) */}
            <div
                className="absolute inset-0 w-full h-full overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
                <img
                    src={afterImage}
                    alt="Grown Farm"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Optional: Add 'After' label or specific overlay elements here */}
            </div>

            {/* Slider Handle */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                style={{ left: `${sliderPosition}%` }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg text-black">
                    <ChevronsLeftRight className="w-5 h-5" />
                </div>
            </div>

            {/* Labels */}
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur text-sm font-medium text-white border border-white/10">
                Original
            </div>
            <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-green-500/90 text-sm font-medium text-white shadow-lg pointer-events-none">
                Future Farm
            </div>

        </div>
    );
};

export default CompareSlider;
