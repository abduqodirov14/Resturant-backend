import { Button } from './ui/button';
import { Card } from './ui/card';
import { UtensilsCrossed, ChefHat, LayoutDashboard, QrCode, Clock, TrendingUp, Sparkles, Zap, Shield, Star, Heart } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import { FloatingParticles } from './FloatingParticles';
import { WaveBackground } from './WaveBackground';
import { useRef } from 'react';

interface LandingPageProps {
  onNavigate: (page: 'menu' | 'chef' | 'admin') => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.3]);

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 overflow-hidden">
      <FloatingParticles />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-orange-300 to-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-amber-300 to-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-8 left-40 w-96 h-96 bg-gradient-to-br from-orange-400 to-red-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{
            x: [0, 50, 0],
            y: [0, -100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <motion.div
          className="absolute bottom-40 right-40 w-72 h-72 bg-gradient-to-br from-sky-300 to-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            x: [0, -80, 0],
            y: [0, 80, 0],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div className="relative" style={{ y, opacity }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-8">
            <motion.div
              className="flex items-center justify-center"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                duration: 1
              }}
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl blur-2xl opacity-50"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.3, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl blur-3xl opacity-30"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                />

                <motion.div
                  className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 p-8 rounded-3xl shadow-2xl"
                  whileHover={{
                    scale: 1.05,
                    rotateY: 10,
                    rotateX: 10,
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <UtensilsCrossed className="w-20 h-20 text-white drop-shadow-2xl" />
                </motion.div>

                <motion.div
                  className="absolute -top-2 -right-2"
                  animate={{
                    rotate: 360,
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity },
                  }}
                >
                  <Sparkles className="w-10 h-10 text-yellow-400 drop-shadow-lg" />
                </motion.div>
                <motion.div
                  className="absolute -bottom-2 -left-2"
                  animate={{
                    rotate: -360,
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2.5, repeat: Infinity, delay: 0.5 },
                  }}
                >
                  <Star className="w-8 h-8 text-amber-400 drop-shadow-lg" fill="currentColor" />
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <h1 className="text-6xl md:text-7xl font-extrabold">
                <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                  QR Restoran
                </span>
                <br />
                <span className="bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                  Tizimi
                </span>
              </h1>
              <motion.p 
                className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Zamonaviy restoran boshqaruv tizimi. QR kod orqali buyurtma, 
                <span className="font-semibold text-orange-600"> real-time</span> oshpaz paneli va 
                <span className="font-semibold text-orange-600"> professional</span> admin dashboard.
              </motion.p>

              <motion.div
                className="mx-auto grid max-w-4xl grid-cols-1 gap-3 pt-4 sm:grid-cols-3"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 }}
              >
                <div className="rounded-2xl border border-white/60 bg-white/75 px-4 py-4 shadow-lg backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">Mobile</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">QR menu va media hero</p>
                </div>
                <div className="rounded-2xl border border-white/60 bg-white/75 px-4 py-4 shadow-lg backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">Speed</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">Cache va siqilgan API</p>
                </div>
                <div className="rounded-2xl border border-white/60 bg-white/75 px-4 py-4 shadow-lg backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">Admin</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">To'lov, chek va hisobot</p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-lg h-16 px-10 shadow-2xl text-white font-semibold"
                  onClick={() => onNavigate('menu')}
                >
                  <QrCode className="w-6 h-6 mr-2" />
                  Mijoz Menu
                  <Sparkles className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg h-16 px-10 border-2 border-orange-300 hover:bg-orange-50 font-semibold"
                  onClick={() => onNavigate('chef')}
                >
                  <ChefHat className="w-6 h-6 mr-2" />
                  Oshpaz Paneli
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg h-16 px-10 border-2 border-orange-300 hover:bg-orange-50 font-semibold"
                  onClick={() => onNavigate('admin')}
                >
                  <LayoutDashboard className="w-6 h-6 mr-2" />
                  Admin Panel
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Asosiy Imkoniyatlar
            </span>
          </h2>
          <p className="text-xl text-slate-600">
            Restoran biznesingizni keyingi bosqichga olib chiqing
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: QrCode,
              title: 'QR Menu',
              description: 'Har bir stol uchun QR kod. Mijozlar telefonlari orqali menuni ko\'rib, buyurtma berishadi.',
              color: 'from-orange-400 to-orange-500',
              bg: 'from-orange-50 to-orange-100'
            },
            {
              icon: Zap,
              title: 'Real-time Buyurtmalar',
              description: 'Buyurtmalar darhol oshpaz paneliga tushadi. Statuslar real vaqt rejimida yangilanadi.',
              color: 'from-blue-400 to-blue-500',
              bg: 'from-blue-50 to-blue-100'
            },
            {
              icon: ChefHat,
              title: 'Oshpaz Paneli',
              description: 'Oshpazlar buyurtmalarni ko\'rib, statuslarini boshqarishadi: Yangi, Tayyorlanmoqda, Tayyor.',
              color: 'from-green-400 to-green-500',
              bg: 'from-green-50 to-green-100'
            },
            {
              icon: LayoutDashboard,
              title: 'Admin Dashboard',
              description: 'Stollarni boshqaring, ovqatlarni tahrirlang, statistikani kuzating.',
              color: 'from-purple-400 to-purple-500',
              bg: 'from-purple-50 to-purple-100'
            },
            {
              icon: TrendingUp,
              title: 'Statistika',
              description: 'Daromad, eng ko\'p sotilgan taomlar, kunlik hisobotlar va boshqa ma\'lumotlar.',
              color: 'from-yellow-400 to-yellow-500',
              bg: 'from-yellow-50 to-yellow-100'
            },
            {
              icon: Shield,
              title: 'Menu Boshqaruvi',
              description: 'Ovqatlar, kategoriyalar, narxlar va rasmlarni oson boshqaring.',
              color: 'from-red-400 to-red-500',
              bg: 'from-red-50 to-red-100'
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <Card className="p-8 hover:shadow-2xl transition-all duration-300 bg-white border-0 h-full group relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(45deg, transparent, ${feature.color.replace('from-', '').replace('to-', '')})`,
                    padding: '2px',
                    borderRadius: 'inherit',
                  }}
                />
                <div className="relative bg-white rounded-lg p-0">
                  <motion.div
                    className={`bg-gradient-to-br ${feature.bg} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className={`bg-gradient-to-br ${feature.color} p-3 rounded-xl`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="p-12 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 border-0 shadow-2xl overflow-hidden relative">
            <motion.div
              className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-white/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
            />
            <motion.div
              className="absolute bottom-0 left-0 -mb-4 -ml-4 w-40 h-40 bg-white/10 rounded-full blur-3xl"
              animate={{
                scale: [1.3, 1, 1.3],
                opacity: [0.3, 0.1, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: 0.5,
              }}
            />

            {Array.from({ length: 10 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-yellow-200 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}

            <div className="relative text-center space-y-6 z-10">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block"
              >
                <Sparkles className="w-16 h-16 text-yellow-300 mx-auto drop-shadow-2xl" />
              </motion.div>
              <h3 className="text-4xl font-bold text-white">
                Demo Versiya
              </h3>
              <p className="text-xl text-orange-50 max-w-2xl mx-auto leading-relaxed">
                Bu to'liq ishlaydigan MVP versiyasi. Menyu, buyurtmalar va admin oqimlari
                endi real backend va database bilan ishlaydi.
              </p>
              <div className="flex flex-wrap gap-4 justify-center pt-6">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    onClick={() => onNavigate('menu')}
                    size="lg"
                    className="bg-white text-orange-600 hover:bg-orange-50 h-14 px-8 text-lg font-semibold shadow-xl relative overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-200 to-transparent"
                      animate={{
                        x: ['-200%', '200%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1,
                      }}
                    />
                    <Zap className="w-5 h-5 mr-2 relative z-10" />
                    <span className="relative z-10">Demo ko'rish</span>
                  </Button>
                </motion.div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="relative mt-20">
        <WaveBackground />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 text-slate-600 mb-4">
              <span>Made with</span>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              >
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              </motion.div>
              <span>using React, Tailwind & Motion</span>
            </div>
            <p className="text-sm text-slate-500">
              2026 QR Restoran Tizimi. Barcha huquqlar himoyalangan.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

