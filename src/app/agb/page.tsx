'use client'

import { Logo } from '@/components/Logo'
import Link from 'next/link'

export default function AGB() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 to-blue-900 text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center space-x-3 mb-4">
            <Logo size="md" className="flex-shrink-0" />
            <span className="text-xl font-bold">Customer Flows</span>
          </div>
          <h1 className="text-3xl font-bold">Allgemeine Geschäftsbedingungen (AGB)</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-lg max-w-none">
          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <p className="text-gray-700 leading-relaxed">
              Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge zwischen Customer Flows und unseren Kunden für die Erstellung und das Hosting von Websites.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">§ 1 Geltungsbereich</h2>
          <div className="text-gray-700 space-y-4 mb-8">
            <p>
              Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Geschäftsbeziehungen zwischen Customer Flows (nachfolgend "Anbieter") und dem Kunden. Abweichende Bedingungen des Kunden werden nicht anerkannt, es sei denn, der Anbieter stimmt ihrer Geltung ausdrücklich schriftlich zu.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">§ 2 Vertragsschluss</h2>
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>2.1</strong> Der Kunde registriert sich kostenlos auf unserer Website und füllt den Fragebogen zu seinem Unternehmen aus.
              </p>
              <p>
                <strong>2.2</strong> Basierend auf den Angaben erstellt der Anbieter eine Website-Vorschau, die dem Kunden zur Ansicht präsentiert wird.
              </p>
              <p>
                <strong>2.3</strong> Ein Vertrag kommt erst dann zustande, wenn der Kunde die Website ausdrücklich freigibt und dem Hosting zustimmt.
              </p>
              <p>
                <strong>2.4</strong> Bis zur Freigabe entstehen dem Kunden keinerlei Kosten oder Verpflichtungen.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">§ 3 Leistungen des Anbieters</h2>
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Website-Erstellung (kostenlos)</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Individuelle Website-Gestaltung basierend auf Kundenangaben</li>
                <li>Responsive Design für alle Endgeräte</li>
                <li>Grundlegende SEO-Optimierung</li>
                <li>Integration eines Buchungssystems (falls gewünscht)</li>
                <li>Bis zu 2 Überarbeitungsrunden vor Freigabe</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Hosting und Wartung (99 CHF/Monat)</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Hosting der Website auf sicheren Servern</li>
                <li>SSL-Verschlüsselung</li>
                <li>Regelmäßige Backups</li>
                <li>Technischer Support</li>
                <li>Software-Updates und Sicherheitspatches</li>
                <li>Monatlich eine kleine Änderung (Text/Bild) kostenlos</li>
              </ul>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">§ 4 Preise und Zahlungsbedingungen</h2>
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>4.1</strong> Die Website-Erstellung ist vollständig kostenlos und unverbindlich.
              </p>
              <p>
                <strong>4.2</strong> Nach Freigabe der Website durch den Kunden beträgt die monatliche Hosting-Gebühr 99 CHF (exkl. MwSt.).
              </p>
              <p>
                <strong>4.3</strong> Die Hosting-Gebühr wird monatlich im Voraus per Rechnung fällig.
              </p>
              <p>
                <strong>4.4</strong> Bei Zahlungsverzug können Mahngebühren und Verzugszinsen erhoben werden.
              </p>
              <p>
                <strong>4.5</strong> Alle Preise verstehen sich in Schweizer Franken (CHF) zuzüglich der gesetzlichen Mehrwertsteuer.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">§ 5 Pflichten des Kunden</h2>
          <div className="text-gray-700 space-y-4 mb-8">
            <p>
              <strong>5.1</strong> Der Kunde stellt alle erforderlichen Inhalte (Texte, Bilder, etc.) rechtzeitig und in geeigneter Form zur Verfügung.
            </p>
            <p>
              <strong>5.2</strong> Der Kunde versichert, dass alle bereitgestellten Inhalte rechtlich unbedenklich sind und keine Rechte Dritter verletzen.
            </p>
            <p>
              <strong>5.3</strong> Der Kunde ist verpflichtet, Änderungen seiner Kontaktdaten unverzüglich mitzuteilen.
            </p>
            <p>
              <strong>5.4</strong> Bei technischen Problemen ist der Kunde verpflichtet, angemessene Mitwirkung zu leisten.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">§ 6 Urheberrecht und Nutzungsrechte</h2>
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>6.1</strong> Der Anbieter räumt dem Kunden das einfache, zeitlich unbegrenzte Nutzungsrecht an der erstellten Website ein.
              </p>
              <p>
                <strong>6.2</strong> Die Urheberrechte an Design und Code verbleiben beim Anbieter.
              </p>
              <p>
                <strong>6.3</strong> Der Kunde ist berechtigt, Inhalte seiner Website jederzeit zu ändern, soweit dadurch die technische Funktionalität nicht beeinträchtigt wird.
              </p>
              <p>
                <strong>6.4</strong> Eine Übertragung der Website auf andere Anbieter ist nach Kündigung möglich, jedoch nicht garantiert.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">§ 7 Verfügbarkeit und technische Störungen</h2>
          <div className="text-gray-700 space-y-4 mb-8">
            <p>
              <strong>7.1</strong> Der Anbieter bemüht sich um eine Verfügbarkeit der Website von 99% im Jahresmittel.
            </p>
            <p>
              <strong>7.2</strong> Wartungsarbeiten werden nach Möglichkeit außerhalb der Geschäftszeiten durchgeführt.
            </p>
            <p>
              <strong>7.3</strong> Bei technischen Störungen bemüht sich der Anbieter um schnellstmögliche Behebung während der Geschäftszeiten (Mo-Fr, 9-17 Uhr).
            </p>
            <p>
              <strong>7.4</strong> Höhere Gewalt und Störungen bei Drittanbietern (Internet-Provider, etc.) fallen nicht in den Verantwortungsbereich des Anbieters.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">§ 8 Kündigung</h2>
          <div className="bg-yellow-50 p-6 rounded-lg mb-8">
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>8.1</strong> Der Hosting-Vertrag kann von beiden Seiten mit einer Frist von einem Monat zum Monatsende gekündigt werden.
              </p>
              <p>
                <strong>8.2</strong> Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.
              </p>
              <p>
                <strong>8.3</strong> Bei Kündigung wird die Website nach einer Übergangsfrist von 30 Tagen deaktiviert.
              </p>
              <p>
                <strong>8.4</strong> Der Kunde erhält auf Wunsch eine Kopie seiner Website-Inhalte in einem gängigen Format.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">§ 9 Haftung</h2>
          <div className="text-gray-700 space-y-4 mb-8">
            <p>
              <strong>9.1</strong> Der Anbieter haftet unbeschränkt für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit sowie für Schäden aus der Verletzung einer wesentlichen Vertragspflicht.
            </p>
            <p>
              <strong>9.2</strong> Für sonstige Schäden haftet der Anbieter nur bei Vorsatz und grober Fahrlässigkeit.
            </p>
            <p>
              <strong>9.3</strong> Die Haftung für mittelbare Schäden und entgangenen Gewinn ist ausgeschlossen.
            </p>
            <p>
              <strong>9.4</strong> Der Kunde ist für die Rechtmäßigkeit der von ihm bereitgestellten Inhalte selbst verantwortlich.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">§ 10 Datenschutz</h2>
          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <p className="text-gray-700">
              Der Anbieter verpflichtet sich zur Einhaltung der geltenden Datenschutzbestimmungen. Weitere Informationen finden Sie in unserer <Link href="/datenschutz" className="text-teal-600 hover:text-teal-700 font-semibold">Datenschutzerklärung</Link>.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">§ 11 Schlussbestimmungen</h2>
          <div className="text-gray-700 space-y-4 mb-8">
            <p>
              <strong>11.1</strong> Es gilt schweizerisches Recht unter Ausschluss des UN-Kaufrechts.
            </p>
            <p>
              <strong>11.2</strong> Gerichtsstand ist Zürich, Schweiz.
            </p>
            <p>
              <strong>11.3</strong> Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, berührt dies nicht die Wirksamkeit der übrigen Bestimmungen.
            </p>
            <p>
              <strong>11.4</strong> Änderungen dieser AGB bedürfen der Schriftform und werden dem Kunden mindestens vier Wochen vor Inkrafttreten mitgeteilt.
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <p className="text-gray-700">
              <strong>Customer Flows</strong><br/>
              Customerflows<br/>
              <br/>
              8000 Zürich<br/>
              Schweiz<br/>
              E-Mail: info@customerflows.ch<br/>
              Telefon: +41 (0)78 446 2524
            </p>
          </div>

          <div className="text-sm text-gray-500 mb-8">
            Stand dieser AGB: {new Date().toLocaleDateString('de-CH')}
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
