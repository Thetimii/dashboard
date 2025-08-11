'use client'

import { Logo } from '@/components/Logo'
import Link from 'next/link'

export default function Datenschutz() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 to-blue-900 text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center space-x-3 mb-4">
            <Logo size="md" className="flex-shrink-0" />
            <span className="text-xl font-bold">Customer Flows</span>
          </div>
          <h1 className="text-3xl font-bold">Datenschutzerklärung</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-lg max-w-none">
          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <p className="text-gray-700 leading-relaxed">
              Diese Datenschutzerklärung klärt Sie über die Art, den Umfang und Zweck der Verarbeitung von personenbezogenen Daten innerhalb unseres Onlineangebotes und der mit ihm verbundenen Webseiten, Funktionen und Inhalte auf.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Verantwortlicher</h2>
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <p className="text-gray-700">
              <strong>Customer Flows</strong><br/>
              Inhaber: Dario Näpfer<br/>
              <br/>
              8600 Dübendorf<br/>
              Schweiz<br/>
              E-Mail: info@customerflows.ch<br/>
              Telefon: +41 (0)78 446 25 24
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Erhebung und Verarbeitung personenbezogener Daten</h2>
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Registrierung und Kontaktformulare</h3>
              <p className="text-gray-700 mb-3">
                Bei der Registrierung für unseren Service erheben wir folgende Daten:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Name und Vorname</li>
                <li>E-Mail-Adresse</li>
                <li>Geschäftsinformationen (Branche, Zielgruppe, etc.)</li>
                <li>Optional: Telefonnummer, Firmenlogo, Bilder</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Automatisch erhobene Daten</h3>
              <p className="text-gray-700 mb-3">
                Beim Besuch unserer Website werden automatisch folgende Daten erhoben:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>IP-Adresse</li>
                <li>Datum und Uhrzeit des Zugriffs</li>
                <li>Browsertyp und -version</li>
                <li>Betriebssystem</li>
                <li>Referrer-URL</li>
              </ul>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">3. Zweck der Datenverarbeitung</h2>
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <p className="text-gray-700 mb-3">Wir verwenden Ihre Daten für folgende Zwecke:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Bereitstellung und Verbesserung unserer Dienstleistungen</li>
              <li>Erstellung Ihrer individuellen Website</li>
              <li>Kommunikation bezüglich Ihres Projekts</li>
              <li>Abrechnung und Zahlungsabwicklung</li>
              <li>Technischer Support und Wartung</li>
              <li>Erfüllung rechtlicher Verpflichtungen</li>
            </ul>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Rechtsgrundlagen</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO):</strong><br/>
              Die Verarbeitung erfolgt zur Erfüllung eines Vertrags oder zur Durchführung vorvertraglicher Maßnahmen.
            </p>
            <p>
              <strong>Berechtigte Interessen (Art. 6 Abs. 1 lit. f DSGVO):</strong><br/>
              Die Verarbeitung erfolgt zur Wahrung unserer berechtigten Interessen, sofern nicht die Interessen oder Grundrechte der betroffenen Person überwiegen.
            </p>
            <p>
              <strong>Einwilligung (Art. 6 Abs. 1 lit. a DSGVO):</strong><br/>
              Soweit wir eine ausdrückliche Einwilligung einholen, erfolgt die Verarbeitung auf dieser Grundlage.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">5. Datenweitergabe</h2>
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <p className="text-gray-700">
              Eine Übermittlung Ihrer personenbezogenen Daten an Dritte findet nur statt, soweit dies zur Erfüllung unserer Dienstleistungen erforderlich ist (z.B. Hosting-Provider, Zahlungsdienstleister) oder Sie ausdrücklich eingewilligt haben. Alle Partner sind vertraglich zur Einhaltung der Datenschutzbestimmungen verpflichtet.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Speicherdauer</h2>
          <div className="text-gray-700 space-y-4">
            <p>
              Wir speichern Ihre personenbezogenen Daten nur so lange, wie es für die jeweiligen Zwecke erforderlich ist oder gesetzliche Aufbewahrungsfristen bestehen.
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Vertragsdaten: Bis zur vollständigen Abwicklung des Vertrags plus gesetzliche Aufbewahrungsfristen</li>
              <li>Kommunikationsdaten: 3 Jahre nach letztem Kontakt</li>
              <li>Website-Daten: Nach Projektabschluss oder Vertragsende</li>
            </ul>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">7. Ihre Rechte</h2>
          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <p className="text-gray-700 mb-4">Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:</p>
            <div className="grid md:grid-cols-2 gap-4 text-gray-700">
              <ul className="list-disc list-inside space-y-2">
                <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
                <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
                <li>Recht auf Löschung (Art. 17 DSGVO)</li>
                <li>Recht auf Einschränkung (Art. 18 DSGVO)</li>
              </ul>
              <ul className="list-disc list-inside space-y-2">
                <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
                <li>Recht auf Widerspruch (Art. 21 DSGVO)</li>
                <li>Recht auf Widerruf der Einwilligung</li>
                <li>Beschwerderecht bei Aufsichtsbehörde</li>
              </ul>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Datensicherheit</h2>
          <div className="text-gray-700 space-y-4">
            <p>
              Wir setzen technische und organisatorische Sicherheitsmaßnahmen ein, um Ihre Daten gegen zufällige oder vorsätzliche Manipulationen, Verlust, Zerstörung oder gegen den Zugriff unberechtigter Personen zu schützen.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold mb-2">Unsere Sicherheitsmaßnahmen umfassen:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>SSL-Verschlüsselung für alle Datenübertragungen</li>
                <li>Regelmäßige Sicherheits-Updates</li>
                <li>Zugriffskontrollen und Berechtigungsmanagement</li>
                <li>Regelmäßige Backups</li>
              </ul>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">9. Cookies und Tracking</h2>
          <div className="text-gray-700 space-y-4">
            <p>
              Unsere Website verwendet Cookies, um die Funktionalität zu verbessern und die Nutzung zu analysieren. Sie können Ihre Browser-Einstellungen so konfigurieren, dass Cookies blockiert oder nur nach Ihrer Zustimmung gesetzt werden.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">10. Hotjar Analytics</h2>
          <div className="bg-orange-50 p-6 rounded-lg mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">10.1 Was ist Hotjar?</h3>
            <p className="text-gray-700 mb-4">
              Wir nutzen <strong>Hotjar</strong> zur Analyse des Nutzerverhaltens auf unserer Website, um die Benutzererfahrung zu verbessern. Hotjar ist ein Service der Hotjar Ltd., Malta.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">10.2 Welche Daten sammelt Hotjar?</h3>
            <p className="text-gray-700 mb-3">Hotjar sammelt folgende Informationen:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
              <li>Geräteinformationen (Bildschirmgröße, Gerätetyp, Browser)</li>
              <li>Anonymisierte IP-Adresse (letzte Ziffern werden entfernt)</li>
              <li>Besuchte Seiten und Interaktionen (Klicks, Mausbewegungen, Scroll-Verhalten)</li>
              <li>Standortdaten (nur Land)</li>
              <li>Spracheinstellungen</li>
            </ul>
            
            <div className="bg-white p-4 rounded border-l-4 border-orange-400 mb-4">
              <p className="text-gray-700 font-medium">
                ⚠️ <strong>Wichtig:</strong> Hotjar zeichnet KEINE Eingaben in Passwort-, Kreditkarten- oder anderen sensiblen Formularfeldern auf.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">10.3 Rechtsgrundlage</h3>
            <p className="text-gray-700 mb-4">
              Die Verarbeitung erfolgt auf Grundlage Ihrer <strong>Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)</strong>, 
              die Sie über unser Cookie-Banner erteilen können.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">10.4 Speicherdauer und Datenschutz</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
              <li>Hotjar speichert Daten für maximal 365 Tage</li>
              <li>IP-Adressen werden automatisch anonymisiert</li>
              <li>Hotjar ist vertraglich verpflichtet, keine gesammelten Daten zu verkaufen</li>
              <li>Datenverarbeitung erfolgt auf Servern in der EU (DSGVO-konform)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">10.5 Ihre Optionen</h3>
            <div className="bg-white p-4 rounded border-l-4 border-green-400 mb-4">
              <p className="text-gray-700 mb-2">
                <strong>Opt-Out:</strong> Sie können Hotjar-Tracking jederzeit deaktivieren:
              </p>
              <a 
                href="https://www.hotjar.com/policies/do-not-track/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                🚫 Hotjar Opt-Out aktivieren
              </a>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">10.6 Weitere Informationen</h3>
            <p className="text-gray-700">
              Ausführliche Informationen finden Sie in Hotjars Datenschutzerklärung: 
              <a 
                href="https://www.hotjar.com/legal/policies/privacy/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-orange-600 hover:text-orange-700 underline ml-1"
              >
                https://www.hotjar.com/legal/policies/privacy/
              </a>
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">11. Änderungen der Datenschutzerklärung</h2>
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <p className="text-gray-700">
              Wir behalten uns vor, diese Datenschutzerklärung zu ändern, um sie an geänderte Rechtslagen oder bei Änderungen des Dienstes sowie der Datenverarbeitung anzupassen. Dies gilt jedoch nur im Hinblick auf Erklärungen zur Datenverarbeitung. Sofern Einwilligungen des Nutzers erforderlich sind oder Bestandteile der Datenschutzerklärung Regelungen des Vertragsverhältnisses mit den Nutzern enthalten, erfolgen die Änderungen nur mit Zustimmung der Nutzer.
            </p>
          </div>

          <div className="bg-teal-50 p-6 rounded-lg mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Kontakt bei Datenschutzfragen</h3>
            <p className="text-gray-700">
              Bei Fragen zum Datenschutz oder zur Ausübung Ihrer Rechte kontaktieren Sie uns unter:<br/>
              <strong>E-Mail:</strong> datenschutz@customerflows.ch<br/>
              <strong>Telefon:</strong> +41 (0)78 446 25 24
            </p>
          </div>

          <div className="text-sm text-gray-500 mb-8">
            Stand dieser Datenschutzerklärung: {new Date().toLocaleDateString('de-CH')}
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
