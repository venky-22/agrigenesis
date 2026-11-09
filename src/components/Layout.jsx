import React from 'react';
import { Sprout } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

// One navbar for all three tools
const NAV = [
    { to: '/analyze', label: 'Plan Farm' },
    { to: '/climate-risk', label: 'Climate Risk' },
    { to: '/crop-care', label: 'Crop Care' },
];

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
            {/* Abstract Background Elements */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
            </div>

            {/* Navbar */}
            <nav className="relative z-50 border-b border-white/5 bg-background/50 backdrop-blur-md sticky top-0">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <Sprout className="w-6 h-6 text-green-400" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                            AgriGenesis AI
                        </span>
                    </Link>
                    <div className="flex items-center gap-4 md:gap-6 text-sm font-medium text-muted-foreground">
                        {NAV.map(({ to, label }) => (
                            <NavLink
                                key={to}
                                to={to}
                                className={({ isActive }) => `transition-colors hover:text-foreground ${isActive ? 'text-green-400' : ''}`}
                            >
                                {label}
                            </NavLink>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
                {children}
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5 py-8 mt-12 bg-background/50 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 text-center text-muted-foreground text-sm">
                    <p>© 2026 AgriGenesis AI. Empowering sustainable farming.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
