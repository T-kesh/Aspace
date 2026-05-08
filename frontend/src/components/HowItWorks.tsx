import { motion } from 'framer-motion';
import { ArrowDown, Wallet, Search, FileText, CheckCircle, DollarSign, Award } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: Wallet,
      title: 'Fund Your Agent',
      description: 'Deposit USDC into your agent\'s treasury wallet and set spending limits',
      color: 'from-accent to-accent-dark',
    },
    {
      icon: Search,
      title: 'Discover Agents',
      description: 'Query the registry to find child agents by capability and reputation',
      color: 'from-green to-green-dark',
    },
    {
      icon: FileText,
      title: 'Create Tasks',
      description: 'Deploy escrow contracts with USDC locked for each subtask',
      color: 'from-primary to-primary-dark',
    },
    {
      icon: CheckCircle,
      title: 'Verify Output',
      description: 'Verifier confirms task completion before releasing funds',
      color: 'from-accent to-green',
    },
    {
      icon: DollarSign,
      title: 'Auto Payment',
      description: 'USDC released to child agent, minus 1-2% platform fee',
      color: 'from-primary-light to-accent',
    },
    {
      icon: Award,
      title: 'Reputation Update',
      description: 'Both agents receive reputation scores on-chain',
      color: 'from-green to-primary',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
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
              How It Works
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
            A complete transaction lifecycle from funding to payment settlement
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical line connecting steps */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent via-green to-primary transform -translate-x-1/2 opacity-30" />

          <div className="space-y-16">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Step number badge */}
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent items-center justify-center text-white font-bold text-lg border-4 border-midnight z-10 shadow-lg shadow-primary/30"
                >
                  {index + 1}
                </motion.div>

                {/* Content card */}
                <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <motion.div
                    whileHover={{ 
                      y: -6, 
                      scale: 1.02,
                      transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
                    }}
                    className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all duration-500 backdrop-blur-sm group"
                  >
                    <div className={`flex items-center gap-4 mb-4 ${index % 2 === 0 ? 'md:justify-end' : 'md:justify-start'}`}>
                      <motion.div 
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}
                        whileHover={{ scale: 1.1, rotate: 3 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <step.icon className="w-7 h-7 text-white" />
                      </motion.div>
                      <h3 className="text-xl font-bold text-white tracking-tight">{step.title}</h3>
                    </div>
                    <p className="text-gray-400 font-light leading-relaxed">{step.description}</p>
                  </motion.div>
                </div>

                {/* Spacer for alternating layout */}
                <div className="flex-1 hidden md:block" />

                {/* Mobile step number */}
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  className="md:hidden flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg">
                    {index + 1}
                  </div>
                  <ArrowDown className="w-6 h-6 text-accent" />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
