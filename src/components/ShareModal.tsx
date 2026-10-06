import React, { useState } from 'react';
import { SeasonPlan } from '../types/swim';
import { 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Globe, 
  Download, 
  Upload, 
  Server, 
  X,
  FileCode,
  ShieldCheck
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  season: SeasonPlan;
  onImportSeason: (imported: SeasonPlan) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  season,
  onImportSeason,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'export' | 'hosting'>('link');

  if (!isOpen) return null;

  // Use current window location or the shared run.app URL
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-pre-x4oivb43xenprkr6acubrx-449396692848.europe-west2.run.app';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(season, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `swim_coach_season_${season.name.replace(/\s+/g, '_').toLowerCase()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(season, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && parsed.weeks && parsed.lanes) {
            onImportSeason(parsed);
            alert('Season & Squad plan imported successfully!');
            onClose();
          } else {
            alert('Invalid swim squad JSON file format.');
          }
        } catch (err) {
          alert('Failed to parse JSON file.');
        }
      };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60 sticky top-0 z-10">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Teilen & Web-Zugriff</h2>
              <p className="text-xs text-slate-400">Mache den Schwimmtrainer für Athleten, Trainerteam und Eltern zugänglich</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 pt-2">
          <button
            onClick={() => setActiveTab('link')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer ${
              activeTab === 'link'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Direkter Web-Link</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer ${
              activeTab === 'export'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export & Daten-Backup</span>
          </button>

          <button
            onClick={() => setActiveTab('hosting')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer ${
              activeTab === 'hosting'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Eigene Domain & Bereitstellung</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {activeTab === 'link' && (
            <div className="space-y-5">
              {/* Live Web Link Box */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  Deine Web-App-Adresse (URL):
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={currentUrl}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 select-all outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg flex items-center space-x-1.5 transition shrink-0 cursor-pointer"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl ? 'Kopiert!' : 'Link kopieren'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Jeder mit dieser URL kann die Anwendung auf Computer, Tablet oder Smartphone aufrufen.
                </p>
              </div>

              {/* Instructions on AI Studio Sharing */}
              <div className="bg-cyan-950/30 border border-cyan-500/20 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Freigabe über Google AI Studio</span>
                </h4>
                <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside pl-1 leading-relaxed">
                  <li>
                    Sieh oben rechts in die Leiste von <strong>Google AI Studio</strong>.
                  </li>
                  <li>
                    Klicke auf den Button <strong>"Share"</strong> neben den App-Steuerelementen.
                  </li>
                  <li>
                    Setze die Berechtigung auf <strong>"Anyone with the link can view"</strong> oder füge E-Mails hinzu.
                  </li>
                  <li>
                    Kopiere den öffentlichen Link und teile ihn mit Trainern, Schwimmern oder Eltern!
                  </li>
                </ol>
              </div>

              {/* Mobile / Deck Whiteboard Usage Tip */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 space-y-1">
                <span className="font-bold text-slate-200 block">Tipp fürs Beckenrand-Tablet:</span>
                <p>
                  Trainer können diese URL auf einem iPad oder wasserdichten Tablet am Beckenrand öffnen und den Reiter <strong>"Beckenrand-Whiteboard"</strong> mit laufender digitaler Pace-Uhr während des Trainings nutzen.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-5">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Kader- & Saison-Backup herunterladen
                </h4>
                <p className="text-xs text-slate-400">
                  Exportiere deinen aktuellen Saisonplan, Mikrozyklen, Bahnen-CSS-Zeiten, Kaderlisten und Übungsbibliothek als JSON-Datei.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={handleExportJson}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Saisonplan (.json) herunterladen</span>
                  </button>
                  <button
                    onClick={handleCopyJson}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-lg flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    {copiedJson ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedJson ? 'JSON kopiert' : 'JSON kopieren'}</span>
                  </button>
                </div>
              </div>

              {/* Import Section */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Kader- & Saison-Datei importieren
                </h4>
                <p className="text-xs text-slate-400">
                  Lade Einheiten, Makrozyklen und Bahnenkonfigurationen, die von einem anderen Trainer erstellt oder aus einem vorherigen Backup gesichert wurden.
                </p>
                <label className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs rounded-lg cursor-pointer transition">
                  <Upload className="w-3.5 h-3.5" />
                  <span>JSON-Datei zum Importieren wählen</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'hosting' && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-white uppercase tracking-wider text-xs">
                  Als eigenständige Website bereitstellen
                </h4>
                <p className="text-slate-400">
                  Diese App basiert auf modernem <strong>React + Vite + TypeScript</strong>. Sie erfordert kein schweres Backend und kompiliert in blitzschnelles statisches HTML, JavaScript und CSS.
                </p>
              </div>

              <div className="space-y-3">
                <h5 className="font-bold text-cyan-300">Option 1: Bereitstellung auf Vercel / Netlify / Cloudflare Pages</h5>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-400 pl-1">
                  <li>Code in ein GitHub-Repository übertragen.</li>
                  <li>Repository mit <strong>Vercel</strong>, <strong>Netlify</strong> oder <strong>Cloudflare Pages</strong> verknüpfen.</li>
                  <li>Build Command: <code className="bg-slate-950 px-1.5 py-0.5 rounded text-cyan-300">npm run build</code></li>
                  <li>Publish Directory: <code className="bg-slate-950 px-1.5 py-0.5 rounded text-cyan-300">dist</code></li>
                  <li>Deine App ist unter deiner eigenen Domain erreichbar (z.B. <code className="text-white">schwimmen.deinverein.de</code>).</li>
                </ol>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <h5 className="font-bold text-cyan-300">Option 2: Bereitstellung über Firebase Hosting</h5>
                <pre className="bg-slate-950 p-3 rounded-lg text-slate-300 font-mono text-[11px] overflow-x-auto">
{`npm run build
firebase init hosting
firebase deploy --only hosting`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
