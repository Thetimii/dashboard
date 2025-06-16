'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/Logo'
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

      {/* Navigation Header */}
      <nav className="absolute top-0 left-0 right-0 z-50 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Logo size="md" className="flex-shrink-0" />
            <span className="text-xl font-bold text-white">Customer Flows</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-white/80 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-white/80 hover:text-white transition-colors">Preise</a>
            <button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-900 px-6 py-2 rounded-xl font-semibold hover:from-teal-500 hover:to-cyan-500 transition-all duration-300"
            >
              Jetzt starten
            </button>
          </div>
        </div>
      </nav>

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
            <p className="text-xl text-gray-300 max-w-4xl mx-auto font-inter leading-relaxed mb-12">
              Sie ist dein digitales Schaufenster, das 24/7 für dich arbeitet, neue Kunden anzieht 
              und dein Business auf das nächste Level bringt.
            </p>
            
            {/* CTA Button */}
            <motion.div
              {...fadeInUp}
              transition={{ delay: 0.3 }}
              className="text-center"
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
            </motion.div>
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
            className="grid md:grid-cols-3 gap-8 text-center mb-16"
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

          {/* CTA Button */}
          <motion.div
            {...fadeInUp}
            className="text-center"
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
                <div 
                  onClick={handleGetStarted}
                  className="bg-white rounded-3xl shadow-2xl shadow-blue-500/10 border border-blue-100 p-8 transform hover:scale-105 transition-transform duration-300 cursor-pointer group"
                >
                  <div className="text-center">
                    <div className="flex justify-center mb-6">
                      <Logo size="lg" className="group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">Willkommen bei Customer Flows!</h4>
                    <div className="space-y-3">
                      <div className="bg-gray-50 rounded-xl p-4 group-hover:bg-blue-50 transition-colors">
                        <input type="text" placeholder="Dein Name" className="w-full border-0 bg-transparent text-gray-700 pointer-events-none" readOnly />
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 group-hover:bg-blue-50 transition-colors">
                        <input type="email" placeholder="E-Mail Adresse" className="w-full border-0 bg-transparent text-gray-700 pointer-events-none" readOnly />
                      </div>
                      <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 rounded-xl font-semibold group-hover:from-blue-600 group-hover:to-cyan-600 transition-all duration-300">
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
              Starte noch heute mit deiner professionellen Website und werde online gefunden.
            </p>
          </motion.div>
          
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-16"
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
