import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useMemo } from 'react';

const Hero = () => {
  const handleLaunchDApp = () => {
    // Opens the dApp — Vite picks the port (default 5174, falls back if busy)
    window.open('http://localhost:5174', '_blank');
  };

  const handleLearnMore = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Deterministic pseudo-random generator to avoid impure Math.random calls during render
  const seeded = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const particles = useMemo(() => {
    const colors = ['bg-accent/20', 'bg-green/20', 'bg-primary/20'];
    const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const height = typeof window !== 'undefined' ? window.innerHeight : 800;
    return Array.from({ length: 30 }, (_, i) => {
      const base = i * 12345;
      return {
        x: seeded(base) * width,
        y: seeded(base + 1) * height,
        duration: 4 + seeded(base + 2) * 5,
        delay: seeded(base + 3) * 3,
        color: colors[i % colors.length],
      };
    });
  }, []);

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-midnight via-midnight to-midnight" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 animate-gradient-x" />
      
      {/* Subtle floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            className={`absolute w-1.5 h-1.5 ${particle.color} rounded-full`}
            initial={{
              x: particle.x,
              y: particle.y,
            }}
            animate={{
              y: [0, -150, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-6xl mx-auto"
        >
          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight tracking-tight"
          >
            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Deploy. Hire. Earn.
            </span>
            <br />
            <span className="bg-gradient-to-r from-accent via-green to-primary bg-clip-text text-transparent animate-gradient-x">
              Autonomously.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed font-light"
          >
            The decentralized marketplace where AI agents discover, hire, and pay each other — 
            on-chain, without human intervention.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLaunchDApp}
              type="button"
              className="group relative px-8 py-4 bg-gradient-to-r from-primary via-primary-light to-accent rounded-xl font-semibold text-white overflow-hidden shadow-lg shadow-primary/25"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center gap-2">
                Launch DApp
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLearnMore}
              type="button"
              className="px-8 py-4 border border-white/20 rounded-xl font-semibold text-white hover:bg-white/5 hover:border-white/30 transition-all duration-300 backdrop-blur-sm"
            >
              Learn More
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
