'use client'

import { Logo } from '@/components/Logo'
import Link from 'next/link'

export default function Impressum() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 to-blue-900 text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center space-x-3 mb-4">
            <Logo size="md" className="flex-shrink-0" />
            <span className="text-xl font-bold">Customer Flows</span>
          </div>
          <h1 className="text-3xl font-bold">Impressum</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Angaben gemäß Art. 8 UWG (Schweiz)</h2>
          
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Anbieter</h3>
            <p className="text-gray-700 leading-relaxed">
              <strong>Customer Flows</strong><br/>
              <br/>
              <br/>
              8000 Zürich<br/>
              Schweiz
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Kontakt</h3>
              <p className="text-gray-700">
                <strong>Telefon:</strong> +41 (0)78 446 25 24<br/>
                <strong>E-Mail:</strong> info@customerflows.ch<br/>
                <strong>Website:</strong> www.customerflows.ch
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Geschäftstätigkeit</h3>
              <p className="text-gray-700">
                Webdesign und Webentwicklung<br/>
                Website-Hosting und Wartung<br/>
                Digitale Marketing-Lösungen
              </p>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mb-4">Haftungsausschluss</h3>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>Inhalt des Onlineangebotes:</strong><br/>
              Der Autor übernimmt keinerlei Gewähr für die Aktualität, Korrektheit, Vollständigkeit oder Qualität der bereitgestellten Informationen. Haftungsansprüche gegen den Autor, welche sich auf Schäden materieller oder ideeller Art beziehen, die durch die Nutzung oder Nichtnutzung der dargebotenen Informationen bzw. durch die Nutzung fehlerhafter und unvollständiger Informationen verursacht wurden, sind grundsätzlich ausgeschlossen.
            </p>

            <p>
              <strong>Verweise und Links:</strong><br/>
              Bei direkten oder indirekten Verweisen auf fremde Internetseiten ("Links"), die außerhalb des Verantwortungsbereiches des Autors liegen, würde eine Haftungsverpflichtung ausschließlich in dem Fall in Kraft treten, in dem der Autor von den Inhalten Kenntnis hat und es ihm technisch möglich und zumutbar wäre, die Nutzung im Falle rechtswidriger Inhalte zu verhindern.
            </p>

            <p>
              <strong>Urheber- und Kennzeichenrecht:</strong><br/>
              Der Autor ist bestrebt, in allen Publikationen die Urheberrechte der verwendeten Grafiken, Tondokumente, Videosequenzen und Texte zu beachten, von ihm selbst erstellte Grafiken, Tondokumente, Videosequenzen und Texte zu nutzen oder auf lizenzfreie Grafiken, Tondokumente, Videosequenzen und Texte zurückzugreifen.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link 
              href="/" 
              className="inline-flex items-center text-teal-600 hover:text-teal-700 font-semibold"
            >
              ← Zurück zur Startseite
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
