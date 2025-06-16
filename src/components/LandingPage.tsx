'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  MapPinIcon, 
  BuildingStorefrontIcon, 
  HandRaisedIcon, 
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  StarIcon,
  SparklesIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  CursorArrowRaysIcon,
  ArrowRightIcon,
  PhoneIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline'

export function LandingPage() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push('/signup')
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  }

  const fadeInLeft = {
    initial: { opacity: 0, x: -60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  }

  const fadeInRight = {
    initial: { opacity: 0, x: 60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const scaleIn = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.8, ease: "easeOut" }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 min-h-screen flex items-center justify-center px-4">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-32 w-48 h-48 bg-cyan-300/20 rounded-full blur-2xl animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }}></div>
          <div className="absolute bottom-32 left-40 w-56 h-56 bg-teal-300/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-300/10 rounded-full blur-3xl animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '4s' }}></div>
          
          {/* Floating icons */}
          <div className="absolute top-1/3 left-1/4 text-white/20 animate-bounce" style={{ animationDelay: '3s', animationDuration: '6s' }}>
            <ComputerDesktopIcon className="w-16 h-16" />
          </div>
          <div className="absolute bottom-1/3 right-1/4 text-white/20 animate-bounce" style={{ animationDelay: '1s', animationDuration: '5s' }}>
            <DevicePhoneMobileIcon className="w-12 h-12" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          {/* Left Content */}
          <motion.div 
            variants={fadeInLeft}
            initial="initial"
            animate="animate"
            className="text-white"
          >
            {/* Badge */}
            <motion.div
              {...scaleIn}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-lg rounded-full text-sm font-semibold mb-8 border border-white/30"
            >
              <SparklesIcon className="w-5 h-5 mr-2 text-yellow-300" />
              <span className="text-white">Schweizer Qualität • Faire Preise</span>
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-5xl lg:text-7xl font-serif font-bold mb-8 leading-[1.1]">
              Mehr Kunden.{' '}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-white to-yellow-200">
                Mehr Erfolg.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl lg:text-2xl mb-10 text-white/90 leading-relaxed font-inter max-w-2xl">
              Professionelle Website für dein Business –{' '}
              <span className="font-bold text-yellow-300 bg-white/10 px-2 py-1 rounded-lg">nur 99 CHF/Monat</span>. 
              <br />Ohne Vorwissen, ohne versteckte Kosten.
            </p>

            {/* Feature List */}
            <div className="space-y-4 mb-10">
              <motion.div 
                className="flex items-center text-white/95"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="w-6 h-6 mr-4 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircleIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg">Du zahlst erst, wenn du dein Design freigibst</span>
              </motion.div>
              <motion.div 
                className="flex items-center text-white/95"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="w-6 h-6 mr-4 bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircleIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg">Professionelles Design von Schweizer Experten</span>
              </motion.div>
              <motion.div 
                className="flex items-center text-white/95"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="w-6 h-6 mr-4 bg-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircleIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg">Komplett ohne technisches Wissen</span>
              </motion.div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                onClick={handleGetStarted}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group relative inline-flex items-center justify-center px-8 py-4 bg-white text-teal-600 text-lg font-bold rounded-2xl shadow-2xl hover:shadow-white/30 transition-all duration-300 font-inter overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <RocketLaunchIcon className="w-6 h-6 mr-3 relative z-10 group-hover:animate-bounce" />
                <span className="relative z-10">Jetzt kostenlos starten</span>
                <ArrowRightIcon className="w-5 h-5 ml-2 relative z-10 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center px-6 py-4 border-2 border-white/30 text-white text-lg font-semibold rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-all duration-300 font-inter"
              >
                <PhoneIcon className="w-5 h-5 mr-2" />
                Kostenlose Beratung
              </motion.button>
            </div>

            {/* Trust indicators */}
            <motion.div 
              className="mt-12 flex items-center space-x-8 text-white/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <div className="flex items-center">
                <div className="flex -space-x-2 mr-3">
                  <div className="w-8 h-8 bg-yellow-400 rounded-full border-2 border-white"></div>
                  <div className="w-8 h-8 bg-green-400 rounded-full border-2 border-white"></div>
                  <div className="w-8 h-8 bg-blue-400 rounded-full border-2 border-white"></div>
                </div>
                <span className="text-sm font-medium">50+ zufriedene Kunden</span>
              </div>
              <div className="flex items-center">
                <StarIcon className="w-5 h-5 text-yellow-300 fill-current mr-1" />
                <span className="text-sm font-medium">4.9/5 Bewertung</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Enhanced Mock Phone */}
          <motion.div 
            variants={fadeInRight}
            initial="initial"
            animate="animate"
            className="relative"
          >
            <div className="relative mx-auto w-80 h-[640px] bg-slate-800 rounded-[3rem] shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
              {/* Phone Frame Shadow */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent rounded-[3rem] blur-xl"></div>
              
              {/* Phone Frame */}
              <div className="absolute inset-2 bg-black rounded-[2.5rem] overflow-hidden">
                {/* Status Bar */}
                <div className="h-10 bg-black flex items-center justify-between px-6">
                  <span className="text-white text-sm font-medium">9:41</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-2 bg-white rounded-sm"></div>
                    <div className="w-6 h-3 border border-white rounded-sm"></div>
                  </div>
                </div>
                
                {/* Screen Content */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 h-full">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <span className="text-white font-bold text-lg">CF</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm opacity-90">Dein Business</div>
                        <div className="text-xs opacity-70">Online sichtbar</div>
                      </div>
                    </div>
                    <h3 className="font-bold text-lg">Willkommen!</h3>
                    <p className="text-sm opacity-90">Deine Website ist live</p>
                  </div>
                  
                  {/* Content Cards */}
                  <div className="p-4 space-y-3">
                    <motion.div 
                      className="bg-white rounded-xl p-4 shadow-lg border border-green-100"
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ repeat: Infinity, duration: 3, delay: 0 }}
                    >
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                        <span className="text-sm text-gray-700 font-medium">Bei Google gefunden werden</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">+25% mehr Sichtbarkeit</div>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-white rounded-xl p-4 shadow-lg border border-blue-100"
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ repeat: Infinity, duration: 3, delay: 1 }}
                    >
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                        <span className="text-sm text-gray-700 font-medium">Neue Kunden gewinnen</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">5 neue Anfragen diese Woche</div>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-white rounded-xl p-4 shadow-lg border border-purple-100"
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ repeat: Infinity, duration: 3, delay: 2 }}
                    >
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-purple-500 rounded-full mr-3 animate-pulse"></div>
                        <span className="text-sm text-gray-700 font-medium">Vertrauen aufbauen</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Professioneller Eindruck</div>
                    </motion.div>

                    {/* Stats Card */}
                    <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-xl p-4 border border-orange-200">
                      <div className="text-xs text-gray-600 mb-1">Heute</div>
                      <div className="text-lg font-bold text-gray-800">47 Besucher</div>
                      <div className="text-xs text-green-600">↗ +23% vs. gestern</div>
                    </div>
                  </div>
                  
                  {/* Bottom CTA */}
                  <div className="absolute bottom-6 left-4 right-4">
                    <motion.div 
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-4 rounded-xl text-center shadow-lg"
                      animate={{ y: [0, -2, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <div className="font-bold text-sm">Jetzt durchstarten!</div>
                      <div className="text-xs opacity-90">Deine Website wartet</div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-32 px-4 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:80px_80px] opacity-20"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            {...fadeInUp}
            className="text-center mb-24"
          >
            <div className="inline-flex items-center px-6 py-3 bg-teal-500/10 backdrop-blur-sm rounded-full text-sm font-semibold mb-8 border border-teal-500/20">
              <SparklesIcon className="w-5 h-5 mr-2 text-teal-400" />
              <span className="text-teal-300">Warum Customer Flows?</span>
            </div>
            
            <h2 className="text-5xl lg:text-7xl font-serif font-bold text-white mb-8 leading-tight">
              Deine Website ist mehr als nur{' '}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-400">
                eine Visitenkarte
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto font-inter leading-relaxed">
              Sie ist dein digitales Schaufenster, das 24/7 für dich arbeitet, neue Kunden anzieht 
              und dein Business auf das nächste Level bringt.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid lg:grid-cols-2 gap-8 mb-20"
          >
            {/* Benefit Card 1 */}
            <motion.div 
              variants={fadeInLeft} 
              className="group relative p-10 bg-gradient-to-br from-slate-800/80 to-blue-900/30 backdrop-blur-lg rounded-3xl border border-slate-700/50 hover:border-teal-500/50 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="absolute top-8 right-8 w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-emerald-500/25">
                <MapPinIcon className="w-10 h-10 text-white" />
              </div>
              
              <div className="relative z-10">
                <div className="mb-6">
                  <div className="text-6xl mb-4">📍</div>
                  <h3 className="text-3xl font-bold text-white mb-6 font-inter">
                    Du wirst gefunden
                  </h3>
                  <p className="text-gray-300 text-lg leading-relaxed font-inter">
                    Kunden suchen online nach Lösungen wie deiner. Mit einer professionellen Website 
                    bist du genau dort, wo sie dich erwarten – bei Google an der Spitze.
                  </p>
                </div>
                
                <div className="flex items-center text-teal-400 font-semibold">
                  <span>Mehr Sichtbarkeit</span>
                  <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>

            {/* Benefit Card 2 */}
            <motion.div 
              variants={fadeInRight} 
              className="group relative p-10 bg-gradient-to-br from-slate-800/80 to-purple-900/30 backdrop-blur-lg rounded-3xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="absolute top-8 right-8 w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-purple-500/25">
                <BuildingStorefrontIcon className="w-10 h-10 text-white" />
              </div>
              
              <div className="relative z-10">
                <div className="mb-6">
                  <div className="text-6xl mb-4">🏪</div>
                  <h3 className="text-3xl font-bold text-white mb-6 font-inter">
                    Dein 24/7 Schaufenster
                  </h3>
                  <p className="text-gray-300 text-lg leading-relaxed font-inter">
                    Während du schläfst, arbeitet deine Website für dich. Potenzielle Kunden können 
                    rund um die Uhr deine Dienstleistungen entdecken und Kontakt aufnehmen.
                  </p>
                </div>
                
                <div className="flex items-center text-purple-400 font-semibold">
                  <span>Rund-um-die-Uhr arbeiten</span>
                  <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>

            {/* Benefit Card 3 */}
            <motion.div 
              variants={fadeInLeft} 
              className="group relative p-10 bg-gradient-to-br from-slate-800/80 to-cyan-900/30 backdrop-blur-lg rounded-3xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="absolute top-8 right-8 w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-cyan-500/25">
                <HandRaisedIcon className="w-10 h-10 text-white" />
              </div>
              
              <div className="relative z-10">
                <div className="mb-6">
                  <div className="text-6xl mb-4">🤝</div>
                  <h3 className="text-3xl font-bold text-white mb-6 font-inter">
                    Vertrauen aufbauen
                  </h3>
                  <p className="text-gray-300 text-lg leading-relaxed font-inter">
                    Eine professionelle Website zeigt, dass du es ernst meinst. Kunden vertrauen 
                    Unternehmen mit starker Online-Präsenz deutlich mehr.
                  </p>
                </div>
                
                <div className="flex items-center text-cyan-400 font-semibold">
                  <span>Professionalität zeigen</span>
                  <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>

            {/* Benefit Card 4 */}
            <motion.div 
              variants={fadeInRight} 
              className="group relative p-10 bg-gradient-to-br from-slate-800/80 to-orange-900/30 backdrop-blur-lg rounded-3xl border border-slate-700/50 hover:border-orange-500/50 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="absolute top-8 right-8 w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-orange-500/25">
                <ChatBubbleLeftRightIcon className="w-10 h-10 text-white" />
              </div>
              
              <div className="relative z-10">
                <div className="mb-6">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-3xl font-bold text-white mb-6 font-inter">
                    Direkte Kontaktaufnahme
                  </h3>
                  <p className="text-gray-300 text-lg leading-relaxed font-inter">
                    Egal ob Terminbuchungen, Anfragen oder Bestellungen – deine Kunden können 
                    direkt über deine Website mit dir in Kontakt treten.
                  </p>
                </div>
                
                <div className="flex items-center text-orange-400 font-semibold">
                  <span>Mehr Anfragen erhalten</span>
                  <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            {...fadeInUp}
            className="grid md:grid-cols-3 gap-8 text-center"
          >
            <div className="p-8">
              <div className="text-5xl font-bold text-teal-400 mb-2">95%</div>
              <div className="text-gray-300 font-inter">der Kunden schauen zuerst online</div>
            </div>
            <div className="p-8">
              <div className="text-5xl font-bold text-cyan-400 mb-2">24/7</div>
              <div className="text-gray-300 font-inter">arbeitet deine Website für dich</div>
            </div>
            <div className="p-8">
              <div className="text-5xl font-bold text-blue-400 mb-2">+150%</div>
              <div className="text-gray-300 font-inter">mehr Anfragen durch Website</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 px-4 bg-gradient-to-br from-gray-50 to-teal-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-br from-teal-200/30 to-cyan-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            {...fadeInUp}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center px-6 py-3 bg-white/60 backdrop-blur-sm rounded-full text-sm font-semibold mb-8 border border-teal-200">
              <SparklesIcon className="w-5 h-5 mr-2 text-teal-600" />
              <span className="text-teal-700">So einfach geht's</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-8 leading-tight">
              In nur{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">
                3 Schritten
              </span>
              {' '}zu deiner professionellen Website
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-inter">
              Kein technisches Wissen nötig. Kein Stress. Einfach registrieren und loslegen.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-16"
          >
            {/* Step 1 */}
            <motion.div variants={fadeInUp} className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0 shadow-lg shadow-blue-500/25">
                    1
                  </div>
                  <div className="ml-6">
                    <h3 className="text-3xl font-bold text-gray-900 mb-2 font-inter">
                      Kostenlos registrieren
                    </h3>
                    <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                  </div>
                </div>
                <p className="text-xl text-gray-600 leading-relaxed font-inter mb-6">
                  Erstelle deinen kostenlosen Account in weniger als 2 Minuten. 
                  Keine Kreditkarte erforderlich, keine versteckten Kosten.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <CheckCircleIcon className="w-5 h-5 mr-3 text-green-500" />
                    <span>100% kostenlos & unverbindlich</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <CheckCircleIcon className="w-5 h-5 mr-3 text-green-500" />
                    <span>Sofortiger Zugang zu deinem Dashboard</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <CheckCircleIcon className="w-5 h-5 mr-3 text-green-500" />
                    <span>Keine Kreditkarte nötig</span>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="bg-white rounded-3xl shadow-2xl shadow-blue-500/10 border border-blue-100 p-8 transform hover:scale-105 transition-transform duration-300">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                      <span className="text-white text-2xl">👋</span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Willkommen bei Customer Flows!</h4>
                    <div className="space-y-3">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <input type="text" placeholder="Dein Name" className="w-full border-0 bg-transparent text-gray-700" readOnly />
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <input type="email" placeholder="E-Mail Adresse" className="w-full border-0 bg-transparent text-gray-700" readOnly />
                      </div>
                      <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 rounded-xl font-semibold">
                        Jetzt starten 🚀
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div variants={fadeInUp} className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="bg-white rounded-3xl shadow-2xl shadow-green-500/10 border border-green-100 p-8 transform hover:scale-105 transition-transform duration-300">
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                        <span className="text-white text-2xl">📝</span>
                      </div>
                      <h4 className="text-xl font-bold text-gray-900">Über dein Business erzählen</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-2">Was machst du?</div>
                        <div className="text-gray-800">Maler & Renovationen</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-2">Deine Zielgruppe?</div>
                        <div className="text-gray-800">Hausbesitzer in Zürich</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-2">Lieblings-Farben?</div>
                        <div className="flex space-x-2">
                          <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                          <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                          <div className="w-8 h-8 bg-orange-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0 shadow-lg shadow-green-500/25">
                    2
                  </div>
                  <div className="ml-6">
                    <h3 className="text-3xl font-bold text-gray-900 mb-2 font-inter">
                      Fragebogen ausfüllen
                    </h3>
                    <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                  </div>
                </div>
                <p className="text-xl text-gray-600 leading-relaxed font-inter mb-6">
                  Erzähl uns in wenigen Minuten über dein Business. Je mehr wir wissen, 
                  desto besser wird deine Website.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <CheckCircleIcon className="w-5 h-5 mr-3 text-green-500" />
                    <span>Nur 5 Minuten deiner Zeit</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <CheckCircleIcon className="w-5 h-5 mr-3 text-green-500" />
                    <span>Intelligente Fragen, einfache Antworten</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <CheckCircleIcon className="w-5 h-5 mr-3 text-green-500" />
                    <span>Fotos & Logo optional hochladen</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div variants={fadeInUp} className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0 shadow-lg shadow-purple-500/25">
                    3
                  </div>
                  <div className="ml-6">
                    <h3 className="text-3xl font-bold text-gray-900 mb-2 font-inter">
                      Website ansehen & freigeben
                    </h3>
                    <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                  </div>
                </div>
                <p className="text-xl text-gray-600 leading-relaxed font-inter mb-6">
                  Wir erstellen deine Website und zeigen sie dir. Erst wenn du 100% zufrieden bist 
                  und freigibst, beginnt dein Hosting für nur 99 CHF/Monat.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <CheckCircleIcon className="w-5 h-5 mr-3 text-green-500" />
                    <span>Professionelle Umsetzung in 3-5 Tagen</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <CheckCircleIcon className="w-5 h-5 mr-3 text-green-500" />
                    <span>Du zahlst nur, wenn du zufrieden bist</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <CheckCircleIcon className="w-5 h-5 mr-3 text-green-500" />
                    <span>Änderungswünsche inklusive</span>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="bg-white rounded-3xl shadow-2xl shadow-purple-500/10 border border-purple-100 p-8 transform hover:scale-105 transition-transform duration-300">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                      <span className="text-white text-2xl">✨</span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Deine Website ist fertig!</h4>
                    <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl p-6 mb-6">
                      <div className="text-sm text-gray-600 mb-2">Vorschau deiner Website</div>
                      <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                        <div className="h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mb-3"></div>
                        <div className="text-left">
                          <div className="text-sm font-bold text-gray-800">Maler Müller</div>
                          <div className="text-xs text-gray-600">Ihr Profi für Renovationen</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold">
                        Änderungen
                      </button>
                      <button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold">
                        Freigeben ✓
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Trust Statement */}
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.6 }}
            className="text-center mt-20 p-8 bg-white/60 backdrop-blur-sm rounded-3xl border border-teal-200"
          >
            <div className="inline-flex items-center mb-4">
              <ShieldCheckIcon className="w-8 h-8 text-teal-600 mr-3" />
              <h4 className="text-2xl font-bold text-gray-900 font-inter">100% Zufriedenheitsgarantie</h4>
            </div>
            <p className="text-lg text-gray-600 font-inter max-w-2xl mx-auto">
              Kein Risiko. Kein Stress. Kein Kleingedrucktes. Du zahlst nur, wenn du mit deiner Website rundum zufrieden bist.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 px-4 bg-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-yellow-200/20 to-orange-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-green-200/20 to-teal-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            {...fadeInUp}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center px-6 py-3 bg-yellow-100 rounded-full text-sm font-semibold mb-8 border border-yellow-200">
              <StarIcon className="w-5 h-5 mr-2 text-yellow-600 fill-current" />
              <span className="text-yellow-700">Was unsere Kunden sagen</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-8 leading-tight">
              Echte Erfolgsgeschichten von{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">
                echten Kunden
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-inter">
              Über 50 zufriedene Unternehmer vertrauen bereits auf Customer Flows für ihren Webauftritt.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
          >
            {/* Testimonial 1 */}
            <motion.div variants={fadeInUp} className="group relative p-8 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl border border-blue-100 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
              <div className="absolute top-6 right-6 text-4xl opacity-20 group-hover:opacity-30 transition-opacity">💼</div>
              
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl mr-4">
                  EM
                </div>
                <div>
                  <div className="font-bold text-gray-900">Elias Müller</div>
                  <div className="text-gray-600 text-sm">Malerbetrieb, Zürich</div>
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <blockquote className="text-lg text-gray-800 mb-6 font-inter italic leading-relaxed">
                "Ich habe durch die Website jede Woche neue Anfragen – und das ganz ohne Werbung! 
                Die Investition hat sich schon nach 2 Monaten ausgezahlt."
              </blockquote>
              
              <div className="text-sm text-gray-600 font-inter">
                <span className="font-semibold text-green-600">+40% mehr Kunden</span> seit Website-Launch
              </div>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div variants={fadeInUp} className="group relative p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border border-green-100 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-500">
              <div className="absolute top-6 right-6 text-4xl opacity-20 group-hover:opacity-30 transition-opacity">💅</div>
              
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl mr-4">
                  AK
                </div>
                <div>
                  <div className="font-bold text-gray-900">Aylin Kaya</div>
                  <div className="text-gray-600 text-sm">Kosmetikstudio, Basel</div>
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <blockquote className="text-lg text-gray-800 mb-6 font-inter italic leading-relaxed">
                "Ich war nie online – jetzt habe ich endlich etwas, das ich auch stolz zeigen kann. 
                Meine Kunden sind begeistert von der professionellen Website!"
              </blockquote>
              
              <div className="text-sm text-gray-600 font-inter">
                <span className="font-semibold text-green-600">Komplett neue Online-Präsenz</span> in nur 1 Woche
              </div>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div variants={fadeInUp} className="group relative p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border border-purple-100 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 md:col-span-2 lg:col-span-1">
              <div className="absolute top-6 right-6 text-4xl opacity-20 group-hover:opacity-30 transition-opacity">⚡</div>
              
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl mr-4">
                  MS
                </div>
                <div>
                  <div className="font-bold text-gray-900">Marco Schneider</div>
                  <div className="text-gray-600 text-sm">Elektroinstallationen, Bern</div>
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <blockquote className="text-lg text-gray-800 mb-6 font-inter italic leading-relaxed">
                "Endlich werde ich bei Google gefunden! Die Website sieht super professionell aus 
                und bringt mir laufend neue Aufträge."
              </blockquote>
              
              <div className="text-sm text-gray-600 font-inter">
                <span className="font-semibold text-green-600">Top Google-Ranking</span> nach 3 Monaten
              </div>
            </motion.div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            {...fadeInUp}
            className="grid md:grid-cols-4 gap-8 text-center"
          >
            <div className="p-6">
              <div className="text-3xl mb-2">⭐</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">4.9/5</div>
              <div className="text-gray-600 font-inter text-sm">Kundenbewertung</div>
            </div>
            <div className="p-6">
              <div className="text-3xl mb-2">🚀</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">50+</div>
              <div className="text-gray-600 font-inter text-sm">Zufriedene Kunden</div>
            </div>
            <div className="p-6">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">3-5 Tage</div>
              <div className="text-gray-600 font-inter text-sm">Bis zur Website</div>
            </div>
            <div className="p-6">
              <div className="text-3xl mb-2">🇨🇭</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">100%</div>
              <div className="text-gray-600 font-inter text-sm">Schweizer Qualität</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 px-4 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          {/* Floating Elements */}
          <div className="absolute top-1/4 right-1/4 text-white/10 animate-bounce" style={{ animationDelay: '2s', animationDuration: '4s' }}>
            <RocketLaunchIcon className="w-24 h-24" />
          </div>
          <div className="absolute bottom-1/4 left-1/4 text-white/10 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3s' }}>
            <SparklesIcon className="w-20 h-20" />
          </div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            {...fadeInUp}
            className="mb-12"
          >
            <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-sm font-semibold mb-8 border border-white/20">
              <CursorArrowRaysIcon className="w-5 h-5 mr-2 text-teal-300" />
              <span className="text-white">Bereit für mehr Kunden?</span>
            </div>
            
            <h2 className="text-5xl md:text-7xl font-serif font-bold text-white mb-8 leading-tight">
              Zeig dich der Welt.{' '}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-400">
                Starte jetzt.
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-inter leading-relaxed mb-12">
              Schließe dich über 50 erfolgreichen Unternehmern an, die bereits mit Customer Flows 
              ihre Online-Präsenz auf das nächste Level gebracht haben.
            </p>
          </motion.div>
          
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
          >
            <button
              onClick={handleGetStarted}
              className="group relative inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-900 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-teal-400/25 transition-all duration-300 font-inter overflow-hidden transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white to-yellow-100 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <RocketLaunchIcon className="w-7 h-7 mr-3 relative z-10 group-hover:animate-bounce" />
              <span className="relative z-10">Jetzt kostenlos starten</span>
              <ArrowRightIcon className="w-6 h-6 ml-3 relative z-10 group-hover:translate-x-2 transition-transform" />
            </button>
            
            <div className="flex items-center text-white/80">
              <div className="flex -space-x-2 mr-4">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full border-2 border-white"></div>
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full border-2 border-white"></div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full border-2 border-white"></div>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full border-2 border-white flex items-center justify-center text-white text-sm font-bold">
                  +47
                </div>
              </div>
              <div className="text-left">
                <div className="font-semibold">50+ Unternehmer</div>
                <div className="text-sm text-white/60">sind bereits dabei</div>
              </div>
            </div>
          </motion.div>

          {/* Final Trust Elements */}
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-3 gap-8 text-center"
          >
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <div className="text-2xl mb-3">🛡️</div>
              <div className="text-white font-semibold mb-2">100% Risikolos</div>
              <div className="text-white/70 text-sm">Du zahlst nur bei Zufriedenheit</div>
            </div>
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <div className="text-2xl mb-3">⚡</div>
              <div className="text-white font-semibold mb-2">Schnell & Einfach</div>
              <div className="text-white/70 text-sm">In 5 Minuten registriert</div>
            </div>
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <div className="text-2xl mb-3">🇨🇭</div>
              <div className="text-white font-semibold mb-2">Swiss Made</div>
              <div className="text-white/70 text-sm">Höchste Schweizer Qualität</div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
