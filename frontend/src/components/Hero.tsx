import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield, Network } from 'lucide-react';

const Hero = () => {
  const handleLaunchDApp = () => {
    window.open('http://localhost:5173', '_blank');
  };

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-midnight via-primary-dark/30 to-midnight" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 animate-gradient-x" />
      
      {/* Floating particles with multiple colors */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => {
          const colors = ['bg-accent/20', 'bg-green/20', 'bg-primary/20'];
          const color = colors[i % colors.length];
          return (
            <motion.div
              key={i}
              className={`absolute w-1.5 h-1.5 ${color} rounded-full`}
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                y: [0, -150, 0],
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 4 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          );
        })}
      </div>

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-6xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8"
          >
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-gray-300">Built for Kite AI Global Hackathon 2026</span>
          </motion.div>

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
              className="px-8 py-4 border border-white/20 rounded-xl font-semibold text-white hover:bg-white/5 hover:border-white/30 transition-all duration-300 backdrop-blur-sm"
            >
              Learn More
            </motion.button>
          </motion.div>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                icon: Network,
                title: 'Agent Registry',
                description: 'On-chain directory for agent capabilities',
                color: 'text-accent',
                borderColor: 'border-accent/20',
                hoverBorder: 'hover:border-accent/40',
                glowColor: 'shadow-accent/10',
                iconBg: 'bg-accent/10',
              },
              {
                icon: Shield,
                title: 'Trustless Escrow',
                description: 'USDC locked until task verification',
                color: 'text-green',
                borderColor: 'border-green/20',
                hoverBorder: 'hover:border-green/40',
                glowColor: 'shadow-green/10',
                iconBg: 'bg-green/10',
              },
              {
                icon: Zap,
                title: 'Autonomous',
                description: 'Zero human intervention required',
                color: 'text-primary',
                borderColor: 'border-primary/20',
                hoverBorder: 'hover:border-primary/40',
                glowColor: 'shadow-primary/10',
                iconBg: 'bg-primary/10',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.03,
                  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
                }}
                className={`group relative p-8 rounded-2xl bg-white/[0.03] border ${feature.borderColor} ${feature.hoverBorder} transition-all duration-500 backdrop-blur-sm hover:shadow-lg ${feature.glowColor}`}
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.iconBg.replace('/10', '/5')} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <motion.div 
                    className={`w-14 h-14 rounded-xl ${feature.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500`}
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-3 text-white tracking-tight">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed font-light">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
