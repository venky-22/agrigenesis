import React, { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const ImageUpload = ({ onImageSelect }) => {
    const [preview, setPreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = (file) => {
        if (!file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
            onImageSelect({ file, preview: reader.result });
        };
        reader.readAsDataURL(file);
    };

    const clearImage = (e) => {
        e.stopPropagation();
        setPreview(null);
        onImageSelect(null);
    };

    return (
        <div className="w-full">
            <div
                className={cn(
                    "relative border-2 border-dashed rounded-2xl transition-all duration-300 ease-in-out min-h-[300px] flex flex-col items-center justify-center p-8 cursor-pointer group overflow-hidden bg-white/5",
                    isDragging ? "border-green-500 bg-green-500/10" : "border-white/20 hover:border-green-400/50 hover:bg-white/10",
                    preview ? "border-transparent" : ""
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !preview && document.getElementById('file-upload').click()}
            >
                <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleChange}
                />

                {preview ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <img
                            src={preview}
                            alt="Uploaded land"
                            className="max-h-[300px] rounded-lg shadow-2xl object-cover"
                        />
                        <button
                            onClick={clearImage}
                            className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-red-500/80 rounded-full text-white transition-colors backdrop-blur-sm"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur px-4 py-2 rounded-full text-sm font-medium text-white flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-green-400" />
                            Image Ready for Analysis
                        </div>
                    </div>
                ) : (
                    <div className="text-center space-y-4 pointer-events-none">
                        <div className={cn(
                            "w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto transition-transform duration-300 group-hover:scale-110",
                            isDragging ? "bg-green-500/20" : ""
                        )}>
                            <Upload className={cn(
                                "w-10 h-10 text-muted-foreground transition-colors",
                                isDragging ? "text-green-400" : "group-hover:text-foreground"
                            )} />
                        </div>
                        <div>
                            <p className="text-lg font-medium text-foreground">Drag and drop your land image</p>
                            <p className="text-sm text-muted-foreground mt-2">or click to browse from device</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageUpload;
