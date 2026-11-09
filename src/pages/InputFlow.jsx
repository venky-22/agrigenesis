import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Sprout, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ImageUpload from '../components/ImageUpload';

const CROPS = [
    { id: 'wheat', name: 'Wheat', emoji: '🌾' },
    { id: 'corn', name: 'Corn', emoji: '🌽' },
    { id: 'tomato', name: 'Tomato', emoji: '🍅' },
    { id: 'rice', name: 'Rice', emoji: '🍚' },
    { id: 'cotton', name: 'Cotton', emoji: '🧵' },
    { id: 'soybean', name: 'Soybean', emoji: '🌱' },
];

const InputFlow = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        image: null,
        crop: '',
        location: '',
    });
    const [isLocating, setIsLocating] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleImageSelect = (imageData) => {
        setFormData(prev => ({ ...prev, image: imageData }));
    };

    const handleLocation = async () => {
        setIsLocating(true);

        // Helper to set location friendly name
        const setFriendlyLocation = async (lat, lon) => {
            try {
                const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
                const data = await res.json();
                const locString = data.city || data.locality || `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
                setFormData(prev => ({ ...prev, location: locString }));
            } catch (e) {
                setFormData(prev => ({ ...prev, location: `${lat.toFixed(4)}, ${lon.toFixed(4)}` }));
            }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setFriendlyLocation(latitude, longitude);
                    setIsLocating(false);
                },
                async (error) => {
                    console.warn("Geolocation failed, trying IP fallback...", error);
                    try {
                        const res = await fetch('https://ipapi.co/json/');
                        const data = await res.json();
                        setFormData(prev => ({ ...prev, location: `${data.city}, ${data.region}` }));
                    } catch (err) {
                        console.error("IP Fallback failed", err);
                        alert("Could not detect location. Please enter manually.");
                    }
                    setIsLocating(false);
                },
                { timeout: 5000 }
            );
        } else {
            // Fallback immediately if no geolocation support
            try {
                const res = await fetch('https://ipapi.co/json/');
                const data = await res.json();
                setFormData(prev => ({ ...prev, location: `${data.city}, ${data.region}` }));
            } catch (err) {
                alert("Could not detect location. Please enter manually.");
            }
            setIsLocating(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        // Simulate processing delay for "Effect"
        setTimeout(() => {
            setLoading(false);
            navigate('/dashboard', { state: { ...formData } });
        }, 2000);
    };

    const isFormValid = formData.image && formData.crop && formData.location;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Configure Your Farm</h2>
                <p className="text-muted-foreground">Upload land and set parameters for AI Analysis</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Col: Image Upload */}
                <div className="space-y-4">
                    <label className="text-sm font-medium text-muted-foreground ml-1">1. Upload Land Image</label>
                    <ImageUpload onImageSelect={handleImageSelect} />
                </div>

                {/* Right Col: Parameters */}
                <div className="space-y-8">
                    {/* Location */}
                    <div className="space-y-4">
                        <label className="text-sm font-medium text-muted-foreground ml-1">2. Location</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Enter location or use auto-detect"
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all font-medium"
                                value={formData.location}
                                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                            />
                            <button
                                onClick={handleLocation}
                                disabled={isLocating}
                                className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors tooltip"
                                title="Auto-detect location"
                            >
                                {isLocating ? <Loader2 className="w-5 h-5 animate-spin text-green-400" /> : <MapPin className="w-5 h-5 text-green-400" />}
                            </button>
                        </div>
                    </div>

                    {/* Crop Selection */}
                    <div className="space-y-4">
                        <label className="text-sm font-medium text-muted-foreground ml-1">3. Select Crop</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {CROPS.map((crop) => (
                                <button
                                    key={crop.id}
                                    onClick={() => setFormData(prev => ({ ...prev, crop: crop.id }))}
                                    className={`
                             relative p-3 rounded-xl border transition-all text-left space-y-2
                             ${formData.crop === crop.id
                                            ? 'bg-green-500/20 border-green-500/50 ring-1 ring-green-500/50'
                                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                        }
                        `}
                                >
                                    <div className="text-2xl">{crop.emoji}</div>
                                    <div className={`text-sm font-medium ${formData.crop === crop.id ? 'text-green-400' : 'text-muted-foreground'}`}>{crop.name}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="pt-8 flex justify-end border-t border-white/5">
                <button
                    onClick={handleSubmit}
                    disabled={!isFormValid || loading}
                    className={`
                group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300
                ${isFormValid && !loading
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-[1.02]'
                            : 'bg-white/5 text-muted-foreground cursor-not-allowed'
                        }
            `}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Analyzing Land...</span>
                        </>
                    ) : (
                        <>
                            <span>Generate Blueprint</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default InputFlow;
