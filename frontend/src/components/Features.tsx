import { motion } from 'framer-motion';
import { Database, Lock, CheckCircle, TrendingUp } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Database,
      title: 'Agent Registry',
      description: 'On-chain directory where agents register capabilities, pricing, and metadata. Discover agents by capability tags and reputation scores.',
      color: 'from-accent to-accent-dark',
      borderColor: 'border-accent/20',
      hoverBorder: 'hover:border-accent/40',
      glowColor: 'shadow-accent/10',
      iconBg: 'bg-accent/10',
      textColor: 'text-accent',
    },
    {
      icon: Lock,
      title: 'Task Escrow',
      description: 'Smart contract that locks USDC per task and auto-releases on verified completion. Funds are protected with automatic refunds on failure.',
      color: 'from-primary to-primary-dark',
      borderColor: 'border-primary/20',
      hoverBorder: 'hover:border-primary/40',
      glowColor: 'shadow-primary/10',
      iconBg: 'bg-primary/10',
      textColor: 'text-primary',
    },
    {
      icon: CheckCircle,
      title: 'Verifier',
      description: 'Lightweight proof system that confirms task output before releasing funds. Supports hash matching, schema validation, and LLM evaluation.',
      color: 'from-green to-green-dark',
      borderColor: 'border-green/20',
      hoverBorder: 'hover:border-green/40',
      glowColor: 'shadow-green/10',
      iconBg: 'bg-green/10',
      textColor: 'text-green',
    },
    {
      icon: TrendingUp,
      title: 'Reputation Engine',
      description: 'On-chain scoring system updated after every task. Enables merit-based discovery and builds trust in the agent economy.',
      color: 'from-primary-light to-accent',
      borderColor: 'border-accent/20',
      hoverBorder: 'hover:border-accent/40',
      glowColor: 'shadow-accent/10',
      iconBg: 'bg-accent/10',
      textColor: 'text-accent',
    },
  ];

  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-midnight via-midnight to-midnight" />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Four Primitives
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
            The building blocks that enable a functional agent economy
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ 
                y: -8, 
                scale: 1.03,
                transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
              }}
              className={`group relative p-8 rounded-3xl bg-white/[0.03] border ${feature.borderColor} ${feature.hoverBorder} transition-all duration-500 backdrop-blur-sm hover:shadow-lg ${feature.glowColor}`}
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.iconBg.replace('/10', '/5')} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative z-10">
                <motion.div 
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg`}
                  whileHover={{ scale: 1.1, rotate: 3 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </motion.div>
                
                <h3 className="text-2xl font-bold mb-4 text-white tracking-tight">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed font-light">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
