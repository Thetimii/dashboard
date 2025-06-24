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
  ComputerDesktopIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'

export function LandingPage() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push('/signup')
  }

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const target = document.querySelector('#features')
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
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
    <div className="min-h-screen bg-white overflow-hidden">

      {/* Navigation Header */}
      <nav className="absolute top-0 left-0 right-0 z-50 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Logo size="md" className="flex-shrink-0" />
            <span className="text-xl font-bold text-white">Customer Flows</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a 
              href="#features" 
              onClick={handleSmoothScroll}
              className="text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              So funktioniert's
            </a>
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
              <span className="text-teal-300">Ein faires Versprechen</span>
            </div>
            
            <h2 className="text-5xl lg:text-7xl font-serif font-bold text-white mb-8 leading-tight">
              Kostenlose Website,{" "}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-400">
                wirklich?
              </span>
            </h2>                <p className="text-xl text-gray-300 max-w-4xl mx-auto font-inter leading-relaxed mb-12">
                  Ja, du hast richtig gehört. Wir erstellen deine Website komplett kostenlos. Du zahlst nur für das Hosting, und das auch nur, wenn du mit dem Ergebnis zu 100% zufrieden bist. Monatlich kündbar, keine Startgebühren, keine versteckten Kosten.
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
            variants={fadeInUp}
            className="mt-20"
          >
            <div className="relative p-12 bg-gradient-to-br from-slate-800/70 via-slate-900/50 to-slate-800/70 backdrop-blur-lg rounded-3xl border border-slate-700/50 max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center px-5 py-2 bg-teal-500/10 rounded-full text-sm font-semibold mb-6 border border-teal-500/20">
                  <ShieldCheckIcon className="w-5 h-5 mr-2 text-teal-400" />
                  <span className="text-teal-300">Unser Geschäftsmodell</span>
                </div>
                <h3 className="text-4xl lg:text-5xl font-bold text-white mb-6 font-inter">
                  Wie wir arbeiten
                </h3>
                <p className="text-gray-300 text-lg leading-relaxed font-inter max-w-4xl mx-auto mb-8">
                  Transparenz steht bei uns an erster Stelle. Wir erstellen deine professionelle Website komplett kostenlos und du entscheidest, ob sie online geht. Keine versteckten Kosten, keine Startgebühren, monatlich kündbar, kein Risiko.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircleIcon className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-lg mb-2">Kostenlose Erstellung</h4>
                    <p className="text-gray-400">Wir designen und entwickeln deine Website ohne Vorauszahlung oder Vertrag.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircleIcon className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-lg mb-2">Sichere Web-Präsenz</h4>
                    <p className="text-gray-400">SSL-Verschlüsselung, regelmäßige Backups und Schutz vor Cyber-Bedrohungen inklusive.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircleIcon className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-lg mb-2">Online-Buchungssystem</h4>
                    <p className="text-gray-400">Integrierter Kalender für Terminbuchungen direkt über deine Website.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircleIcon className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-lg mb-2">Du entscheidest</h4>
                    <p className="text-gray-400">Erst wenn du 100% zufrieden bist und die Website freigibst, beginnt dein Hosting.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircleIcon className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-lg mb-2">Transparente Preise</h4>
                    <p className="text-gray-400">Nur 99 CHF/Monat für Hosting, Wartung und Support. Monatlich kündbar, keine versteckten Gebühren.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircleIcon className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-lg mb-2">Alles inklusive</h4>
                    <p className="text-gray-400">Updates, technischer Support und kleine Änderungen sind im monatlichen Preis enthalten.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="features" className="py-24 bg-white px-4 relative overflow-hidden">
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

      {/* Pricing Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 px-4 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-br from-teal-300/20 to-cyan-300/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-300/20 to-purple-300/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            {...fadeInUp}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center px-6 py-3 bg-white/70 backdrop-blur-sm rounded-full text-sm font-semibold mb-8 border border-teal-200">
              <SparklesIcon className="w-5 h-5 mr-2 text-teal-600" />
              <span className="text-teal-700">Transparente Preise</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-8 leading-tight">
              Das{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">
                Rundum-Sorglos-Paket
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-inter mb-8">
              Alles was du für deine professionelle Website brauchst - in einem fairen monatlichen Preis.
            </p>
          </motion.div>

          <motion.div
            {...scaleIn}
            className="max-w-2xl mx-auto mt-8"
          >
            <div className="bg-white rounded-3xl shadow-2xl shadow-teal-500/10 border-2 border-teal-200 p-8 relative overflow-visible">
              {/* Popular Badge */}
              <div className="absolute -top-4 right-8">
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                  ⭐ Beliebteste Wahl
                </div>
              </div>

              <div className="text-center mb-8 pt-6">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Rundum-Sorglos-Paket</h3>
                <p className="text-gray-600 text-lg mb-6">Alles inklusive für deine Website</p>
                
                <div className="flex items-center justify-center mb-6">
                  <span className="text-5xl font-bold text-gray-900">99 CHF</span>
                  <span className="text-gray-600 text-xl ml-2">/Monat</span>
                </div>
                
                <div className="flex items-center justify-center space-x-2 text-teal-600 mb-8">
                  <CheckCircleIcon className="w-5 h-5" />
                  <span className="font-semibold">Monatlich kündbar</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircleIcon className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Kostenlose Website-Erstellung</div>
                    <div className="text-gray-600 text-sm">Professionelles Design & Entwicklung ohne Vorabkosten</div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircleIcon className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Premium Hosting & SSL</div>
                    <div className="text-gray-600 text-sm">Schnelle Server, sichere Verschlüsselung, 99.9% Uptime</div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircleIcon className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Online-Buchungssystem</div>
                    <div className="text-gray-600 text-sm">Integrierter Kalender für Terminbuchungen</div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircleIcon className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Technischer Support</div>
                    <div className="text-gray-600 text-sm">Persönlicher Support bei Fragen & Problemen</div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircleIcon className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Regelmäßige Updates</div>
                    <div className="text-gray-600 text-sm">Sicherheitsupdates & kleine Änderungen inklusive</div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircleIcon className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Automatische Backups</div>
                    <div className="text-gray-600 text-sm">Täglich gesichert, damit deine Daten sicher sind</div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircleIcon className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Mobile Optimierung</div>
                    <div className="text-gray-600 text-sm">Perfekt auf allen Geräten - Handy, Tablet, Desktop</div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <button
                  onClick={handleGetStarted}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Jetzt kostenlos starten
                </button>
                <p className="text-center text-sm text-gray-600 mt-4">
                  ✅ Keine Startgebühren • ✅ Monatlich kündbar • ✅ 100% Zufriedenheitsgarantie
                </p>
              </div>
            </div>
          </motion.div>

          {/* Additional Benefits */}
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-3 gap-6 mt-16"
          >
            <div className="text-center p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl">💰</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Keine Startgebühren</h4>
              <p className="text-gray-600 text-sm">Website-Erstellung komplett kostenlos. Du zahlst erst nach Freigabe.</p>
            </div>

            <div className="text-center p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl">⏱️</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Monatlich kündbar</h4>
              <p className="text-gray-600 text-sm">Volle Flexibilität. Keine Mindestlaufzeit. Kündigung jederzeit möglich.</p>
            </div>

            <div className="text-center p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl">🛡️</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Zufriedenheitsgarantie</h4>
              <p className="text-gray-600 text-sm">Du zahlst nur, wenn du zu 100% mit deiner Website zufrieden bist.</p>
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

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <Logo size="md" className="flex-shrink-0" />
                <span className="text-xl font-bold">Customer Flows</span>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Wir erstellen professionelle Websites für kleine und mittlere Unternehmen. 
                Kostenlos, risikofrei und nur dann bezahlt, wenn Sie zu 100% zufrieden sind.
              </p>
              <div className="space-y-3">
                <div className="flex items-center text-gray-300">
                  <PhoneIcon className="w-5 h-5 mr-3 text-teal-400" />
                  <a href="tel:+41784462524" className="hover:text-white transition-colors">
                    +41 (0)78 446 2524
                  </a>
                </div>
                <div className="flex items-center text-gray-300">
                  <EnvelopeIcon className="w-5 h-5 mr-3 text-teal-400" />
                  <a href="mailto:info@customerflows.ch" className="hover:text-white transition-colors">
                    info@customerflows.ch
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Schnellzugriff</h4>
              <ul className="space-y-3">
                <li>
                  <a 
                    href="#features" 
                    onClick={handleSmoothScroll}
                    className="text-gray-300 hover:text-white transition-colors cursor-pointer"
                  >
                    So funktioniert's
                  </a>
                </li>
                <li>
                  <button
                    onClick={handleGetStarted}
                    className="text-gray-300 hover:text-white transition-colors text-left"
                  >
                    Jetzt starten
                  </button>
                </li>
                <li>
                  <a href="mailto:info@customerflows.ch" className="text-gray-300 hover:text-white transition-colors">
                    Kontakt
                  </a>
                </li>
              </ul>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Folgen Sie uns</h4>
              <div className="flex space-x-4">
                <a 
                  href="https://www.facebook.com/profile.php?id=61577761730016" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-700 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-gray-400 text-sm">
                © {new Date().getFullYear()} Customer Flows. Alle Rechte vorbehalten.
              </div>
              <div className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm">
                <a href="/impressum" className="text-gray-400 hover:text-white transition-colors">
                  Impressum
                </a>
                <a href="/datenschutz" className="text-gray-400 hover:text-white transition-colors">
                  Datenschutz
                </a>
                <a href="/agb" className="text-gray-400 hover:text-white transition-colors">
                  AGB
                </a>
                <a href="/widerruf" className="text-gray-400 hover:text-white transition-colors">
                  Widerrufsrecht
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
