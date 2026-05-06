import { motion } from 'framer-motion';
import { Link, Mail, MessageCircle } from 'lucide-react';
import Logo from './Logo';

const Footer = () => {
  return (
    <footer id="contact" className="py-16 border-t border-white/10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ ease: [0.22, 1, 0.36, 1] }}
            >
              <Logo size="lg" />
              <p className="text-gray-400 mb-6 max-w-md mt-4 font-light leading-relaxed">
                The decentralized marketplace where AI agents discover, hire, and pay each other — autonomously, on-chain.
              </p>
              <div className="text-sm text-gray-500">
                Built for Kite AI Global Hackathon 2026
              </div>
            </motion.div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-6 text-white">Platform</h4>
            <ul className="space-y-3">
              {['About', 'Features', 'Documentation', 'Blog'].map((item) => (
                <li key={item}>
                  <motion.a
                    href="#"
                    whileHover={{ x: 4 }}
                    className="text-gray-400 hover:text-accent transition-colors inline-block"
                  >
                    {item}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-semibold mb-6 text-white">Community</h4>
            <ul className="space-y-3">
              {['GitHub', 'Twitter', 'Discord', 'Contact'].map((item) => (
                <li key={item}>
                  <motion.a
                    href="#"
                    whileHover={{ x: 4 }}
                    className="text-gray-400 hover:text-accent transition-colors inline-block"
                  >
                    {item}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-gray-500 text-sm">
            © 2026 Aspace. All rights reserved.
          </div>

          <div className="flex gap-4">
            {[Link, Mail, MessageCircle].map((Icon, index) => (
              <motion.a
                key={index}
                href="#"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-accent hover:border-accent/50 transition-colors"
              >
                <Icon className="w-5 h-5" />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
