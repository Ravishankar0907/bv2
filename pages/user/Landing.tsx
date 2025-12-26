import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Calendar, Zap } from 'lucide-react';
import { Button } from '../../components/UI';

const Landing: React.FC<{ onExplore: () => void }> = ({ onExplore }) => {
  return (
    <div className="space-y-24">
      {/* Hero */}
      <section className="relative flex flex-col lg:flex-row items-center gap-12 mt-10">
        <div className="flex-1 space-y-8 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              Level up your <span className="text-brand-400">gaming</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-lg text-slate-400 max-w-xl"
          >
            Experience the power of PS5 and PS4 consoles without the commitment of buying. Rent by the week or month. Verified quality, pre-loaded games, instant approval.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Button onClick={onExplore} className="text-lg px-8 py-4">
              Book Now <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>

        <motion.div
          className="flex-1 relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/20 rounded-full blur-[100px] -z-10" />
          <img
            src="https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
            alt="PlayStation 5"
            className="rounded-3xl shadow-2xl shadow-brand-500/20 border border-slate-700/50 w-full object-cover h-[500px]"
          />
          <div className="absolute -bottom-6 -left-6 bg-dark-card p-6 rounded-2xl border border-slate-700 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/10 p-2 rounded-lg text-green-500"><Star fill="currentColor" /></div>
              <div>
                <p className="font-bold text-xl">4.9/5</p>
                <p className="text-xs text-slate-400">Gamer Rating</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: Zap, title: "Instant Access", desc: "Browse, verify, and rent in minutes." },
          { icon: Calendar, title: "Flexible Rentals", desc: "Rent by the week or month. Extend your plan anytime." },
          { icon: Star, title: "Premium Quality", desc: "Consoles cleaned and tested before every delivery." },
        ].map((feat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="bg-dark-card/50 p-8 rounded-2xl border border-slate-800 hover:border-brand-500/30 transition-colors"
          >
            <feat.icon className="w-10 h-10 text-brand-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">{feat.title}</h3>
            <p className="text-slate-400">{feat.desc}</p>
          </motion.div>
        ))}
      </section>
    </div>
  );
};

export default Landing;