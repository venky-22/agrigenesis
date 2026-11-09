import React from 'react';
import { ArrowRight, Droplets, Sun, Sprout } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Landing = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12">

            {/* Hero Section */}
            <div className="space-y-6 max-w-4xl relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium"
                >
                    <Sprout className="w-4 h-4" />
                    <span>Hackathon Edition 2026</span>
                </motion.div>

                <motion.h1
                    className="text-5xl md:text-7xl font-bold tracking-tight text-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    Transform Barren Land into <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500">
                        Thriving Farms
                    </span>
                </motion.h1>

                <motion.p
                    className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    Upload a photo of empty land. Our AI analyzes climate, water, and soil data to design a sustainable, profitable farm layout in seconds.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center justify-center gap-4"
                >
                    <Link
                        to="/analyze"
                        className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-white px-8 font-medium text-black transition-all duration-300 hover:bg-white/90 hover:ring-2 hover:ring-white/50 hover:ring-offset-2 hover:ring-offset-background"
                    >
                        <span className="mr-2">Start Analysis</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </motion.div>
            </div>

            {/* Feature Grid */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl pt-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
            >
                <FeatureCard
                    to="/analyze"
                    icon={Sprout}
                    title="1. Plan Farm"
                    desc="Upload a land photo. AI reads it with local weather and drafts a farm blueprint: crop fit, water, irrigation, costs."
                    color="text-green-400"
                    bg="bg-green-500/10"
                />
                <FeatureCard
                    to="/climate-risk"
                    icon={Sun}
                    title="2. Climate Risk"
                    desc="Heat, drought and vegetation stress from 30 days of weather history and the 7-day forecast, plus crops to plant now."
                    color="text-yellow-400"
                    bg="bg-yellow-500/10"
                />
                <FeatureCard
                    to="/crop-care"
                    icon={Droplets}
                    title="3. Crop Care"
                    desc="Through the season: diagnose plant photos, live forecast with frost alerts, yield and cost projections, and a farm chat assistant."
                    color="text-cyan-400"
                    bg="bg-cyan-500/10"
                />
            </motion.div>
        </div>
    );
};

const FeatureCard = ({ to, icon: Icon, title, desc, color, bg }) => (
    <Link to={to} className="block p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors text-left space-y-4">
        <div className={`p-3 rounded-xl w-fit ${bg}`}>
            <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{desc}</p>
        </div>
    </Link>
);

export default Landing;
