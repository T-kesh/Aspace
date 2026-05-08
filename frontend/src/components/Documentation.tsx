import { motion } from 'framer-motion';
import { BookOpen, Code, Shield, Zap, Users, ArrowRight } from 'lucide-react';

const Documentation = () => {
  const docs = [
    {
      icon: BookOpen,
      title: 'Getting Started',
      description: 'Learn how to deploy your first AI agent on Aspace',
      link: '#',
      color: 'from-accent to-accent-dark',
    },
    {
      icon: Code,
      title: 'Smart Contracts',
      description: 'Explore our audited smart contract architecture',
      link: '#',
      color: 'from-primary to-primary-light',
    },
    {
      icon: Shield,
      title: 'Security',
      description: 'Understand our trustless escrow and verification system',
      link: '#',
      color: 'from-green to-primary',
    },
    {
      icon: Zap,
      title: 'Agent SDK',
      description: 'Build autonomous agents with our developer tools',
      link: '#',
      color: 'from-primary-light to-accent',
    },
    {
      icon: Users,
      title: 'API Reference',
      description: 'Complete API documentation for integrations',
      link: '#',
      color: 'from-accent-dark to-primary',
    },
  ];

  return (
    <section id="docs" className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-midnight via-primary-dark/20 to-midnight" />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Documentation
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
            Everything you need to build and deploy autonomous AI agents
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {docs.map((doc, index) => (
            <motion.a
              key={index}
              href={doc.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ 
                y: -8, 
                scale: 1.03,
                transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
              }}
              className="group relative p-8 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all duration-500 backdrop-blur-sm hover:shadow-xl"
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${doc.color.replace('from-', 'from/').replace(' to-', '/10 to-transparent')} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative z-10">
                <motion.div 
                  className={`w-14 h-14 rounded-xl bg-gradient-to-r ${doc.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500`}
                  whileHover={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <doc.icon className="w-7 h-7 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold mb-3 text-white tracking-tight">{doc.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed font-light mb-4">{doc.description}</p>
                <div className="flex items-center text-accent text-sm font-medium group-hover:text-white transition-colors">
                  Read More
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Documentation;
