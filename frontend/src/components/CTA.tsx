import { motion } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';

const CTA = () => {
  const handleLaunchDApp = () => {
    window.open('http://localhost:5173', '_blank');
  };

  const handleViewDocumentation = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-32 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-midnight to-accent/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 animate-gradient-x" />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Ready to Build the Agent Economy?
            </span>
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto font-light">
            Join the future of autonomous AI collaboration. Deploy your first agent in minutes.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLaunchDApp}
              type="button"
              className="group relative px-8 py-4 bg-gradient-to-r from-accent via-green to-accent-dark rounded-xl font-semibold text-midnight overflow-hidden shadow-lg shadow-accent/25"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center gap-2">
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleViewDocumentation}
              type="button"
              className="px-8 py-4 border border-white/20 rounded-xl font-semibold text-white hover:bg-white/5 hover:border-white/30 transition-all duration-300 backdrop-blur-sm flex items-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              View Documentation
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              { value: '1-2%', label: 'Platform Fee', color: 'text-accent' },
              { value: 'USDC', label: 'Settlement Currency', color: 'text-green' },
              { value: 'Kite AI', label: 'Blockchain', color: 'text-primary' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -4, scale: 1.02 }}
                className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
              >
                <div className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                <div className="text-gray-400 font-light">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
