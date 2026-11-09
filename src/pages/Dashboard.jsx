import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { geocode } from '../features/crop-care/services/weatherService';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Wind, Sun, DollarSign, Activity, Layers, ArrowLeft, Thermometer, MapPin, Play, Wand2, FileVideo, Loader2, X } from 'lucide-react';
import { getClimateData } from '../services/weather';
import { analyzeFarm } from '../services/gemini';
import { generateProImage, generateLocalGreenery } from '../services/imageGen';
import { generateFarmVideo } from '../services/videoGen';
import FarmOverlay from '../components/FarmOverlay';
import CompareSlider from '../components/CompareSlider';

const Dashboard = () => {
    const location = useLocation();
    const [coords, setCoords] = useState(null);
    const { image, crop, location: loc } = location.state || {};
    const [loading, setLoading] = useState(true);
    const [climate, setClimate] = useState(null);
    const [analysis, setAnalysis] = useState(null);

    // Visual States
    const [viewMode, setViewMode] = useState('original');
    const [isSimulating, setIsSimulating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null);

    // Video States
    const [videoUrl, setVideoUrl] = useState(null);
    const [videoLoading, setVideoLoading] = useState(false);
    const [showVideo, setShowVideo] = useState(false);

    // API Keys (from .env)
    const hfToken = import.meta.env.VITE_HF_TOKEN || '';
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    const [generating, setGenerating] = useState(false);

    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const originalImageRef = useRef(null);

    useEffect(() => {
        if (containerRef.current) {
            setDimensions({
                width: containerRef.current.offsetWidth,
                height: containerRef.current.offsetHeight
            });
        }
    }, [loading, viewMode]);

    useEffect(() => {
        if (!image || !crop || !loc) return;

        const fetchData = async () => {
            try {
                // Works for "lat, lon" and for place names like "Truro, Nova Scotia"
                let lat = 44.6488, lon = -63.5752; // Halifax fallback
                try {
                    ({ lat, lon } = await geocode(loc));
                } catch (e) {
                    console.warn("Geocoding failed, using Halifax:", e.message);
                }
                setCoords({ lat, lon });

                const weatherData = await getClimateData(lat, lon);
                setClimate(weatherData);

                if (image?.preview) {
                    const geminiResults = await analyzeFarm(image.preview, crop, loc, weatherData);
                    setAnalysis(geminiResults);
                }

            } catch (err) {
                console.error("Analysis Failed", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [image, crop, loc]);

    const handleGenerateValues = async () => {
        setGenerating(true);
        try {
            // 1. Local Greenery
            if (originalImageRef.current) {
                const localResult = generateLocalGreenery(originalImageRef.current);
                setGeneratedImage(localResult);
            }

            // 2. Pro Mode if Token
            if (hfToken) {
                localStorage.setItem('hf_token', hfToken);
                const proResult = await generateProImage(image.preview, `field of ${crop} plants`, hfToken);
                setGeneratedImage(proResult);
            }
        } catch (e) {
            console.error("Gen failed", e);
        } finally {
            setGenerating(false);
            setViewMode('compare');
        }
    };

    const handleVideoGeneration = async () => {
        if (videoUrl) {
            setShowVideo(true);
            return;
        }

        setVideoLoading(true);
        try {
            // Tries Veo -> HF SVD -> Local demo video fallback
            const url = await generateFarmVideo(image.preview, `${crop} farm with irrigation`, { geminiKey, hfToken });

            setVideoUrl(url);
            setShowVideo(true);
        } catch (err) {
            console.error("Video Gen Error", err);
            alert(`Video Generation Failed: ${err.message}`);
        } finally {
            setVideoLoading(false);
        }
    };

    const handleSimulate = () => {
        setIsSimulating(true);
        if (!generatedImage) {
            handleGenerateValues().then(() => setIsSimulating(false));
        } else {
            setTimeout(() => {
                setViewMode('compare');
                setIsSimulating(false);
            }, 1500);
        }
    };

    if (!location.state) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <h2 className="text-2xl font-bold">No Data Found</h2>
                <Link to="/analyze" className="text-green-400 hover:underline">Start Analysis</Link>
            </div>
        )
    }

    return (
        <div className="space-y-8 relative">
            <img ref={originalImageRef} src={image?.preview} className="hidden" alt="hidden_ref" />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Link to="/analyze" className="text-sm text-muted-foreground hover:text-white flex items-center gap-1 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Input
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Farm Blueprint: {crop.toUpperCase()}</h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/5 flex items-center gap-2">
                            <MapPin className="w-3 h-3" /> {loc}
                        </span>
                        {climate && (
                            <span className="flex items-center gap-2">
                                <Thermometer className="w-3 h-3" /> {climate.currentTemp}{climate.units.temperature_2m}
                            </span>
                        )}
                    </div>
                </div>

                {/* Hand the same crop + place to the other two tools */}
                <div className="flex flex-wrap gap-2 text-sm">
                    <Link
                        to={`/climate-risk?${new URLSearchParams({ crop, ...(coords ? { lat: coords.lat.toFixed(4), lon: coords.lon.toFixed(4) } : {}) })}`}
                        className="px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        Check climate risk →
                    </Link>
                    <Link
                        to={`/crop-care?${new URLSearchParams({ crop, location: loc, acres: String(Math.round(analysis?.estimated_land_area_acres || 10)) })}`}
                        className="px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10 text-green-300 hover:bg-green-500/20 transition-colors"
                    >
                        Start crop care →
                    </Link>
                </div>
            </div>


            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loader"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center min-h-[50vh] space-y-8"
                    >
                        <div className="relative w-24 h-24">
                            <div className="absolute inset-0 border-4 border-green-500/20 rounded-full animate-pulse"></div>
                            <div className="absolute inset-0 border-t-4 border-green-400 rounded-full animate-spin"></div>
                            <Activity className="absolute inset-0 m-auto w-8 h-8 text-green-400 animate-pulse" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-semibold">Analyzing Topography...</h3>
                            <p className="text-muted-foreground animate-pulse text-sm">Calculating water tables • Checking soil pH • Optimizing irrigation crop rotation</p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                        {/* Main Visualizer (Left - 2 Cols) */}
                        <div className="lg:col-span-2 space-y-6">
                            <div
                                ref={containerRef}
                                className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 group bg-black"
                            >
                                {/* Video Modal Overlay */}
                                <AnimatePresence>
                                    {showVideo && (
                                        <motion.div
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            className="absolute inset-0 z-50 bg-black flex items-center justify-center overflow-hidden"
                                        >
                                            <button
                                                onClick={() => setShowVideo(false)}
                                                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-white/20 z-50"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>

                                            <video
                                                src={videoUrl}
                                                controls
                                                autoPlay
                                                loop
                                                className="w-full h-full object-contain"
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>


                                {viewMode === 'compare' && generatedImage ? (
                                    <CompareSlider
                                        beforeImage={image?.preview}
                                        afterImage={generatedImage}
                                    />
                                ) : (
                                    <>
                                        <img
                                            src={image?.preview}
                                            alt="Farm"
                                            className={`w-full h-full object-cover transition-opacity duration-500 ${isSimulating ? 'opacity-50 blur-sm' : 'opacity-100'}`}
                                        />
                                        {viewMode === 'blueprint' && (
                                            <FarmOverlay
                                                width={dimensions.width}
                                                height={dimensions.height}
                                                analysis={analysis}
                                            />
                                        )}
                                    </>
                                )}

                                {/* Loading States */}
                                {(isSimulating || generating || videoLoading) && (
                                    <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/60 backdrop-blur-sm">
                                        <div className="text-center space-y-4">
                                            <span className="text-4xl animate-bounce">
                                                {videoLoading ? '🎥' : '✨'}
                                            </span>
                                            <p className="text-lg font-bold text-green-400">
                                                {videoLoading ? "Generating Veo Video (this may take a minute)..." :
                                                    generating ? "Creating Simulation..." : "Simulating Growth..."}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Overlay UI Controls */}
                                <div className="absolute top-4 left-4 flex gap-2 z-20">
                                    <button
                                        onClick={() => setViewMode('original')}
                                        className={`px-3 py-1.5 rounded-full backdrop-blur text-sm font-medium border border-white/10 transition-colors 
                            ${viewMode === 'original' ? 'bg-white text-black' : 'bg-black/60 text-white hover:bg-black/80'}`}
                                    >
                                        Original
                                    </button>
                                    <button
                                        onClick={() => setViewMode('blueprint')}
                                        className={`px-3 py-1.5 rounded-full backdrop-blur text-sm font-medium border border-white/10 transition-colors flex items-center gap-2
                            ${viewMode === 'blueprint' ? 'bg-blue-500 text-white' : 'bg-black/60 text-white hover:bg-black/80'}`}
                                    >
                                        <Layers className="w-3 h-3" />
                                        Blueprint
                                    </button>
                                    {generatedImage && (
                                        <button
                                            onClick={() => setViewMode('compare')}
                                            className={`px-3 py-1.5 rounded-full backdrop-blur text-sm font-medium border border-white/10 transition-colors flex items-center gap-2
                                ${viewMode === 'compare' ? 'bg-green-500 text-white' : 'bg-black/60 text-white hover:bg-black/80'}`}
                                        >
                                            <Sun className="w-3 h-3" />
                                            Growth View
                                        </button>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="absolute bottom-4 right-4 z-20 flex gap-3">
                                    <button
                                        onClick={handleVideoGeneration}
                                        disabled={videoLoading}
                                        className="px-4 py-2 rounded-full bg-blue-600 text-white font-semibold shadow-xl hover:scale-105 transition-transform flex items-center gap-2 disabled:opacity-50 disabled:scale-100"
                                    >
                                        {videoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileVideo className="w-4 h-4" />}
                                        <span>{videoUrl ? "Watch Video" : "Generate Veo Video"}</span>
                                    </button>

                                    {viewMode !== 'compare' && (
                                        <button
                                            onClick={handleSimulate}
                                            className="px-4 py-2 rounded-full bg-white text-black font-semibold shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
                                        >
                                            <Wand2 className="w-4 h-4" />
                                            <span>Visualize Growth</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                <MetricCard
                                    label="Land Area"
                                    value={`${analysis?.estimated_land_area_acres?.toFixed(1) || '12.5'}`}
                                    sub="acres"
                                    icon={Layers}
                                    color="text-purple-400"
                                />
                                <MetricCard
                                    label="Water Need"
                                    value={`${(analysis?.water_requirement_liters_per_season / 1000).toFixed(1)}k L` || "N/A"}
                                    sub="/ season"
                                    icon={Droplets}
                                    color="text-blue-400"
                                />
                                <MetricCard
                                    label="Suitability"
                                    value={`${analysis?.suitability_score || 0}%`}
                                    sub={analysis?.suitability_score > 80 ? "Excellent" : "Average"}
                                    icon={Sun}
                                    color="text-yellow-400"
                                />
                                <MetricCard
                                    label="Profit Est."
                                    value={`$${(analysis?.predicted_yield_value_usd / 1000).toFixed(1)}k`}
                                    sub="/ harvest"
                                    icon={DollarSign}
                                    color="text-green-400"
                                />
                                <MetricCard
                                    label="Risk"
                                    value={analysis?.groundwater_stress_level || "Low"}
                                    sub="Groundwater"
                                    icon={Wind}
                                    color="text-teal-400"
                                />
                            </div>
                        </div>

                        {/* Recommendations Panel (Right - 1 Col) */}
                        <div className="space-y-6">
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-green-400" />
                                    AI Insights
                                </h3>

                                <div className="space-y-4">
                                    <InsightItem
                                        title="Irrigation Strategy"
                                        desc={analysis?.irrigation_strategy || "Analysis pending..."}
                                    />
                                    <InsightItem
                                        title="Soil Upgrade"
                                        desc={analysis?.soil_amendment || "Analysis pending..."}
                                    />
                                    <InsightItem
                                        title="Risk Factor"
                                        desc={analysis?.risk_analysis || "Calculating..."}
                                    />
                                </div>

                                <div className="pt-4 border-t border-white/5">
                                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Equipment Needed</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis?.equipment_needed?.map((item, i) => (
                                            <Tag key={i}>{item}</Tag>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/20 relative overflow-hidden">
                                <div className="relative z-10 space-y-2">
                                    <h3 className="font-semibold text-green-100">Sustainability Score</h3>
                                    <div className="flex items-end gap-2">
                                        <span className={`text-4xl font-bold ${sustainabilityGrade(analysis?.sustainability_score).color}`}>
                                            {sustainabilityGrade(analysis?.sustainability_score).grade}
                                        </span>
                                        <span className="text-sm text-green-200/60 mb-1">
                                            {analysis?.sustainability_score != null ? `${Math.round(analysis.sustainability_score)}/100` : ''}
                                        </span>
                                    </div>
                                    <p className="text-sm text-green-200/80">
                                        {analysis?.sustainability_score_details || "Calculating impact..."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const MetricCard = ({ label, value, sub, icon: Icon, color }) => (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors space-y-2">
        <div className="flex justify-between items-start">
            <span className="text-sm text-muted-foreground">{label}</span>
            <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <div>
            <div className="text-xl font-bold">{value}</div>
            <div className="text-xs text-muted-foreground">{sub}</div>
        </div>
    </div>
);

const InsightItem = ({ title, desc }) => (
    <div className="space-y-1">
        <h4 className="text-sm font-medium text-white">{title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </div>
);

const Tag = ({ children }) => (
    <span className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-xs text-muted-foreground">
        {children}
    </span>
);

export default Dashboard;

// Letter grade from the AI's 0-100 sustainability score
function sustainabilityGrade(score) {
    if (score == null || Number.isNaN(Number(score))) return { grade: '–', color: 'text-muted-foreground' };
    const n = Number(score);
    if (n >= 90) return { grade: 'A+', color: 'text-green-400' };
    if (n >= 80) return { grade: 'A', color: 'text-green-400' };
    if (n >= 70) return { grade: 'B', color: 'text-lime-400' };
    if (n >= 60) return { grade: 'C', color: 'text-yellow-400' };
    if (n >= 50) return { grade: 'D', color: 'text-orange-400' };
    return { grade: 'F', color: 'text-red-400' };
}
