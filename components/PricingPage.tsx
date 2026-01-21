import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatedGlowingButton } from './ui/AnimatedGlowingButton';
import { ArrowLeft, Check, BrainCircuit, PenTool, FileSpreadsheet } from 'lucide-react';
import { motion } from 'framer-motion';

export const PricingPage: React.FC = () => {
   const navigate = useNavigate();

   return (
      <div className="h-screen w-full bg-dark-900 text-white overflow-y-auto custom-scrollbar relative">
         {/* Header */}
         <nav className="sticky top-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center">
            <button
               onClick={() => navigate('/')}
               className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
               <ArrowLeft size={20} />
               <span className="font-medium">Back to Home</span>
            </button>
            <div className="flex items-center gap-4">
               {/* Updated Login Button with Animated Border */}
               <AnimatedGlowingButton
                  onClick={() => navigate('/login')}
                  className="px-6 py-2"
               >
                  Login
               </AnimatedGlowingButton>
            </div>
         </nav>

         <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="text-center mb-16">
               <h1 className="text-4xl md:text-6xl font-bold mb-6">Simple, Transparent Pricing</h1>
               <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                  One subscription. Complete access to professional estimation and annotation tools.
               </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
               {/* Product Content */}
               <div className="space-y-12">
                  <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     className="bg-dark-800/50 p-8 rounded-2xl border border-white/5"
                  >
                     <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-brand-500/10 rounded-xl text-brand-500">
                           <PenTool size={24} />
                        </div>
                        <h2 className="text-2xl font-bold">Annotation Suite</h2>
                     </div>
                     <p className="text-gray-300 leading-relaxed text-lg">
                        Our annotation engine is built specifically for architectural accuracy. Unlike generic PDF editors,
                        KABS allows you to set scale, manage distinct visibility layers (for electrical, plumbing, or layout),
                        and export high-resolution documents. It is the foundation of precise project planning.
                     </p>
                  </motion.div>

                  <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     className="bg-dark-800/50 p-8 rounded-2xl border border-white/5"
                  >
                     <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                           <BrainCircuit size={24} />
                        </div>
                        <h2 className="text-2xl font-bold">Pricing AI Agent</h2>
                     </div>
                     <p className="text-gray-300 leading-relaxed text-lg mb-4">
                        The Pricing AI is not just a calculator; it is an advanced <strong>AI Agent</strong> designed to provide accurate
                        estimates based on your uploaded PDF plans or Excel datasets.
                     </p>
                     <p className="text-gray-300 leading-relaxed text-lg">
                        By analyzing your documents, the AI identifies material requirements, understands construction contexts,
                        and cross-references data to generate reliable estimates. Whether you are working with complex blueprints
                        or raw data sheets, the AI Agent acts as your virtual quantity surveyor, ensuring no detail is overlooked.
                     </p>
                     <div className="mt-6 flex gap-3 text-sm text-gray-400">
                        <span className="flex items-center gap-2"><FileSpreadsheet size={16} /> Excel Analysis</span>
                        <span className="flex items-center gap-2"><PenTool size={16} /> PDF Parsing</span>
                     </div>
                  </motion.div>
               </div>

               {/* Pricing Section */}
               <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  className="sticky top-24 space-y-8"
               >
                  <div className="bg-gradient-to-b from-brand-900/20 to-dark-800 border border-brand-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4">
                        <span className="bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                           Team Based
                        </span>
                     </div>

                     <h3 className="text-2xl font-bold text-white mb-6">Team Subscription</h3>

                     {/* Tier 1 */}
                     <div className="mb-6 pb-6 border-b border-white/10">
                        <div className="flex justify-between items-end mb-2">
                           <span className="text-lg font-medium text-gray-200">1-3 Licenses</span>
                           <span className="text-3xl font-bold text-white">$49</span>
                        </div>
                     </div>

                     {/* Tier 2 */}
                     <div className="mb-6 pb-6 border-b border-white/10">
                        <div className="flex justify-between items-end mb-2">
                           <span className="text-lg font-medium text-gray-200">4-6 Licenses</span>
                           <span className="text-3xl font-bold text-white">$69</span>
                        </div>
                     </div>

                     {/* Tier 3 */}
                     <div className="mb-8">
                        <div className="flex justify-between items-end mb-2">
                           <span className="text-lg font-medium text-gray-200">7-9 Licenses</span>
                           <span className="text-3xl font-bold text-white">$89</span>
                        </div>
                     </div>

                     <ul className="space-y-4 mb-10">
                        {[
                           'Unlimited PDF Projects',
                           'Advanced Vector Annotation Tools',
                           'Scout AI Agent (PDF & Excel)',
                           'High-Res 4K Exports',
                           'Cloud Storage & Sync',
                           'Priority Email Support'
                        ].map((feature, i) => (
                           <li key={i} className="flex items-center gap-3 text-gray-200">
                              <Check size={18} className="text-brand-500 shrink-0" />
                              <span>{feature}</span>
                           </li>
                        ))}
                     </ul>

                     {/* Updated Subscribe Button to External Stripe Link */}
                     <AnimatedGlowingButton
                        className="w-full text-lg py-6 font-bold"
                        onClick={() => window.open('https://buy.stripe.com/5kQ7sN4vZf805NFgyNgMw0s', '_blank')}
                     >
                        Get Started
                     </AnimatedGlowingButton>

                     <p className="text-center text-xs text-gray-500 mt-4">
                        Secure payment via Stripe. Cancel anytime.
                     </p>
                  </div>
               </motion.div>
            </div>
         </div>
      </div>
   );
};
