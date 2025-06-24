'use client'

import { Logo } from '@/components/Logo'
import Link from 'next/link'

export default function Widerruf() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 to-blue-900 text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center space-x-3 mb-4">
            <Logo size="md" className="flex-shrink-0" />
            <span className="text-xl font-bold">Customer Flows</span>
          </div>
          <h1 className="text-3xl font-bold">Widerrufsrecht</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-lg max-w-none">
          <div className="bg-green-50 p-6 rounded-lg mb-8">
            <p className="text-gray-700 leading-relaxed font-semibold">
              Da die Website-Erstellung vollständig kostenlos erfolgt und Sie erst nach Ihrer ausdrücklichen Freigabe Zahlungsverpflichtungen eingehen, steht Ihnen ein umfassendes Widerrufsrecht zu.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">Ihr Widerrufsrecht</h2>
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <p className="text-gray-700 leading-relaxed">
              Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen den Hosting-Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsschlusses (= Tag der Website-Freigabe).
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">Ausübung des Widerrufsrechts</h2>
          <div className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Widerruf erklären</h3>
              <p className="text-gray-700 mb-4">
                Um Ihr Widerrufsrecht auszuüben, müssen Sie uns mittels einer eindeutigen Erklärung über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das unten stehende Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.
              </p>
              <div className="bg-white p-4 rounded border">
                <p className="text-gray-700 text-sm">
                  <strong>Kontakt für Widerruf:</strong><br/>
                  Customer Flows<br/>
                  <br/>
                  <br/>
                  8000 Zürich<br/>
                  Schweiz<br/>
                  E-Mail: widerruf@customerflows.ch<br/>
                  Telefon: +41 (0)78 446 2524
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Widerrufsfrist einhalten</h3>
              <p className="text-gray-700">
                Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">Folgen des Widerrufs</h2>
          <div className="bg-yellow-50 p-6 rounded-lg mb-8">
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>Rückzahlung:</strong><br/>
                Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist.
              </p>
              <p>
                <strong>Rückzahlungsart:</strong><br/>
                Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.
              </p>
              <p>
                <strong>Website-Deaktivierung:</strong><br/>
                Bei Widerruf wird Ihre Website unverzüglich deaktiviert. Sie erhalten auf Wunsch eine Kopie Ihrer Website-Inhalte.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">Vorzeitiger Leistungsbeginn</h2>
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <p className="text-gray-700">
              Wenn Sie möchten, dass die Hosting-Dienstleistung während der Widerrufsfrist beginnt, stellen wir Ihnen einen entsprechenden Antrag zur Verfügung. In diesem Fall zahlen Sie uns einen angemessenen Betrag, der dem Anteil der bis zu dem Zeitpunkt, zu dem Sie uns von der Ausübung des Widerrufsrechts hinsichtlich dieses Vertrags unterrichten, bereits erbrachten Dienstleistungen im Vergleich zum Gesamtumfang der im Vertrag vorgesehenen Dienstleistungen entspricht.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">Muster-Widerrufsformular</h2>
          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <p className="text-gray-700 mb-4">
              Wenn Sie den Vertrag widerrufen wollen, füllen Sie bitte dieses Formular aus und senden Sie es zurück:
            </p>
            <div className="bg-white p-6 rounded border space-y-4">
              <p className="text-gray-700">
                <strong>An:</strong><br/>
                Customer Flows<br/>
                <br/>
                <br/>
                8000 Zürich<br/>
                Schweiz<br/>
                E-Mail: widerruf@customerflows.ch
              </p>
              <div className="border-t pt-4">
                <p className="text-gray-700 mb-4">
                  <strong>Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über die Erbringung der folgenden Dienstleistung (*):</strong>
                </p>
                <div className="space-y-3 text-gray-700">
                  <p>Website-Hosting und Wartung</p>
                  <p><strong>Bestellt am (*):</strong> _______________</p>
                  <p><strong>Name des/der Verbraucher(s):</strong> _______________</p>
                  <p><strong>Anschrift des/der Verbraucher(s):</strong> _______________</p>
                  <p><strong>Unterschrift des/der Verbraucher(s):</strong> _______________</p>
                  <p><strong>Datum:</strong> _______________</p>
                </div>
                <p className="text-sm text-gray-500 mt-4">(*) Unzutreffendes streichen.</p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">Besonderheiten unseres Service</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">✅ Kostenlose Erstellung</h3>
              <p className="text-gray-700">
                Da die Website-Erstellung vollständig kostenlos ist, haben Sie kein finanzielles Risiko vor der Freigabe.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">✅ Freigabe erforderlich</h3>
              <p className="text-gray-700">
                Sie gehen erst dann Zahlungsverpflichtungen ein, wenn Sie die fertige Website ausdrücklich freigeben.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">✅ 14 Tage Widerruf</h3>
              <p className="text-gray-700">
                Auch nach der Freigabe haben Sie 14 Tage Zeit, den Hosting-Vertrag ohne Angabe von Gründen zu widerrufen.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">✅ Transparente Preise</h3>
              <p className="text-gray-700">
                Nur 99 CHF/Monat für Hosting und Wartung. Keine versteckten Kosten oder Zusatzgebühren.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">Häufige Fragen zum Widerrufsrecht</h2>
          <div className="space-y-6 mb-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🤔 Kann ich vor der Website-Freigabe widerrufen?</h3>
              <p className="text-gray-700">
                Da Sie vor der Freigabe keine Zahlungsverpflichtungen eingehen, ist ein Widerruf nicht erforderlich. Sie können den Prozess jederzeit ohne Kosten abbrechen.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🤔 Was passiert mit meiner Website bei Widerruf?</h3>
              <p className="text-gray-700">
                Bei Widerruf wird die Website deaktiviert. Sie erhalten auf Wunsch eine Kopie Ihrer Inhalte und können diese bei einem anderen Anbieter verwenden.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🤔 Muss ich einen Grund für den Widerruf angeben?</h3>
              <p className="text-gray-700">
                Nein, Sie können den Vertrag innerhalb von 14 Tagen ohne Angabe von Gründen widerrufen.
              </p>
            </div>
          </div>

          <div className="bg-teal-50 p-6 rounded-lg mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Fragen zum Widerrufsrecht?</h3>
            <p className="text-gray-700">
              Bei Fragen zum Widerrufsrecht oder zur Ausübung kontaktieren Sie uns gerne:<br/>
              <strong>E-Mail:</strong> widerruf@customerflows.ch<br/>
              <strong>Telefon:</strong> +41 (0)78 446 2524
            </p>
          </div>

          <div className="text-sm text-gray-500 mb-8">
            Stand dieser Widerrufsbelehrung: {new Date().toLocaleDateString('de-CH')}
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
