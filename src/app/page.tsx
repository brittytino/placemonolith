'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Shield, TrendingUp, Users, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const heroRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-badge', {
        scale: 0,
        opacity: 0,
        duration: 0.6,
        ease: 'back.out(1.7)'
      });

      gsap.from('.hero-title', {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: 'power4.out',
        delay: 0.2
      });

      gsap.from('.hero-subtitle', {
        y: 50,
        opacity: 0,
        duration: 0.8,
        delay: 0.5,
        ease: 'power3.out'
      });

      gsap.from('.hero-cta', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        delay: 0.8,
        ease: 'power2.out'
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const features = [
    {
      icon: Zap,
      title: 'Multi-Batch Memory',
      description: 'Persistent placement history across batches. Learn from seniors who came before you.',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Shield,
      title: 'Student-Driven Truth',
      description: 'Students own their data. Reps verify. No fake entries, no admin interference.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: TrendingUp,
      title: 'Round-Level Intelligence',
      description: 'Track every interview round. Questions, reflections, and outcomes—all in one place.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Users,
      title: 'Placement vs Prep',
      description: 'Separate active batches. Archives remain accessible for future reference.',
      gradient: 'from-blue-500 to-cyan-500'
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        {/* Gradient Orbs */}
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-purple-500/20 text-purple-300 text-sm mb-8"
          >
            <Sparkles className="w-4 h-4" />
            <span>PSG College MCA Platform</span>
          </motion.div>

          <h1 className="hero-title text-7xl md:text-9xl font-bold mb-6">
            <span className="text-gradient">SkillSphere</span>
          </h1>

          <p className="hero-subtitle text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            The <span className="text-purple-400 font-semibold">Smart Placement Memory Platform</span> that transforms college placement data into lasting institutional knowledge.
          </p>

          <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={() => router.push('/login')}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-6 text-lg group shadow-lg shadow-purple-500/30"
            >
              {session ? 'Go to Dashboard' : 'Sign In'}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-20 max-w-2xl mx-auto">
            {[
              { label: 'Active Users', value: '500+' },
              { label: 'Placements', value: '200+' },
              { label: 'Companies', value: '50+' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-gradient">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <div className="w-6 h-10 border-2 border-purple-500/30 rounded-full p-1">
            <motion.div
              className="w-1.5 h-1.5 bg-purple-500 rounded-full mx-auto"
              animate={{ y: [0, 20, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-gradient mb-4">
              Why SkillSphere?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Built for PSG MCA students, by understanding what placement tracking should actually be.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative glass rounded-2xl p-8 hover:bg-white/10 transition-all duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity rounded-2xl`} />

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-2xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 border-t border-white/5">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-gradient mb-6">
            Ready to get started?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Access your placement dashboard and start tracking your journey.
          </p>
          <Button
            size="lg"
            onClick={() => router.push('/login')}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-12 py-6 text-lg shadow-lg shadow-purple-500/30"
          >
            Sign In to SkillSphere
          </Button>
        </motion.div>
      </section>
    </div>
  );
}
