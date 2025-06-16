'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  MapPinIcon, 
  BuildingStorefrontIcon, 
  HandshakeIcon, 
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline'

export function LandingPage() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push('/signup')
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            {...fadeInUp}
            className="text-4xl md:text-6xl font-serif font-bold text-gray-900 dark:text-white mb-6 leading-tight"
          >
            Mehr Kunden. Mehr Vertrauen.{' '}
            <span className="text-blue-600 dark:text-blue-400">
              Dein Geschäft sichtbar im Internet
            </span>{' '}
            – für nur 99 CHF.
          </motion.h1>
          
          <motion.p 
            {...fadeInUp}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed font-inter"
          >
            Sei online auffindbar, baue Vertrauen auf und gewinne neue Kunden – ohne Vorwissen, 
            ohne versteckte Kosten. Du zahlst erst, wenn du dein Design freigibst.
          </motion.p>
          
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg font-inter"
            >
              👉 Jetzt kostenlos starten
            </button>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <motion.div
            {...fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 dark:text-white mb-4">
              Deine Website ist mehr als nur eine Visitenkarte –{' '}
              <span className="text-blue-600 dark:text-blue-400">
                sie ist dein Schaufenster für die Welt.
              </span>
            </h2>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid md:grid-cols-2 gap-8"
          >
            <motion.div variants={fadeInUp} className="flex items-start space-x-4 p-6 rounded-lg bg-gray-50 dark:bg-gray-800">
              <MapPinIcon className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 font-inter">
                  📍 Du wirst gefunden.
                </h3>
                <p className="text-gray-600 dark:text-gray-300 font-inter">
                  Kunden suchen online – sei dort, wo sie dich erwarten.
                </p>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex items-start space-x-4 p-6 rounded-lg bg-gray-50 dark:bg-gray-800">
              <BuildingStorefrontIcon className="w-8 h-8 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 font-inter">
                  🏪 Du machst dein Geschäft sichtbar.
                </h3>
                <p className="text-gray-600 dark:text-gray-300 font-inter">
                  Auch wenn du schläfst, dein Online-Schaufenster ist offen.
                </p>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex items-start space-x-4 p-6 rounded-lg bg-gray-50 dark:bg-gray-800">
              <HandshakeIcon className="w-8 h-8 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 font-inter">
                  🤝 Du gewinnst Vertrauen.
                </h3>
                <p className="text-gray-600 dark:text-gray-300 font-inter">
                  Eine professionelle Website zeigt, dass du es ernst meinst.
                </p>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex items-start space-x-4 p-6 rounded-lg bg-gray-50 dark:bg-gray-800">
              <ChatBubbleLeftRightIcon className="w-8 h-8 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 font-inter">
                  💬 Du wirst kontaktiert.
                </h3>
                <p className="text-gray-600 dark:text-gray-300 font-inter">
                  Egal ob Termine, Anfragen oder Bestellungen – direkt über deine Website.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <motion.div
            {...fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 dark:text-white mb-4">
              In 3 Schritten zu deinem professionellen Webauftritt:
            </h2>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-8"
          >
            <motion.div variants={fadeInUp} className="flex items-start space-x-6 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 font-inter">
                  Registrieren
                </h3>
                <p className="text-gray-600 dark:text-gray-300 font-inter">
                  Erstelle deinen kostenlosen Zugang.
                </p>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex items-start space-x-6 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 font-inter">
                  Fragebogen ausfüllen
                </h3>
                <p className="text-gray-600 dark:text-gray-300 font-inter">
                  Sag uns, was du brauchst – wir übernehmen den Rest.
                </p>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex items-start space-x-6 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 font-inter">
                  Design anschauen & freigeben
                </h3>
                <p className="text-gray-600 dark:text-gray-300 font-inter">
                  Erst wenn du zufrieden bist, beginnt dein Hosting für 99 CHF/Monat.
                </p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.6 }}
            className="text-center mt-12"
          >
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 font-inter">
              Kein Risiko. Kein Stress. Kein Kleingedrucktes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid md:grid-cols-2 gap-8"
          >
            <motion.div variants={fadeInUp} className="p-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-lg text-gray-800 dark:text-gray-200 mb-4 font-inter italic">
                "Ich habe durch die Website jede Woche neue Anfragen – und das ganz ohne Werbung!"
              </blockquote>
              <cite className="text-gray-600 dark:text-gray-400 font-semibold font-inter">
                – Elias, Malerbetrieb aus Zürich
              </cite>
            </motion.div>

            <motion.div variants={fadeInUp} className="p-8 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-lg text-gray-800 dark:text-gray-200 mb-4 font-inter italic">
                "Ich war nie online – jetzt habe ich endlich etwas, das ich auch stolz zeigen kann."
              </blockquote>
              <cite className="text-gray-600 dark:text-gray-400 font-semibold font-inter">
                – Aylin, Kosmetikstudio Basel
              </cite>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            {...fadeInUp}
            className="text-3xl md:text-4xl font-serif font-bold text-white mb-6"
          >
            Zeig dich der Welt. Starte jetzt.
          </motion.h2>
          
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.2 }}
          >
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg font-inter"
            >
              ✅ Jetzt kostenlos registrieren & sichtbar werden
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
