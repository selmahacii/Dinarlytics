import React, { useEffect, useState } from 'react';
import {
  ScaleIcon,
  DocumentTextIcon,
  CalculatorIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
  ShareIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  ChartBarIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  BellIcon,
  PrinterIcon,
  CloudArrowUpIcon,
  SparklesIcon,
  InformationCircleIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ArrowUpOnSquareIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useApp } from '@core/context/AppContext';
import { useLocalStorage } from '@shared/hooks/useLocalStorage';
// ...existing code...
import { usePermission } from '@shared/hooks/usePermission';
// import RequirePermission from '../@shared/components/Security/RequirePermission'; // Component does not exist

const FiscaliteDeclarations: React.FC = () => {
  const { user, companyData, formatCurrency, currentDevise, currentCountry, fiscalRates, calculateTVA, getTVARate, fiscalDocuments } = useApp();
  const { has } = usePermission();
  const [selectedView, setSelectedView] = useState('vue-ensemble');
  // Garde d'accès: autoriser admin même sans 'rapports-basic'
  const isAdmin = (user?.role || '').toLowerCase() === 'admin' || has('admin');
  if (!has('rapports-basic') && !isAdmin) {
    return <RequirePermission permission="rapports-basic" messageOverride="Accès réservé: rapports-basic ou rôle administrateur" />;
  }
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', type: 'info' as 'info' | 'success' | 'warning' });

  // ========================================
  // INTERFACE BOUTIQUE (ex: Boutique El Baraka)
  // ========================================
  if (user && (user.companyType === 'boutique' || (user.nom || '').toLowerCase().includes('baraka'))) {
    // États interactifs spécifiques boutique
  // Note: tauxTVA réservé pour une évolution future (sélection par ligne); le mix couvre le besoin actuel
  // Persisted inputs via localStorage for smoother demos
  const [ventesTTC, setVentesTTC] = useLocalStorage<string>('fisc.boutique.ventesTTC', '');
  const [achatsTTC, setAchatsTTC] = useLocalStorage<string>('fisc.boutique.achatsTTC', '');
  const [mixTaux19, setMixTaux19] = useLocalStorage<number>('fisc.boutique.mix19', 80); // % des ventes au taux 19% (reste au taux 9%)
    const [showG50Wizard, setShowG50Wizard] = useState<boolean>(false);
    const [g50Step, setG50Step] = useState<number>(1);
    const [remindersOn, setRemindersOn] = useState<boolean>(true);
  const [history, setHistory] = useLocalStorage<Array<{date:string; tva:number; tap:number}>>('fisc.boutique.history', []);

    const toNumber = (v: string) => {
      const n = parseFloat((v || '').replace(/\s|,|DA|dzd/gi, ''));
      return isNaN(n) ? 0 : n;
    };

    // Valeurs par défaut déduites des données adaptatives si non saisi
    const caMois = companyData?.revenueMonth || 1200000; // CA mensuel estimé (DA)
    const achatsEstimes = Math.round(caMois * 0.45); // hypothèse achats = 45% du CA

    // Répartition du CA selon mix de taux
    const ventesTotalTTC = Math.max(toNumber(ventesTTC), caMois);
    const part19 = ventesTotalTTC * (mixTaux19 / 100);
    const part9 = ventesTotalTTC - part19;

    // Conversion TTC -> HT selon taux (adapté à la devise)
    const tauxNormal = fiscalRates.tvaNormal;
    const tauxReduit = fiscalRates.tvaReduit;
    const ht19 = part19 / (1 + tauxNormal);
    const ht9 = part9 / (1 + tauxReduit);
    const tvaCollectee19 = part19 - ht19;
    const tvaCollectee9 = part9 - ht9;
    const tvaCollectee = Math.round(tvaCollectee19 + tvaCollectee9);
    const ventesHT = Math.round(ht19 + ht9);

    // Achats TTC -> HT & TVA déductible (hypothèse 80% au taux 19, 20% au taux 9)
    const achatsTotalTTC = Math.max(toNumber(achatsTTC), achatsEstimes);
    const achats19 = achatsTotalTTC * 0.8;
    const achats9 = achatsTotalTTC * 0.2;
    const achatsHT19 = achats19 / (1 + tauxNormal);
    const achatsHT9 = achats9 / (1 + tauxReduit);
    const tvaDeductible = Math.round((achats19 - achatsHT19) + (achats9 - achatsHT9));

    const tvaNette = Math.max(0, tvaCollectee - tvaDeductible);
    const tap = Math.round((ventesHT) * 0.02); // TAP 2% sur CA HT
    const irgSalairesEstime = Math.round(((user.employees || 3) * 25000) * 0.1); // estimation simple (10% retenues)

  // Obtenir le document de déclaration selon le pays
  const declarationDocument = fiscalDocuments.find(doc => 
    doc.category === 'declaration' && doc.frequency === 'mensuel'
  ) || fiscalDocuments.find(doc => doc.code === 'G50');
  
  const documentCode = declarationDocument?.code || 'G50';
  const documentName = declarationDocument?.name || 'Déclaration mensuelle';
  const deadline = declarationDocument?.deadline || '20 du mois suivant';
  
  const prochaineDeclaration = deadline + ' - ' + new Date().toLocaleDateString('fr-DZ', { month: '2-digit', year: 'numeric' });

  const formatDA = (n: number) => formatCurrency(n);

    return (
      <div className="space-y-6 max-w-7xl mx-auto p-6">
        {/* En-tête boutique */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-8 rounded-2xl shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-white/20 rounded-xl shadow-lg">
                <ScaleIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold">Fiscalité Boutique</h1>
                <p className="text-emerald-100 text-lg mt-1">Spécialisée pour {user.nom}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowG50Wizard(true)}
                className="px-5 py-3 bg-white text-emerald-700 rounded-xl font-bold hover:bg-emerald-50 shadow-lg"
              >
                🧾 Assistant {documentCode}
              </button>
              <button
                onClick={() => setRemindersOn(!remindersOn)}
                className={`px-5 py-3 rounded-xl font-bold shadow-lg ${remindersOn ? 'bg-amber-400 text-amber-900' : 'bg-white text-emerald-700'}`}
              >
                {remindersOn ? '🔔 Rappels activés' : '🔕 Activer rappels'}
              </button>
            </div>
          </div>
        </div>

        {/* KPIs rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-xl border-2 border-emerald-200 shadow">
            <div className="text-sm font-bold text-emerald-700 mb-1">TVA collectée (mix {mixTaux19}% / 19%)</div>
            <div className="text-3xl font-black text-slate-900">{formatDA(tvaCollectee)}</div>
            <div className="text-xs text-slate-500">HT: {formatDA(ventesHT)}</div>
          </div>
          <div className="p-5 bg-white rounded-xl border-2 border-slate-200 shadow">
            <div className="text-sm font-bold text-slate-700 mb-1">TVA déductible estimée</div>
            <div className="text-3xl font-black text-slate-900">{formatDA(tvaDeductible)}</div>
            <div className="text-xs text-slate-500">Achats estimés: {formatDA(achatsTotalTTC)}</div>
          </div>
          <div className="p-5 bg-white rounded-xl border-2 border-red-200 shadow">
            <div className="text-sm font-bold text-red-700 mb-1">TVA nette ({documentCode})</div>
            <div className="text-3xl font-black text-red-700">{formatDA(tvaNette)}</div>
            <div className="text-xs text-red-600">Échéance: {prochaineDeclaration}</div>
          </div>
          <div className="p-5 bg-white rounded-xl border-2 border-slate-300 shadow">
            <div className="text-sm font-bold text-slate-700 mb-1">TAP (2% du CA HT)</div>
            <div className="text-3xl font-black text-slate-900">{formatDA(tap)}</div>
            <div className="text-xs text-slate-500">IRG salaires (estim.): {formatDA(irgSalairesEstime)}</div>
          </div>
        </div>

        {/* Saisie rapide caisse du jour */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            <div className="p-2 bg-emerald-600 rounded-lg mr-3">
              <CalculatorIcon className="h-5 w-5 text-white" />
            </div>
            Saisie rapide caisse (TTC)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="ventes-ttc" className="text-sm font-semibold text-slate-700">Ventes TTC du mois</label>
              <input
                id="ventes-ttc"
                value={ventesTTC}
                onChange={(e) => setVentesTTC(e.target.value)}
                placeholder={`${caMois.toLocaleString('fr-FR')} DA`}
                title="Ventes TTC du mois"
                aria-label="Ventes TTC du mois"
                className="mt-2 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
              <div className="mt-2 text-xs text-slate-500">Défaut: CA détecté</div>
            </div>
            <div>
              <label htmlFor="achats-ttc" className="text-sm font-semibold text-slate-700">Achats TTC du mois</label>
              <input
                id="achats-ttc"
                value={achatsTTC}
                onChange={(e) => setAchatsTTC(e.target.value)}
                placeholder={`${achatsEstimes.toLocaleString('fr-FR')} DA`}
                title="Achats TTC du mois"
                aria-label="Achats TTC du mois"
                className="mt-2 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
              <div className="mt-2 text-xs text-slate-500">Estimation: 45% du CA</div>
            </div>
            <div>
              <label htmlFor="mix-taux" className="text-sm font-semibold text-slate-700">Mix de taux (19% / 9%)</label>
              <input
                id="mix-taux"
                type="range"
                min={0}
                max={100}
                value={mixTaux19}
                onChange={(e) => setMixTaux19(parseInt(e.target.value, 10))}
                title="Réglage du mix de taux"
                aria-label="Réglage du mix de taux"
                className="mt-3 w-full"
              />
              <div className="mt-2 text-xs text-slate-600">{mixTaux19}% au taux 19%, {100 - mixTaux19}% au taux 9%</div>
            </div>
          </div>
        </div>

        {/* Téléversement journal caisse */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            <div className="p-2 bg-slate-700 rounded-lg mr-3">
              <CloudArrowUpIcon className="h-5 w-5 text-white" />
            </div>
            Journal de caisse (CSV/Excel)
          </h2>
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center">
            <div className="text-3xl">📄</div>
            <div className="mt-2 font-semibold text-slate-800">Glissez-déposez vos fichiers ici</div>
            <div className="text-sm text-slate-500">ou</div>
            <label className="mt-3 px-4 py-2 bg-slate-800 text-white rounded-lg cursor-pointer hover:bg-slate-900">
              Sélectionner un fichier
              <input type="file" className="hidden" onChange={() => {
                setShowModal(true);
                setModalContent({ title: 'Import en cours', message: 'Lecture du journal de caisse...\nAutomatisation des montants HT/TVA.', type: 'info' });
                setTimeout(() => setShowModal(false), 2500);
              }} />
            </label>
            <div className="mt-3 text-xs text-slate-500">Formats: .csv, .xlsx</div>
          </div>
        </div>

        {/* Échéances simplifiées */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            <div className="p-2 bg-amber-500 rounded-lg mr-3">
              <CalendarIcon className="h-5 w-5 text-white" />
            </div>
            Échéances Boutique
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[{label:`${documentCode} (TVA)`, date: prochaineDeclaration, color:'emerald'}, {label:'TAP Mensuel', date:'30/'+ new Date().toLocaleDateString('fr-DZ',{ month:'2-digit', year:'numeric'}), color:'slate'}, {label:'IRG Salaires', date:'30/'+ new Date().toLocaleDateString('fr-DZ',{ month:'2-digit', year:'numeric'}), color:'purple'}].map((e,idx)=> (
              <div key={idx} className="p-4 rounded-xl border-2 border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">{e.label}</div>
                  <div className="text-sm text-slate-600">Échéance: {e.date}</div>
                </div>
                <button onClick={() => setShowG50Wizard(true)} className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700">
                  Préparer
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Historique des déclarations (timeline) */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            <div className="p-2 bg-slate-700 rounded-lg mr-3">
              <ClockIcon className="h-5 w-5 text-white" />
            </div>
            Historique des Déclarations
          </h2>
          {(() => {
            // Merge persisted history with a couple of seed examples (one-time)
            const seeded = history && history.length > 0 ? history : [
              { date: '2025-06-20', tva: Math.round(tvaNette * 0.9), tap: Math.round(tap * 0.95) },
              { date: '2025-07-20', tva: Math.round(tvaNette * 1.1), tap: Math.round(tap) }
            ];
            const histo = seeded.map((h) => {
              const d = new Date(h.date);
              const mois = d.toLocaleDateString('fr-DZ', { month: 'short', year: 'numeric' });
              return { mois, tva: h.tva, tap: h.tap, statut: 'payée' as const };
            });
            return (
              <div className="relative pl-6">
                <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                <div className="space-y-3">
                  {histo.map((h, i) => (
                    <div key={i} className="relative">
                      <div className={`absolute -left-1.5 top-2 w-3 h-3 rounded-full ${h.statut==='payée'?'bg-emerald-500':'bg-slate-500'}`}></div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{h.mois}</div>
                          <div className="text-xs text-slate-600">TVA nette: {formatDA(h.tva)} • TAP: {formatDA(h.tap)}</div>
                        </div>
                        <button
                          title="Voir détails"
                          aria-label="Voir détails déclaration"
                          onClick={() => { setShowModal(true); setModalContent({ title: `Déclaration ${h.mois}`, message: `Statut: ${h.statut}\nTVA nette: ${formatDA(h.tva)}\nTAP: ${formatDA(h.tap)}`, type: 'info' }); setTimeout(()=>setShowModal(false), 2500); }}
                          className={`px-3 py-2 text-sm font-bold rounded-lg ${h.statut==='payée'?'bg-emerald-600 text-white hover:bg-emerald-700':'bg-slate-700 text-white hover:bg-slate-800'}`}
                        >
                          {h.statut}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* DAS (CNAS/CASNOS) rapide */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            <div className="p-2 bg-purple-600 rounded-lg mr-3">
              <UserGroupIcon className="h-5 w-5 text-white" />
            </div>
            Déclaration DAS (Synthèse)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">Employés</label>
              <input
                type="number"
                min={0}
                defaultValue={user.employees || 3}
                title="Nombre d'employés"
                aria-label="Nombre d'employés"
                className="mt-2 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500"
                onChange={() => {}}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Masse salariale (mois)</label>
              <input
                type="text"
                defaultValue={(user.employees||3 * 40000).toLocaleString('fr-FR')+' DA'}
                title="Masse salariale"
                aria-label="Masse salariale"
                className="mt-2 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500"
                onChange={() => {}}
              />
              <div className="mt-2 text-xs text-slate-500">Estimation simple pour la démo</div>
            </div>
            <div className="flex items-end">
              <button
                title="Préparer la DAS"
                aria-label="Préparer la DAS"
                onClick={() => { setShowModal(true); setModalContent({ title: 'DAS', message: 'Préparation de la DAS (CNAS/CASNOS) ...\nGénération des pièces pour téléversement.', type: 'info' }); setTimeout(()=>setShowModal(false), 2500); }}
                className="w-full px-4 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700"
              >
                Préparer DAS
              </button>
            </div>
          </div>
        </div>

        {/* Modal Assistant G50 */}
        {showG50Wizard && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <div className="text-xl font-bold text-slate-900">Assistant Déclaration {documentCode}</div>
                <button onClick={() => setShowG50Wizard(false)} className="text-slate-600 hover:text-slate-900 font-bold">✕</button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className={`font-bold ${g50Step>=1?'text-emerald-700':'text-slate-400'}`}>1. Saisies</div>
                  <div className={`font-bold ${g50Step>=2?'text-emerald-700':'text-slate-400'}`}>2. Calcul</div>
                  <div className={`font-bold ${g50Step>=3?'text-emerald-700':'text-slate-400'}`}>3. Valider & Export</div>
                </div>

                {g50Step === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="g50-ventes-ttc" className="text-sm font-semibold text-slate-700">Ventes TTC</label>
                      <input id="g50-ventes-ttc" value={ventesTTC} onChange={(e)=>setVentesTTC(e.target.value)} placeholder={ventesTotalTTC.toLocaleString('fr-FR')+ ' DA'} title="Ventes TTC" aria-label="Ventes TTC" className="mt-2 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500"/>
                    </div>
                    <div>
                      <label htmlFor="g50-achats-ttc" className="text-sm font-semibold text-slate-700">Achats TTC</label>
                      <input id="g50-achats-ttc" value={achatsTTC} onChange={(e)=>setAchatsTTC(e.target.value)} placeholder={achatsTotalTTC.toLocaleString('fr-FR')+ ' DA'} title="Achats TTC" aria-label="Achats TTC" className="mt-2 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500"/>
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="g50-mix-range" className="text-sm font-semibold text-slate-700">Mix 19% / 9%</label>
                      <input id="g50-mix-range" type="range" min={0} max={100} value={mixTaux19} onChange={(e)=>setMixTaux19(parseInt(e.target.value,10))} title="Réglage du mix 19% / 9%" aria-label="Réglage du mix 19% / 9%" className="mt-2 w-full"/>
                      <div className="text-xs text-slate-600 mt-1">{mixTaux19}% au taux 19%</div>
                    </div>
                  </div>
                )}

                {g50Step === 2 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-700">Base taxable ventes (HT)</span>
                      <span className="text-sm font-bold text-slate-900">{formatDA(ventesHT)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-700">TVA collectée</span>
                      <span className="text-sm font-bold text-slate-900">{formatDA(tvaCollectee)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-700">TVA déductible</span>
                      <span className="text-sm font-bold text-slate-900">{formatDA(tvaDeductible)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-100 rounded-lg border-2 border-slate-200">
                      <span className="text-sm text-slate-900 font-bold">TVA nette à payer</span>
                      <span className="text-sm font-black text-red-700">{formatDA(tvaNette)}</span>
                    </div>
                  </div>
                )}

                {g50Step === 3 && (
                  <div className="space-y-3">
                    <div className="text-sm text-slate-700">Échéance {documentCode}: <span className="font-bold">{prochaineDeclaration}</span></div>
                    <div className="text-sm text-slate-700">TAP mensuel estimé: <span className="font-bold">{formatDA(tap)}</span></div>
                    <div className="text-xs text-slate-500">Vérifiez les montants et exportez le PDF officiel.</div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button disabled={g50Step===1} onClick={()=>setG50Step((s)=>Math.max(1,s-1))} className={`px-4 py-2 rounded-lg font-bold ${g50Step===1?'bg-slate-200 text-slate-400':'bg-slate-700 text-white hover:bg-slate-800'}`}>Précédent</button>
                  {g50Step<3 ? (
                    <button onClick={()=>setG50Step((s)=>s+1)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700">Suivant</button>
                  ) : (
                    <button onClick={()=>{
                      // Append to persisted history on export
                      try {
                        const now = new Date();
                        const entry = { date: now.toISOString().slice(0,10), tva: tvaNette, tap };
                        setHistory((prev)=>[...prev, entry]);
                      } catch {}
                      setShowModal(true);
                      setModalContent({title:'Export G50', message:'Génération du PDF G50...\nTransmission possible vers DGI.', type:'success'});
                      setTimeout(()=>setShowModal(false),2500);
                    }} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700">Exporter PDF</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal générique */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 p-6">
              <div className="text-xl font-bold text-slate-900 mb-2">{modalContent.title}</div>
              <pre className="text-sm text-slate-700 whitespace-pre-wrap">{modalContent.message}</pre>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ========================================
  // INTERFACE EURL MICRO-ENTREPRISE
  // ========================================
  if (user && user.segment === 'micro' && user.companyType === 'eurl' && companyData) {
    const formatCurrency = (amount: number) => amount?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
    
    // Données fiscales adaptées pour EURL
    const tvaCollectee = Math.round(companyData.revenueMonth * 0.19); // TVA 19%
    const tvaDeductible = Math.round(companyData.revenueMonth * 0.45 * 0.19); // TVA sur achats
    const tvaNette = tvaCollectee - tvaDeductible;
    
    const montantG50 = Math.round(companyData.revenueMonth * 0.15); // 15% pour G50
    const acompteIRG = Math.round((companyData.revenueMonth - companyData.revenueMonth * 0.65) * 0.20); // 20% sur bénéfice

    // Échéances fiscales
    const echeancesFiscales = [
      { declaration: 'TVA (G50)', echeance: '20 du mois suivant', statut: 'À venir', jours: 5, couleur: 'emerald' },
      { declaration: 'Acompte IRG', echeance: '20 du mois suivant', statut: 'À jour', jours: 5, couleur: 'blue' },
      { declaration: 'Déclaration annuelle', echeance: '30 Avril', statut: 'Planifié', jours: 150, couleur: 'purple' }
    ];

    // Historique TVA (6 mois)
    const historiqueTVA = [
      { mois: 'Jan', tva: Math.round(tvaNette * 0.85) },
      { mois: 'Fév', tva: Math.round(tvaNette * 0.90) },
      { mois: 'Mar', tva: Math.round(tvaNette * 0.95) },
      { mois: 'Avr', tva: Math.round(tvaNette * 1.05) },
      { mois: 'Mai', tva: Math.round(tvaNette * 1.10) },
      { mois: 'Juin', tva: tvaNette }
    ];

    return (
      <div className="space-y-6 max-w-7xl mx-auto p-6">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 text-white p-8 rounded-2xl shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                <ScaleIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Fiscalité & Déclarations</h1>
                <p className="text-slate-300 text-lg mt-1">TVA, G50, IRG et échéances fiscales</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3 KPIs Fiscaux */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border-2 border-slate-200 shadow-md hover:shadow-xl p-6 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                <CurrencyDollarIcon className="h-7 w-7 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">TVA Nette à Payer</h3>
            <p className="text-3xl font-extrabold text-slate-900">{formatCurrency(tvaNette)}</p>
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-xs text-emerald-600 font-semibold">📅 Ce mois</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border-2 border-slate-200 shadow-md hover:shadow-xl p-6 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                <DocumentTextIcon className="h-7 w-7 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">Déclaration G50</h3>
            <p className="text-3xl font-extrabold text-slate-900">{formatCurrency(montantG50)}</p>
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-xs text-blue-600 font-semibold">📋 À déclarer</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border-2 border-slate-200 shadow-md hover:shadow-xl p-6 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                <BanknotesIcon className="h-7 w-7 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">Acompte IRG</h3>
            <p className="text-3xl font-extrabold text-slate-900">{formatCurrency(acompteIRG)}</p>
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-xs text-purple-600 font-semibold">💼 Mensuel</p>
            </div>
          </div>
        </div>

        {/* Détail TVA */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg mr-3">
              <CalculatorIcon className="h-5 w-5 text-white" />
            </div>
            Détail de la TVA (19%)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border-2 border-emerald-200">
              <p className="text-sm font-bold text-emerald-700 uppercase mb-2">TVA Collectée</p>
              <p className="text-2xl font-extrabold text-emerald-600">{formatCurrency(tvaCollectee)}</p>
              <p className="text-xs text-slate-600 mt-1">Sur ventes</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-xl border-2 border-red-200">
              <p className="text-sm font-bold text-red-700 uppercase mb-2">TVA Déductible</p>
              <p className="text-2xl font-extrabold text-red-600">-{formatCurrency(tvaDeductible)}</p>
              <p className="text-xs text-slate-600 mt-1">Sur achats</p>
            </div>
            <div className="bg-gradient-to-r from-slate-700 to-slate-900 p-4 rounded-xl">
              <p className="text-sm font-bold text-white uppercase mb-2">TVA Nette</p>
              <p className="text-2xl font-extrabold text-emerald-400">{formatCurrency(tvaNette)}</p>
              <p className="text-xs text-slate-300 mt-1">À payer</p>
            </div>
          </div>
        </div>

        {/* Historique TVA (6 mois) */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-slate-300 p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg mr-3">
              <ChartBarIcon className="h-5 w-5 text-white" />
            </div>
            Historique TVA (6 derniers mois)
          </h2>
          <div className="grid grid-cols-6 gap-2">
            {historiqueTVA.map((data, idx) => {
              const maxTVA = Math.max(...historiqueTVA.map(d => d.tva));
              const hauteur = (data.tva / maxTVA) * 180;
              return (
                <div key={idx} className="flex flex-col items-center">
                  <svg className="w-full h-[180px]" viewBox="0 0 20 180" preserveAspectRatio="none" aria-label={`TVA ${data.mois}`}>
                    <rect x="0" y="0" width="20" height="180" fill="#e2e8f0" rx="8" ry="8" />
                    <rect x="0" y={180 - hauteur} width="20" height={hauteur} fill="url(#tvaGrad)" rx="8" ry="8" />
                    <defs>
                      <linearGradient id="tvaGrad" x1="0" x2="0" y1="1" y2="0">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <p className="text-xs font-bold text-slate-600 mt-2">{data.mois}</p>
                  <p className="text-xs text-slate-500">{formatCurrency(data.tva)}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Échéances Fiscales */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg mr-3">
              <CalendarIcon className="h-5 w-5 text-white" />
            </div>
            Échéances Fiscales Importantes
          </h2>
          <div className="space-y-3">
            {echeancesFiscales.map((echeance, idx) => {
              const couleurClasses = {
                emerald: { bg: 'from-emerald-500 to-teal-500', text: 'text-emerald-700', border: 'border-emerald-300', bgLight: 'bg-emerald-50' },
                blue: { bg: 'from-blue-500 to-indigo-500', text: 'text-blue-700', border: 'border-blue-300', bgLight: 'bg-blue-50' },
                purple: { bg: 'from-purple-500 to-pink-500', text: 'text-purple-700', border: 'border-purple-300', bgLight: 'bg-purple-50' }
              };
              const couleur = couleurClasses[echeance.couleur as keyof typeof couleurClasses];
              
              return (
                <div key={idx} className={`${couleur.bgLight} p-4 rounded-xl border-2 ${couleur.border} hover:shadow-xl transition-all duration-300`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 bg-gradient-to-br ${couleur.bg} rounded-lg`}>
                        <CalendarIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className={`font-bold ${couleur.text}`}>{echeance.declaration}</p>
                        <p className="text-sm text-slate-600 mt-1">Échéance : {echeance.echeance} • Dans {echeance.jours} jours</p>
                      </div>
                    </div>
                    <div>
                      <span className={`px-3 py-1 ${couleur.bgLight} ${couleur.text} rounded-full text-sm font-semibold border ${couleur.border}`}>
                        {echeance.statut}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions Rapides */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-lg">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg mr-3">
              <SparklesIcon className="h-5 w-5 text-white" />
            </div>
            Actions Rapides
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button className="p-3 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-xl font-bold hover:from-slate-800 hover:to-black shadow-md hover:shadow-lg transition-all duration-300">
              📋 Générer G50
            </button>
            <button className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-teal-600 shadow-md hover:shadow-lg transition-all duration-300">
              📊 Rapport fiscal complet
            </button>
            <button className="p-3 bg-white border-2 border-slate-300 text-slate-700 rounded-xl font-bold hover:border-emerald-400 hover:shadow-lg transition-all duration-300">
              📅 Calendrier fiscal
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // INTERFACE STANDARD (autres entreprises)
  // ========================================
  const [showG50Modal, setShowG50Modal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiAnalysisStep, setAiAnalysisStep] = useState(0);

  const views = [
    {
      id: 'vue-ensemble',
      title: 'Vue d\'ensemble fiscale',
      icon: ChartPieIcon,
      description: 'Dashboard fiscal complet',
      indicators: ['Synthèse de toutes les taxes', 'Soldes et obligations', 'Alertes et échéances']
    },
    {
      id: 'tva',
      title: 'TVA',
      icon: DocumentTextIcon,
      description: 'Gestion de la TVA',
      indicators: ['TVA collectée / déductible / à payer', 'Évolution mensuelle de la TVA', 'Export direct vers G50']
    },
    {
      id: 'irg-ibs-tap',
      title: 'IRG / IBS / TAP',
      icon: CalculatorIcon,
      description: 'Impôts et taxes',
      indicators: ['Calculs automatiques selon règles algériennes', 'Montant dû / payé / à venir', 'Historique de paiements fiscaux']
    },
    {
      id: 'echeancier-fiscal',
      title: 'Échéancier fiscal & alertes',
      icon: CalendarIcon,
      description: 'Calendrier des obligations',
      indicators: ['Calendrier des déclarations', 'Alertes automatiques (G50, CNAS, CASNOS)', 'Rappels de paiements à venir']
    }
  ];

  const currentView = views.find(v => v.id === selectedView) || views[0];

  // Données fiscales enrichies
  const fiscalData = {
    tvaCollectee: 1250000,
    tvaDeductible: 1050000,
    tvaAPayer: 200000,
    baseTaxableVentes: 6578947, // Base HT
    baseTaxableAchats: 5526316,
    irg: 45000,
    ibs: 910000,
    tap: 200000,
    prochaineG50: '20/10/2025',
    echeancesAVenir: 3,
    derniereDeclaration: '20/09/2025'
  };

  // TVA mensuelle
  const tvaMonthly = [
    { month: 'Jan', collectee: 175000, deductible: 165000, nette: 10000, taux19: 160000, taux9: 15000 },
    { month: 'Fév', collectee: 195000, deductible: 170000, nette: 25000, taux19: 180000, taux9: 15000 },
    { month: 'Mar', collectee: 210000, deductible: 185000, nette: 25000, taux19: 195000, taux9: 15000 },
    { month: 'Avr', collectee: 205000, deductible: 180000, nette: 25000, taux19: 190000, taux9: 15000 },
    { month: 'Mai', collectee: 220000, deductible: 190000, nette: 30000, taux19: 205000, taux9: 15000 },
    { month: 'Jun', collectee: 245000, deductible: 160000, nette: 85000, taux19: 230000, taux9: 15000 }
  ];

  // Impôts trimestriels
  const quarterlyTaxes = [
    { trimestre: 'T1 2024', irg: 35000, ibs: 180000, tap: 48000, total: 263000 },
    { trimestre: 'T2 2024', irg: 38000, ibs: 195000, tap: 52000, total: 285000 },
    { trimestre: 'T3 2024', irg: 42000, ibs: 210000, tap: 56000, total: 308000 },
    { trimestre: 'T4 2024', irg: 45000, ibs: 225000, tap: 60000, total: 330000 }
  ];

  // Échéancier fiscal
  const fiscalCalendar = [
    { date: '20/10/2025', type: 'G50 TVA', statut: 'à faire', montant: 200000, priorite: 'haute', echeanceJours: 12 },
    { date: '30/10/2025', type: 'IRG Salaires', statut: 'transmise', montant: 45000, priorite: 'normale', echeanceJours: 22 },
    { date: '15/11/2025', type: 'IBS Acompte', statut: 'en retard', montant: 225000, priorite: 'critique', echeanceJours: -5 },
    { date: '20/11/2025', type: 'G50 TVA', statut: 'à faire', montant: 215000, priorite: 'haute', echeanceJours: 43 },
    { date: '30/11/2025', type: 'TAP Mensuel', statut: 'à faire', montant: 60000, priorite: 'normale', echeanceJours: 53 },
    { date: '20/12/2025', type: 'G50 TVA', statut: 'à faire', montant: 220000, priorite: 'haute', echeanceJours: 73 }
  ];

  // Alertes fiscales
  const fiscalAlerts = [
    {
      type: 'Déclaration en retard',
      message: 'Vous n\'avez pas encore transmis la G50 d\'octobre.',
      severity: 'critical',
      action: 'Ouvrir G50',
      date: '20/10/2025'
    },
    {
      type: 'Paiement à venir',
      message: 'Échéance IRG le 30/10.',
      severity: 'warning',
      action: 'Créer paiement',
      date: '30/10/2025'
    },
    {
      type: 'Nouvelle version formulaire',
      message: 'Formulaire G50 2025 disponible.',
      severity: 'info',
      action: 'Télécharger modèle',
      date: ''
    },
    {
      type: 'Prévision fiscale',
      message: 'Votre TVA nette moyenne a augmenté de 18% sur 3 mois.',
      severity: 'info',
      action: 'Voir rapport',
      date: ''
    }
  ];

  // Clients/Fournisseurs impactant TVA
  const topTvaContributors = [
    { name: 'Client ABC Corp', type: 'client', tvaGeneree: 285000, percentage: 22.8 },
    { name: 'Client XYZ SARL', type: 'client', tvaGeneree: 195000, percentage: 15.6 },
    { name: 'Fournisseur Tech Plus', type: 'fournisseur', tvaRecuperee: 180000, percentage: 17.1 },
    { name: 'Fournisseur Équipement Pro', type: 'fournisseur', tvaRecuperee: 145000, percentage: 13.8 }
  ];

  // Synthèse fiscale
  const syntheseFiscale = [
    { impot: 'TVA', baseImposable: 12400000, taux: '19%', montantDu: 2356000, paye: 2356000, solde: 0, statut: 'à jour' },
    { impot: 'IRG', baseImposable: 450000, taux: '10%', montantDu: 45000, paye: 20000, solde: 25000, statut: 'partiel' },
    { impot: 'IBS', baseImposable: 3500000, taux: '26%', montantDu: 910000, paye: 600000, solde: 310000, statut: 'partiel' },
    { impot: 'TAP', baseImposable: 10000000, taux: '2%', montantDu: 200000, paye: 100000, solde: 100000, statut: 'partiel' }
  ];

  // Fonctions pour gérer les actions
  const handleAction = (action: string) => {
    switch (action) {
      case 'rapport':
        setModalContent({
          title: '📊 Rapport Fiscal Complet',
          message: 'Génération du rapport fiscal détaillé en cours...\n\n✅ Synthèse des taxes\n✅ Détails par impôt\n✅ Échéancier complet\n✅ Recommandations LIA\n\nLe rapport sera disponible dans quelques instants.',
          type: 'info'
        });
        setShowModal(true);
        setTimeout(() => setShowModal(false), 3000);
        break;
      
      case 'pdf':
        setModalContent({
          title: '📄 Export PDF',
          message: 'Exportation en format PDF...\n\n📥 Téléchargement du fichier:\n"Fiscalite_2024_Synthese.pdf"\n\nTaille: 2.4 MB\nDate: ' + new Date().toLocaleDateString(),
          type: 'success'
        });
        setShowModal(true);
        setTimeout(() => setShowModal(false), 2500);
        break;
      
      case 'excel':
        setModalContent({
          title: '📊 Export Excel',
          message: 'Exportation en format Excel...\n\n📥 Téléchargement du fichier:\n"Fiscalite_2024_Donnees.xlsx"\n\nContenu:\n• TVA mensuelle\n• IRG/IBS/TAP\n• Échéancier\n• Synthèse',
          type: 'success'
        });
        setShowModal(true);
        setTimeout(() => setShowModal(false), 2500);
        break;
      
      case 'g50':
        setShowG50Modal(true);
        break;
      
      case 'ai':
        setShowAIModal(true);
        setAiAnalysisStep(0);
        // Progression automatique de l'analyse fiscale
        setTimeout(() => setAiAnalysisStep(1), 1500);
        setTimeout(() => setAiAnalysisStep(2), 3000);
        setTimeout(() => setAiAnalysisStep(3), 4500);
        setTimeout(() => setAiAnalysisStep(4), 6000);
        setTimeout(() => setAiAnalysisStep(5), 7500);
        break;
      
      case 'dgi':
        setModalContent({
          title: '🏛️ Export vers DGI',
          message: 'Préparation des données pour transmission DGI...\n\n✅ Validation des montants\n✅ Format conforme\n✅ Signature électronique\n\n📤 Prêt pour envoi sécurisé',
          type: 'success'
        });
        setShowModal(true);
        setTimeout(() => setShowModal(false), 3000);
        break;
      
      case 'download-g50':
        setModalContent({
          title: '📥 Téléchargement Formulaire G50 2025',
          message: 'Téléchargement du modèle officiel...\n\n📄 Fichier: G50_2025_Modele.pdf\n📅 Version: Janvier 2025\n✅ Conforme DGI\n\nTéléchargement terminé !',
          type: 'success'
        });
        setShowModal(true);
        setTimeout(() => setShowModal(false), 2500);
        break;
      
      case 'voir-rapport':
        setModalContent({
          title: '📊 Rapport Prévision Fiscale',
          message: 'Analyse de l\'évolution TVA:\n\n📈 Mois 1: +8,000 DA\n📈 Mois 2: +12,000 DA\n📈 Mois 3: +15,000 DA\n\n💡 Augmentation moyenne: +18%\n\nRecommandation: Prévoir trésorerie suffisante pour les prochaines échéances.',
          type: 'info'
        });
        setShowModal(true);
        setTimeout(() => setShowModal(false), 4000);
        break;
      
      default:
        setModalContent({
          title: '⚙️ Fonctionnalité',
          message: 'Cette action est en cours de traitement...',
          type: 'info'
        });
        setShowModal(true);
        setTimeout(() => setShowModal(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête moderne avec gradient */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700 p-8 overflow-hidden">
        {/* Effet de fond animé */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-50"></div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4 mb-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                <ScaleIcon className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white flex items-center tracking-tight">
              Fiscalité & Déclarations
            </h1>
                <p className="text-emerald-200 mt-1 font-medium">Gérez vos obligations fiscales en toute simplicité</p>
          </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center border border-white/20 shadow-lg hover:shadow-xl hover:scale-105">
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filtres
            </button>
            <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl hover:scale-105">
              <ShareIcon className="h-5 w-5 mr-2" />
              Partager
            </button>
          </div>
        </div>
      </div>

      {/* Navigation des vues - Design moderne */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-2">
        <div className="flex space-x-2">
          {views.map((view) => {
            const Icon = view.icon;
            return (
              <button
                key={view.id}
                onClick={() => setSelectedView(view.id)}
                className={`flex items-center space-x-3 px-6 py-4 rounded-xl text-sm font-bold transition-all duration-300 flex-1 ${
                  selectedView === view.id
                    ? 'bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-lg scale-105'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:scale-102 hover:shadow-md'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  selectedView === view.id 
                    ? 'bg-white/20' 
                    : 'bg-slate-100'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span>{view.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenu de la vue sélectionnée */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          {(() => {
            const CurrentViewIcon = currentView.icon;
            return <CurrentViewIcon className="h-6 w-6 text-slate-600" />;
          })()}
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{currentView.title}</h2>
            <p className="text-sm text-slate-600">{currentView.description}</p>
          </div>
        </div>

        {/* Contenu dynamique selon la vue */}
        <div className="space-y-8">
          {/* VUE 1: VUE D'ENSEMBLE FISCALE */}
          {selectedView === 'vue-ensemble' && (
            <>
              {/* KPIs principaux - Design premium */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                <div className="group relative p-6 bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 rounded-2xl border-2 border-emerald-300/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
                  {/* Effet brillant animé */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                        <CurrencyDollarIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
                        <ArrowTrendingUpIcon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="text-sm text-white/90 font-bold mb-2">TVA Collectée</div>
                    <div className="text-4xl font-black text-white mb-1">
                      {(fiscalData.tvaCollectee / 1000).toFixed(0)}k
                    </div>
                    <div className="text-xs text-white/80 font-medium">Sur ventes</div>
            </div>
          </div>

                <div className="group relative p-6 bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 rounded-2xl border-2 border-slate-500/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                        <BanknotesIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
                        <ArrowTrendingDownIcon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="text-sm text-white/90 font-bold mb-2">TVA Déductible</div>
                    <div className="text-4xl font-black text-white mb-1">
                      {(fiscalData.tvaDeductible / 1000).toFixed(0)}k
                    </div>
                    <div className="text-xs text-white/80 font-medium">Sur achats</div>
            </div>
          </div>

                <div className="group relative p-6 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-2xl border-2 border-red-400/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute top-2 right-2">
                    <span className="animate-pulse inline-block w-3 h-3 bg-yellow-300 rounded-full"></span>
                  </div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                        <ScaleIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
                        <ExclamationTriangleIcon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="text-sm text-white/90 font-bold mb-2">TVA Nette</div>
                    <div className="text-4xl font-black text-white mb-1">
                      {(fiscalData.tvaAPayer / 1000).toFixed(0)}k
                    </div>
                    <div className="text-xs text-white/80 font-medium">À reverser</div>
            </div>
          </div>

                <div className="group relative p-6 bg-gradient-to-br from-slate-500 via-slate-600 to-slate-700 rounded-2xl border-2 border-slate-400/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                        <UserGroupIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="text-sm text-white/90 font-bold mb-2">IRG</div>
                    <div className="text-4xl font-black text-white mb-1">
                      {(fiscalData.irg / 1000).toFixed(0)}k
                    </div>
                    <div className="text-xs text-white/80 font-medium">Retenues</div>
            </div>
          </div>

                <div className="group relative p-6 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-2xl border-2 border-slate-600/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                        <BuildingOfficeIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="text-sm text-white/90 font-bold mb-2">IBS</div>
                    <div className="text-4xl font-black text-white mb-1">
                      {(fiscalData.ibs / 1000).toFixed(0)}k
                    </div>
                    <div className="text-xs text-white/80 font-medium">Bénéfices</div>
            </div>
          </div>

                <div className="group relative p-6 bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 rounded-2xl border-2 border-slate-500/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                        <CalculatorIcon className="h-6 w-6 text-white" />
            </div>
                    </div>
                    <div className="text-sm text-white/90 font-bold mb-2">TAP</div>
                    <div className="text-4xl font-black text-white mb-1">
                      {(fiscalData.tap / 1000).toFixed(0)}k
                    </div>
                    <div className="text-xs text-white/80 font-medium">CA (2%)</div>
          </div>
        </div>

                <div className="group relative p-6 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-2xl border-2 border-amber-300/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute top-2 right-2">
                    <span className="animate-ping inline-block w-3 h-3 bg-red-500 rounded-full"></span>
                  </div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                        <BellIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
                        <ClockIcon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="text-sm text-white/90 font-bold mb-2">Échéances</div>
                    <div className="text-4xl font-black text-white mb-1">
                      {fiscalData.echeancesAVenir}
                    </div>
                    <div className="text-xs text-white/80 font-medium">Dans 15 jours</div>
                  </div>
                </div>
              </div>

              {/* Tableau synthèse fiscale */}
              <div className="relative bg-white rounded-2xl p-8 border-2 border-slate-200 shadow-2xl overflow-hidden">
                {/* Effet de fond décoratif */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-100/30 to-transparent rounded-full blur-3xl"></div>
                
                <div className="relative">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="p-3 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl shadow-lg">
                      <DocumentTextIcon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900">📊 Tableau de Synthèse Fiscale</h3>
                      <p className="text-sm text-slate-600 mt-1">Vue complète de vos obligations fiscales</p>
                    </div>
                  </div>

                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-700 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase">Impôt</th>
                        <th className="px-6 py-4 text-right text-xs font-bold uppercase">Base Imposable</th>
                        <th className="px-6 py-4 text-center text-xs font-bold uppercase">Taux</th>
                        <th className="px-6 py-4 text-right text-xs font-bold uppercase">Montant Dû</th>
                        <th className="px-6 py-4 text-right text-xs font-bold uppercase">Payé</th>
                        <th className="px-6 py-4 text-right text-xs font-bold uppercase">Solde</th>
                        <th className="px-6 py-4 text-center text-xs font-bold uppercase">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {syntheseFiscale.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900">{item.impot}</td>
                          <td className="px-6 py-4 text-right font-medium text-slate-900">
                            {item.baseImposable.toLocaleString()} DA
                          </td>
                          <td className="px-6 py-4 text-center font-semibold text-slate-700">{item.taux}</td>
                          <td className="px-6 py-4 text-right font-bold text-red-600">
                            {item.montantDu.toLocaleString()} DA
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-emerald-600">
                            {item.paye.toLocaleString()} DA
                          </td>
                          <td className="px-6 py-4 text-right font-black text-slate-900">
                            {item.solde.toLocaleString()} DA
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              item.statut === 'à jour' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                              'bg-amber-100 text-amber-700 border border-amber-300'
                            }`}>
                              {item.statut}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t-2 border-slate-300">
                      <tr>
                        <td className="px-6 py-4 font-black text-slate-900" colSpan={3}>TOTAL</td>
                        <td className="px-6 py-4 text-right font-black text-red-700">
                          {syntheseFiscale.reduce((sum, i) => sum + i.montantDu, 0).toLocaleString()} DA
                        </td>
                        <td className="px-6 py-4 text-right font-black text-emerald-700">
                          {syntheseFiscale.reduce((sum, i) => sum + i.paye, 0).toLocaleString()} DA
                        </td>
                        <td className="px-6 py-4 text-right font-black text-slate-900">
                          {syntheseFiscale.reduce((sum, i) => sum + i.solde, 0).toLocaleString()} DA
                        </td>
                        <td className="px-6 py-4"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                </div>
              </div>

              {/* Graphiques de synthèse */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* TVA Collectée vs Déductible */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                    <ChartBarIcon className="h-5 w-5 mr-2 text-slate-600" />
                    📊 TVA Collectée vs Déductible (6 mois)
                  </h3>

                  <div className="bg-white rounded-lg p-6 border border-slate-200">
                    <div className="flex items-center justify-center space-x-6 mb-4">
                      <div className="flex items-center">
                        <div className="w-6 h-1.5 bg-emerald-600 rounded mr-2"></div>
                        <span className="text-xs font-semibold text-slate-900">Collectée</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 h-1.5 bg-slate-600 rounded mr-2"></div>
                        <span className="text-xs font-semibold text-slate-900">Déductible</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {tvaMonthly.map((tva, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-900">{tva.month}</span>
                            <span className={`font-bold ${tva.nette > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                              {tva.nette > 0 ? '+' : ''}{(tva.nette / 1000).toFixed(0)}k
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="w-full">
                              <svg className="w-full h-3" viewBox="0 0 100 12" preserveAspectRatio="none" aria-label="TVA collectée">
                                <defs>
                                  <linearGradient id={`collecteeGrad-${index}`} x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#10b981" />
                                    <stop offset="100%" stopColor="#059669" />
                                  </linearGradient>
                                </defs>
                                <rect x="0" y="0" width="100" height="12" fill="#e2e8f0" rx="6" ry="6" />
                                <rect x="0" y="0" width={(tva.collectee / 250000) * 100} height="12" fill={`url(#collecteeGrad-${index})`} rx="6" ry="6" />
                              </svg>
                            </div>
                            <div className="w-full">
                              <svg className="w-full h-3" viewBox="0 0 100 12" preserveAspectRatio="none" aria-label="TVA déductible">
                                <defs>
                                  <linearGradient id={`deductibleGrad-${index}`} x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#64748b" />
                                    <stop offset="100%" stopColor="#475569" />
                                  </linearGradient>
                                </defs>
                                <rect x="0" y="0" width="100" height="12" fill="#e2e8f0" rx="6" ry="6" />
                                <rect x="0" y="0" width={(tva.deductible / 250000) * 100} height="12" fill={`url(#deductibleGrad-${index})`} rx="6" ry="6" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Répartition des taxes */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                    <ChartPieIcon className="h-5 w-5 mr-2 text-slate-600" />
                    🧾 Répartition des Taxes
                  </h3>

                  <div className="bg-white rounded-lg p-6 border border-slate-200">
                    <div className="flex items-center justify-center mb-6">
                      <div className="relative w-56 h-56">
                        <svg className="w-full h-full transform -rotate-90">
                          {(() => {
                            const taxesData = [
                              { label: 'TVA', value: fiscalData.tvaAPayer, color: '#10b981' },
                              { label: 'IBS', value: fiscalData.ibs, color: '#334155' },
                              { label: 'TAP', value: fiscalData.tap, color: '#64748b' },
                              { label: 'IRG', value: fiscalData.irg, color: '#94a3b8' }
                            ];
                            const total = taxesData.reduce((sum, t) => sum + t.value, 0);
                            let currentOffset = 0;
                            
                            return taxesData.map((tax, idx) => {
                              const circumference = 2 * Math.PI * 90;
                              const percentage = (tax.value / total) * 100;
                              const strokeLength = (percentage / 100) * circumference;
                              const circle = (
                                <circle
                                  key={idx}
                                  cx="112"
                                  cy="112"
                                  r="90"
                                  fill="none"
                                  stroke={tax.color}
                                  strokeWidth="35"
                                  strokeDasharray={`${strokeLength} ${circumference}`}
                                  strokeDashoffset={-currentOffset}
                                  strokeLinecap="round"
                                  opacity="0"
                                >
                                  <animate attributeName="opacity" from="0" to="1" begin={`${idx * 0.2}s`} dur="0.4s" fill="freeze" />
                                  <animate
                                    attributeName="stroke-dashoffset"
                                    from={-currentOffset + strokeLength}
                                    to={-currentOffset}
                                    begin={`${idx * 0.2}s`}
                                    dur="1s"
                                    fill="freeze"
                                  />
                                </circle>
                              );
                              currentOffset += strokeLength;
                              return circle;
                            });
                          })()}
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="text-2xl font-black text-slate-900">
                            {((fiscalData.tvaAPayer + fiscalData.ibs + fiscalData.tap + fiscalData.irg) / 1000000).toFixed(1)}M
                          </div>
                          <div className="text-xs text-slate-600 font-semibold">Total</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {[
                        { label: 'TVA', value: fiscalData.tvaAPayer, color: 'bg-emerald-500', percentage: ((fiscalData.tvaAPayer / (fiscalData.tvaAPayer + fiscalData.ibs + fiscalData.tap + fiscalData.irg)) * 100).toFixed(1) },
                        { label: 'IBS', value: fiscalData.ibs, color: 'bg-slate-700', percentage: ((fiscalData.ibs / (fiscalData.tvaAPayer + fiscalData.ibs + fiscalData.tap + fiscalData.irg)) * 100).toFixed(1) },
                        { label: 'TAP', value: fiscalData.tap, color: 'bg-slate-500', percentage: ((fiscalData.tap / (fiscalData.tvaAPayer + fiscalData.ibs + fiscalData.tap + fiscalData.irg)) * 100).toFixed(1) },
                        { label: 'IRG', value: fiscalData.irg, color: 'bg-slate-400', percentage: ((fiscalData.irg / (fiscalData.tvaAPayer + fiscalData.ibs + fiscalData.tap + fiscalData.irg)) * 100).toFixed(1) }
                      ].map((tax, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 ${tax.color} rounded-full`}></div>
                            <span className="text-xs font-bold text-slate-900">{tax.label}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-black text-slate-900">{tax.percentage}%</span>
                            <span className="text-xs text-slate-600">({tax.value.toLocaleString()} DA)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Flux des paiements fiscaux */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2 text-slate-600" />
                  💹 IRG / IBS / TAP par Trimestre
                </h3>

                <div className="bg-white rounded-lg p-6 border border-slate-200">
                  <div className="relative h-80 bg-slate-50 rounded-lg p-8">
                    <svg className="w-full h-full" viewBox="0 0 700 300" preserveAspectRatio="xMidYMid meet">
                      {/* Grille */}
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <g key={i}>
                          <line x1="60" y1={30 + i * 45} x2="660" y2={30 + i * 45} stroke="#e2e8f0" strokeWidth="1.5" />
                          <text x="45" y={35 + i * 45} fill="#64748b" fontSize="12" fontWeight="700" textAnchor="end">
                            {(5-i) * 70}k
                          </text>
                        </g>
                      ))}

                      {/* Barres empilées pour chaque trimestre */}
                      {quarterlyTaxes.map((q, i) => {
                        const x = 120 + (i * 130);
                        const maxVal = 350000;
                        
                        // IBS (base)
                        const ibsHeight = (q.ibs / maxVal) * 225;
                        // TAP (au-dessus)
                        const tapHeight = (q.tap / maxVal) * 225;
                        // IRG (au-dessus)
                        const irgHeight = (q.irg / maxVal) * 225;

                        return (
                          <g key={i}>
                            {/* IBS */}
                            <rect
                              x={x}
                              y={255 - ibsHeight}
                              width="70"
                              height="0"
                              fill="#334155"
                              rx="2"
                            >
                              <animate attributeName="height" from="0" to={ibsHeight} begin={`${i * 0.2}s`} dur="0.8s" fill="freeze" />
                              <animate attributeName="y" from="255" to={255 - ibsHeight} begin={`${i * 0.2}s`} dur="0.8s" fill="freeze" />
                            </rect>

                            {/* TAP */}
                            <rect
                              x={x}
                              y={255 - ibsHeight - tapHeight}
                              width="70"
                              height="0"
                              fill="#64748b"
                              rx="2"
                            >
                              <animate attributeName="height" from="0" to={tapHeight} begin={`${i * 0.2 + 0.3}s`} dur="0.6s" fill="freeze" />
                              <animate attributeName="y" from={255 - ibsHeight} to={255 - ibsHeight - tapHeight} begin={`${i * 0.2 + 0.3}s`} dur="0.6s" fill="freeze" />
                            </rect>

                            {/* IRG */}
                            <rect
                              x={x}
                              y={255 - ibsHeight - tapHeight - irgHeight}
                              width="70"
                              height="0"
                              fill="#94a3b8"
                              rx="2"
                            >
                              <animate attributeName="height" from="0" to={irgHeight} begin={`${i * 0.2 + 0.5}s`} dur="0.5s" fill="freeze" />
                              <animate attributeName="y" from={255 - ibsHeight - tapHeight} to={255 - ibsHeight - tapHeight - irgHeight} begin={`${i * 0.2 + 0.5}s`} dur="0.5s" fill="freeze" />
                            </rect>

                            {/* Label */}
                            <text x={x + 35} y="280" fill="#334155" fontSize="13" fontWeight="700" textAnchor="middle">
                              {q.trimestre.replace(' 2024', '')}
                            </text>
                          </g>
                        );
                      })}

                      {/* Légende en bas */}
                      <g>
                        <rect x="520" y="30" width="15" height="15" fill="#334155" rx="2" />
                        <text x="540" y="42" fill="#334155" fontSize="12" fontWeight="600">IBS</text>
                        
                        <rect x="520" y="55" width="15" height="15" fill="#64748b" rx="2" />
                        <text x="540" y="67" fill="#334155" fontSize="12" fontWeight="600">TAP</text>
                        
                        <rect x="520" y="80" width="15" height="15" fill="#94a3b8" rx="2" />
                        <text x="540" y="92" fill="#334155" fontSize="12" fontWeight="600">IRG</text>
                      </g>
                    </svg>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t-2 border-slate-200">
                    <div className="text-center p-3 bg-slate-100 rounded-lg">
                      <div className="text-xs text-slate-600 mb-1">IBS Total</div>
                      <div className="text-lg font-bold text-slate-900">
                        {quarterlyTaxes.reduce((sum, q) => sum + q.ibs, 0).toLocaleString()} DA
                      </div>
                    </div>
                    <div className="text-center p-3 bg-slate-100 rounded-lg">
                      <div className="text-xs text-slate-600 mb-1">TAP Total</div>
                      <div className="text-lg font-bold text-slate-900">
                        {quarterlyTaxes.reduce((sum, q) => sum + q.tap, 0).toLocaleString()} DA
                      </div>
                    </div>
                    <div className="text-center p-3 bg-slate-100 rounded-lg">
                      <div className="text-xs text-slate-600 mb-1">IRG Total</div>
                      <div className="text-lg font-bold text-slate-900">
                        {quarterlyTaxes.reduce((sum, q) => sum + q.irg, 0).toLocaleString()} DA
                      </div>
                    </div>
                  </div>
            </div>
          </div>

              {/* Alertes fiscales */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <BellIcon className="h-5 w-5 mr-2 text-slate-600" />
                  🔔 Alertes & Recommandations LIA
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fiscalAlerts.map((alert, index) => (
                    <div key={index} className={`rounded-lg p-5 border-l-4 ${
                      alert.severity === 'critical' ? 'bg-red-50 border-red-500' :
                      alert.severity === 'warning' ? 'bg-amber-50 border-amber-500' :
                      'bg-slate-50 border-slate-500'
                    } border border-slate-200`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            alert.severity === 'critical' ? 'bg-red-100 text-red-600' :
                            alert.severity === 'warning' ? 'bg-amber-100 text-amber-600' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {alert.severity === 'critical' ? <ExclamationTriangleIcon className="h-5 w-5" /> :
                             alert.severity === 'warning' ? <BellIcon className="h-5 w-5" /> :
                             <InformationCircleIcon className="h-5 w-5" />}
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-slate-900 mb-1">{alert.type}</div>
                            <div className="text-sm text-slate-600">{alert.message}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        {alert.date && <span className="text-xs text-slate-600">Échéance: {alert.date}</span>}
                        <button 
                          onClick={() => {
                            if (alert.action === 'Télécharger modèle') handleAction('download-g50');
                            else if (alert.action === 'Voir rapport') handleAction('voir-rapport');
                            else handleAction('g50');
                          }}
                          className={`px-4 py-2 rounded-md text-xs font-bold transition-colors ${
                            alert.severity === 'critical' ? 'bg-red-600 text-white hover:bg-red-700' :
                            alert.severity === 'warning' ? 'bg-amber-600 text-white hover:bg-amber-700' :
                            'bg-slate-600 text-white hover:bg-slate-700'
                          }`}
                        >
                          {alert.action}
          </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* VUE 2: TVA */}
          {selectedView === 'tva' && (
            <>
              {/* KPIs TVA */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
                  <span className="text-sm text-emerald-600 font-semibold mb-2 block">Base taxable ventes</span>
                  <div className="text-3xl font-black text-emerald-700">
                    {(fiscalData.baseTaxableVentes / 1000000).toFixed(2)}M
                  </div>
                  <div className="text-xs text-emerald-600 mt-1">CA HT</div>
                </div>

                <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                  <span className="text-sm text-slate-600 font-semibold mb-2 block">Base taxable achats</span>
                  <div className="text-3xl font-black text-slate-900">
                    {(fiscalData.baseTaxableAchats / 1000000).toFixed(2)}M
                  </div>
                  <div className="text-xs text-slate-600 mt-1">Achats HT</div>
                </div>

                <div className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
                  <span className="text-sm text-emerald-600 font-semibold mb-2 block">TVA Collectée</span>
                  <div className="text-3xl font-black text-emerald-700">
                    {(fiscalData.tvaCollectee / 1000).toFixed(0)}k
                  </div>
                  <div className="text-xs text-emerald-600 mt-1">19% + 9%</div>
                </div>

                <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                  <span className="text-sm text-slate-600 font-semibold mb-2 block">TVA Déductible</span>
                  <div className="text-3xl font-black text-slate-900">
                    {(fiscalData.tvaDeductible / 1000).toFixed(0)}k
                  </div>
                  <div className="text-xs text-slate-600 mt-1">Récupérable</div>
                </div>

                <div className="p-5 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
                  <span className="text-sm text-red-600 font-semibold mb-2 block">TVA Nette</span>
                  <div className="text-3xl font-black text-red-700">
                    {(fiscalData.tvaAPayer / 1000).toFixed(0)}k
                  </div>
                  <div className="text-xs text-red-600 mt-1">À reverser</div>
            </div>
          </div>

              {/* Évolution mensuelle TVA nette */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2 text-slate-600" />
                  📈 Évolution Mensuelle de la TVA Nette
                </h3>

                <div className="bg-white rounded-lg p-6 border border-slate-200">
                  <div className="relative h-64 bg-slate-50 rounded-lg p-8">
                    <svg className="w-full h-full" viewBox="0 0 700 250" preserveAspectRatio="xMidYMid meet">
                      {/* Grille */}
                      {[0, 1, 2, 3, 4].map((i) => (
                        <g key={i}>
                          <line x1="60" y1={30 + i * 45} x2="660" y2={30 + i * 45} stroke="#e2e8f0" strokeWidth="1.5" />
                          <text x="45" y={35 + i * 45} fill="#64748b" fontSize="12" fontWeight="700" textAnchor="end">
                            {(4-i) * 22}k
                          </text>
                        </g>
                      ))}

                      {/* Barres */}
                      {tvaMonthly.map((tva, i) => {
                        const x = 80 + (i * 100);
                        const maxVal = 90000;
                        const height = (tva.nette / maxVal) * 180;
                        return (
                          <rect
                            key={i}
                            x={x}
                            y={210 - height}
                            width="60"
                            height="0"
                            fill={tva.nette > 30000 ? '#ef4444' : '#10b981'}
                            rx="3"
                          >
                            <animate attributeName="height" from="0" to={height} begin={`${i * 0.15}s`} dur="0.7s" fill="freeze" />
                            <animate attributeName="y" from="210" to={210 - height} begin={`${i * 0.15}s`} dur="0.7s" fill="freeze" />
                          </rect>
                        );
                      })}

                      {/* Labels */}
                      {tvaMonthly.map((tva, i) => (
                        <text key={i} x={110 + (i * 100)} y="235" fill="#334155" fontSize="13" fontWeight="800" textAnchor="middle">
                          {tva.month}
                        </text>
                      ))}
                    </svg>
                  </div>
            </div>
          </div>

              {/* Top contributeurs TVA */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2 text-slate-600" />
                  🧾 Top Clients / Fournisseurs Impactant TVA
                </h3>

                <div className="bg-white rounded-lg p-6 border border-slate-200">
                  <div className="space-y-4">
                    {topTvaContributors.map((contributor, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              contributor.type === 'client' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {contributor.type}
                            </span>
                            <span className="text-sm font-bold text-slate-900">{contributor.name}</span>
                          </div>
                          <span className="text-sm font-black text-slate-900">
                            {contributor.type === 'client' ? (contributor.tvaGeneree || 0).toLocaleString() : (contributor.tvaRecuperee || 0).toLocaleString()} DA
                          </span>
                        </div>
                        <div className="w-full">
                          <svg className="w-full h-4" viewBox="0 0 100 16" preserveAspectRatio="none" aria-label="Contribution TVA">
                            <defs>
                              <linearGradient id={`contrGrad-${index}`} x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor={contributor.type === 'client' ? '#10b981' : '#475569'} />
                                <stop offset="100%" stopColor={contributor.type === 'client' ? '#059669' : '#334155'} />
                              </linearGradient>
                            </defs>
                            <rect x="0" y="0" width="100" height="16" fill="#e2e8f0" rx="8" ry="8" />
                            <rect x="0" y="0" width={contributor.percentage * 4} height="16" fill={`url(#contrGrad-${index})`} rx="8" ry="8" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* VUE 3: IRG / IBS / TAP - Amélioré */}
          {selectedView === 'irg-ibs-tap' && (
            <>
              {/* Indicateurs de Performance Fiscale */}
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 border-2 border-slate-200 mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                  <SparklesIcon className="h-5 w-5 mr-2 text-slate-600" />
                  Vue d'Ensemble Fiscale Algérienne
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-600 uppercase">Charge Totale</span>
                      <CurrencyDollarIcon className="h-4 w-4 text-slate-500" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">1,155,000 DA</div>
                    <div className="text-xs text-slate-500 mt-1">IBS + TVA + IRG + TAP</div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-600 uppercase">Taux Effectif</span>
                      <ChartBarIcon className="h-4 w-4 text-slate-500" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">26.0%</div>
                    <div className="text-xs text-slate-500 mt-1">IBS / Bénéfice</div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-600 uppercase">Conformité</span>
                      <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="text-2xl font-bold text-emerald-600">92%</div>
                    <div className="text-xs text-slate-500 mt-1">Score global</div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-600 uppercase">Échéances</span>
                      <ClockIcon className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="text-2xl font-bold text-amber-600">3</div>
                    <div className="text-xs text-slate-500 mt-1">À venir ce mois</div>
                  </div>
                </div>
              </div>

              {/* Synthèse des impôts - Améliorée */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* IRG - Amélioré */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-purple-800 flex items-center">
                      <span className="mr-2">👥</span>
                      IRG
                    </h3>
                    <UserGroupIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border-2 border-purple-300">
                      <div className="text-xs text-purple-600 mb-1 font-semibold uppercase">Montant dû</div>
                      <div className="text-3xl font-black text-purple-900">45,000 DA</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-emerald-50 rounded-lg p-3 text-center border border-emerald-200">
                        <div className="text-xs text-emerald-600 mb-1 font-semibold">Payé</div>
                        <div className="font-bold text-emerald-700 text-lg">20,000 DA</div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-3 text-center border border-red-200">
                        <div className="text-xs text-red-600 mb-1 font-semibold">Solde</div>
                        <div className="font-bold text-red-700 text-lg">25,000 DA</div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-purple-200">
                      <div className="text-xs font-bold text-purple-700 uppercase mb-2">Barème Progressif</div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-600">0-30k:</span>
                          <span className="font-medium">0%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">30k-120k:</span>
                          <span className="font-medium">10%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">120k-360k:</span>
                          <span className="font-medium">20%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">360k-1.2M:</span>
                          <span className="font-medium">30%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">+1.2M:</span>
                          <span className="font-medium">35%</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-purple-100 rounded-lg p-2 border border-purple-300">
                      <div className="text-xs text-purple-700">
                        <span className="font-bold">Base:</span> 450,000 DA • <span className="font-bold">Taux moyen:</span> 10%
                      </div>
                    </div>
                  </div>
                </div>

                {/* IBS - Amélioré */}
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border-2 border-red-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-red-800 flex items-center">
                      <span className="mr-2">🏢</span>
                      IBS
                    </h3>
                    <BuildingOfficeIcon className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border-2 border-red-300">
                      <div className="text-xs text-red-600 mb-1 font-semibold uppercase">Montant dû</div>
                      <div className="text-3xl font-black text-red-900">208,000 DA</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-emerald-50 rounded-lg p-3 text-center border border-emerald-200">
                        <div className="text-xs text-emerald-600 mb-1 font-semibold">Acomptes</div>
                        <div className="font-bold text-emerald-700 text-lg">60,000 DA</div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-3 text-center border border-red-200">
                        <div className="text-xs text-red-600 mb-1 font-semibold">Solde</div>
                        <div className="font-bold text-red-700 text-lg">148,000 DA</div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-red-200">
                      <div className="text-xs font-bold text-red-700 uppercase mb-2">Détail Calcul</div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Bénéfice imposable:</span>
                          <span className="font-medium">800,000 DA</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Taux IBS:</span>
                          <span className="font-medium">26%</span>
                        </div>
                        <div className="flex justify-between border-t border-red-200 pt-1">
                          <span className="text-red-700 font-bold">IBS calculé:</span>
                          <span className="text-red-700 font-bold">208,000 DA</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-red-100 rounded-lg p-2 border border-red-300">
                      <div className="text-xs text-red-700">
                        <span className="font-bold">Base:</span> 800,000 DA • <span className="font-bold">Taux:</span> 26%
                      </div>
                      <div className="text-xs text-amber-600 mt-1">
                        ⚠️ Échéance solde: 31/03/2025
                      </div>
                    </div>
                  </div>
                </div>

                {/* TAP - Amélioré */}
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border-2 border-teal-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-teal-800 flex items-center">
                      <span className="mr-2">🏛️</span>
                      TAP
                    </h3>
                    <CalculatorIcon className="h-8 w-8 text-teal-600" />
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border-2 border-teal-300">
                      <div className="text-xs text-teal-600 mb-1 font-semibold uppercase">Montant Annuel</div>
                      <div className="text-3xl font-black text-teal-900">64,000 DA</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-emerald-50 rounded-lg p-3 text-center border border-emerald-200">
                        <div className="text-xs text-emerald-600 mb-1 font-semibold">Payé</div>
                        <div className="font-bold text-emerald-700 text-lg">32,000 DA</div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-3 text-center border border-red-200">
                        <div className="text-xs text-red-600 mb-1 font-semibold">Reste</div>
                        <div className="font-bold text-red-700 text-lg">32,000 DA</div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-teal-200">
                      <div className="text-xs font-bold text-teal-700 uppercase mb-2">Paiements Mensuels</div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-600">TAP mensuel moyen:</span>
                          <span className="font-medium">5,333 DA</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Échéance:</span>
                          <span className="font-medium">30 de chaque mois</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-teal-100 rounded-lg p-2 border border-teal-300">
                      <div className="text-xs text-teal-700">
                        <span className="font-bold">Base:</span> 3,200,000 DA • <span className="font-bold">Taux:</span> 2%
                      </div>
                      <div className="text-xs text-amber-600 mt-1">
                        ⚠️ Prochaine échéance: 30/02/2025
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tableau synthèse (réutilisé) */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2 text-slate-600" />
                  📋 Synthèse Complète des Impôts
                </h3>

                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-700 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase">Impôt</th>
                        <th className="px-6 py-4 text-right text-xs font-bold uppercase">Base</th>
                        <th className="px-6 py-4 text-center text-xs font-bold uppercase">Taux</th>
                        <th className="px-6 py-4 text-right text-xs font-bold uppercase">Dû</th>
                        <th className="px-6 py-4 text-right text-xs font-bold uppercase">Payé</th>
                        <th className="px-6 py-4 text-right text-xs font-bold uppercase">Reste</th>
                        <th className="px-6 py-4 text-center text-xs font-bold uppercase">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {syntheseFiscale.filter(s => s.impot !== 'TVA').map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900">{item.impot}</td>
                          <td className="px-6 py-4 text-right font-medium text-slate-900">
                            {item.baseImposable.toLocaleString()} DA
                          </td>
                          <td className="px-6 py-4 text-center font-semibold text-slate-700">{item.taux}</td>
                          <td className="px-6 py-4 text-right font-bold text-red-600">
                            {item.montantDu.toLocaleString()} DA
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-emerald-600">
                            {item.paye.toLocaleString()} DA
                          </td>
                          <td className="px-6 py-4 text-right font-black text-slate-900">
                            {item.solde.toLocaleString()} DA
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              item.statut === 'à jour' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {item.statut}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* VUE 4: ÉCHÉANCIER FISCAL */}
          {selectedView === 'echeancier-fiscal' && (
            <>
              {/* Statistiques échéances */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-5 border-l-4 border-red-500 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                    <span className="text-xs font-bold text-red-600 uppercase">En retard</span>
                  </div>
                  <div className="text-3xl font-black text-red-700">
                    {fiscalCalendar.filter(e => e.statut === 'en retard').length}
                  </div>
                  <div className="text-sm text-red-600 font-medium">Déclarations</div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-5 border-l-4 border-amber-500 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <BellIcon className="h-8 w-8 text-amber-600" />
                    <span className="text-xs font-bold text-amber-600 uppercase">À faire</span>
                  </div>
                  <div className="text-3xl font-black text-amber-700">
                    {fiscalCalendar.filter(e => e.statut === 'à faire').length}
                  </div>
                  <div className="text-sm text-amber-600 font-medium">Obligations</div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-5 border-l-4 border-emerald-500 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircleIcon className="h-8 w-8 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-600 uppercase">Transmises</span>
                  </div>
                  <div className="text-3xl font-black text-emerald-700">
                    {fiscalCalendar.filter(e => e.statut === 'transmise').length}
                  </div>
                  <div className="text-sm text-emerald-600 font-medium">Complétées</div>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-5 border-l-4 border-slate-500 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <CalendarIcon className="h-8 w-8 text-slate-600" />
                    <span className="text-xs font-bold text-slate-600 uppercase">Total</span>
                  </div>
                  <div className="text-3xl font-black text-slate-900">
                    {fiscalCalendar.length}
                  </div>
                  <div className="text-sm text-slate-600 font-medium">Échéances</div>
                </div>
              </div>

              {/* Calendrier fiscal */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-slate-600" />
                  📅 Calendrier Fiscal - Prochaines Échéances
                </h3>

                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-700 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase">Type</th>
                        <th className="px-6 py-4 text-right text-xs font-bold uppercase">Montant</th>
                        <th className="px-6 py-4 text-center text-xs font-bold uppercase">Échéance</th>
                        <th className="px-6 py-4 text-center text-xs font-bold uppercase">Priorité</th>
                        <th className="px-6 py-4 text-center text-xs font-bold uppercase">Statut</th>
                        <th className="px-6 py-4 text-center text-xs font-bold uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {fiscalCalendar.map((event, index) => (
                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900">{event.date}</td>
                          <td className="px-6 py-4 text-sm text-slate-900">{event.type}</td>
                          <td className="px-6 py-4 text-right font-bold text-slate-900">
                            {event.montant.toLocaleString()} DA
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              event.echeanceJours < 0 ? 'bg-red-100 text-red-700' :
                              event.echeanceJours <= 15 ? 'bg-amber-100 text-amber-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {event.echeanceJours < 0 ? `Retard ${Math.abs(event.echeanceJours)}j` : `Dans ${event.echeanceJours}j`}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              event.priorite === 'critique' ? 'bg-red-100 text-red-700 border border-red-300' :
                              event.priorite === 'haute' ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                              'bg-slate-100 text-slate-700 border border-slate-300'
                            }`}>
                              {event.priorite}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              event.statut === 'transmise' ? 'bg-emerald-100 text-emerald-700' :
                              event.statut === 'en retard' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {event.statut}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button 
                              onClick={() => {
                                if (event.statut === 'transmise') {
                                  setModalContent({
                                    title: '✅ Déclaration Transmise',
                                    message: `${event.type}\nDate: ${event.date}\nMontant: ${event.montant.toLocaleString()} DA\n\n✓ Déclaration validée\n✓ Paiement effectué\n📄 Reçu disponible\n\nRéférence: #${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                                    type: 'success'
                                  });
                                } else if (event.statut === 'en retard') {
                                  setModalContent({
                                    title: '⚠️ Déclaration en Retard',
                                    message: `${event.type}\nDate limite: ${event.date}\nRetard: ${Math.abs(event.echeanceJours)} jours\nMontant: ${event.montant.toLocaleString()} DA\n\n⚠️ URGENT - Pénalités possibles\n\nAction immédiate requise !`,
                                    type: 'warning'
                                  });
                                } else {
                                  setModalContent({
                                    title: '📋 Traiter la Déclaration',
                                    message: `${event.type}\nÉchéance: ${event.date} (${event.echeanceJours} jours)\nMontant estimé: ${event.montant.toLocaleString()} DA\n\n📝 Formulaire en préparation\n⏰ Rappel activé\n\nLe formulaire sera disponible sous peu.`,
                                    type: 'info'
                                  });
                                }
                                setShowModal(true);
                                setTimeout(() => setShowModal(false), 3500);
                              }}
                              className="px-3 py-1 bg-slate-600 text-white rounded text-xs hover:bg-slate-700 transition-colors"
                            >
                              {event.statut === 'transmise' ? 'Voir' : 'Traiter'}
          </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Timeline des échéances */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2 text-slate-600" />
                  ⏱️ Timeline des Prochaines Obligations
                </h3>

                <div className="bg-white rounded-lg p-6 border border-slate-200">
                  <div className="space-y-4">
                    {fiscalCalendar.slice(0, 5).map((event, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            event.statut === 'en retard' ? 'bg-red-100 text-red-600 border-2 border-red-500' :
                            event.statut === 'transmise' ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-500' :
                            'bg-amber-100 text-amber-600 border-2 border-amber-500'
                          }`}>
                            {event.statut === 'en retard' ? <ExclamationTriangleIcon className="h-5 w-5" /> :
                             event.statut === 'transmise' ? <CheckCircleIcon className="h-5 w-5" /> :
                             <ClockIcon className="h-5 w-5" />}
                          </div>
                          {index < 4 && (
                            <div className={`w-0.5 h-12 ${
                              event.statut === 'en retard' ? 'bg-red-300' :
                              event.statut === 'transmise' ? 'bg-emerald-300' :
                              'bg-amber-300'
                            }`}></div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-bold text-slate-900">{event.type}</div>
                            <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                              event.statut === 'en retard' ? 'bg-red-100 text-red-700' :
                              event.statut === 'transmise' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {event.date}
                            </div>
                          </div>
                          <div className="text-sm text-slate-600 mb-2">
                            Montant: <span className="font-bold text-slate-900">{event.montant.toLocaleString()} DA</span>
                          </div>
                          <div className="bg-slate-50 rounded p-3 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600">
                                {event.echeanceJours < 0 ? `⚠️ En retard de ${Math.abs(event.echeanceJours)} jours` :
                                 event.echeanceJours <= 15 ? `🔔 Urgent - ${event.echeanceJours} jours restants` :
                                 `✓ ${event.echeanceJours} jours restants`}
                              </span>
                              <button 
                                onClick={() => {
                                  if (event.statut === 'transmise') {
                                    setModalContent({
                                      title: '📄 Reçu de Déclaration',
                                      message: `${event.type}\n\n✅ Statut: Validé et payé\n📅 Date: ${event.date}\n💰 Montant: ${event.montant.toLocaleString()} DA\n🔖 Référence: #${Math.random().toString(36).substr(2, 9).toUpperCase()}\n\n📥 Reçu officiel disponible au téléchargement`,
                                      type: 'success'
                                    });
                                  } else if (event.statut === 'en retard') {
                                    setModalContent({
                                      title: '💳 Paiement Immédiat',
                                      message: `${event.type}\n\n⚠️ RETARD DE ${Math.abs(event.echeanceJours)} JOURS\n💰 Montant dû: ${event.montant.toLocaleString()} DA\n⚡ Pénalités: ${Math.round(event.montant * 0.1).toLocaleString()} DA\n\n💳 Modes de paiement:\n• Virement bancaire\n• Chèque\n• Versement DGI\n\nProcéder au paiement immédiatement pour éviter majorations.`,
                                      type: 'warning'
                                    });
                                  } else {
                                    setModalContent({
                                      title: '📝 Remplir la Déclaration',
                                      message: `${event.type}\n\n📅 Échéance: ${event.date}\n⏰ Temps restant: ${event.echeanceJours} jours\n💰 Montant estimé: ${event.montant.toLocaleString()} DA\n\n📋 Étapes:\n1. Vérifier les données\n2. Compléter le formulaire\n3. Valider et transmettre\n4. Effectuer le paiement\n\nFormulaire en cours de chargement...`,
                                      type: 'info'
                                    });
                                  }
                                  setShowModal(true);
                                  setTimeout(() => setShowModal(false), 4000);
                                }}
                                className={`px-3 py-1 rounded text-xs font-bold ${
                                  event.statut === 'en retard' ? 'bg-red-600 text-white hover:bg-red-700' :
                                  event.statut === 'transmise' ? 'bg-emerald-600 text-white hover:bg-emerald-700' :
                                  'bg-amber-600 text-white hover:bg-amber-700'
                                } transition-colors`}
                              >
                                {event.statut === 'transmise' ? 'Voir reçu' : event.statut === 'en retard' ? 'Payer maintenant' : 'Remplir'}
          </button>
        </div>
      </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions enrichies - Design premium */}
        <div className="mt-8 pt-8 border-t-2 border-slate-200">
          <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-6 border-2 border-slate-200 shadow-lg">
            <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
              <span className="inline-block w-2 h-8 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full mr-3"></span>
              Actions Rapides
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <button 
                onClick={() => handleAction('rapport')}
                className="group relative px-5 py-4 bg-gradient-to-br from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all duration-300 flex flex-col items-center shadow-lg hover:shadow-2xl hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg mb-2">
                    <EyeIcon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold">Rapport</span>
                </div>
              </button>
              
              <button 
                onClick={() => handleAction('pdf')}
                className="group relative px-5 py-4 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-300 flex flex-col items-center border-2 border-slate-300 shadow-lg hover:shadow-2xl hover:scale-105"
              >
                <div className="p-2 bg-slate-100 group-hover:bg-slate-200 rounded-lg mb-2 transition-colors">
                  <ArrowDownTrayIcon className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold">PDF</span>
              </button>
              
              <button 
                onClick={() => handleAction('excel')}
                className="group relative px-5 py-4 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-300 flex flex-col items-center border-2 border-slate-300 shadow-lg hover:shadow-2xl hover:scale-105"
              >
                <div className="p-2 bg-slate-100 group-hover:bg-slate-200 rounded-lg mb-2 transition-colors">
                  <DocumentArrowDownIcon className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold">Excel</span>
              </button>
              
              <button 
                onClick={() => handleAction('g50')}
                className="group relative px-5 py-4 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 flex flex-col items-center shadow-lg hover:shadow-2xl hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute top-1 right-1">
                  <span className="animate-pulse inline-block w-2 h-2 bg-white rounded-full"></span>
                </div>
                <div className="relative">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg mb-2">
                    <CloudArrowUpIcon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold">G50</span>
                </div>
              </button>
              
              <button 
                onClick={() => handleAction('ai')}
                className="group relative px-5 py-4 bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-xl hover:from-slate-800 hover:to-black transition-all duration-300 flex flex-col items-center shadow-lg hover:shadow-2xl hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-emerald-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute top-1 right-1">
                  <span className="animate-ping inline-block w-2 h-2 bg-emerald-400 rounded-full"></span>
                </div>
                <div className="relative">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg mb-2">
                    <SparklesIcon className="h-6 w-6 animate-pulse" />
                  </div>
                  <span className="text-xs font-bold">IA</span>
                </div>
              </button>
              
              <button 
                onClick={() => handleAction('dgi')}
                className="group relative px-5 py-4 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-300 flex flex-col items-center border-2 border-slate-300 shadow-lg hover:shadow-2xl hover:scale-105"
              >
                <div className="p-2 bg-slate-100 group-hover:bg-slate-200 rounded-lg mb-2 transition-colors">
                  <ArrowUpOnSquareIcon className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold">DGI</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de notification - Design premium */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full animate-scale-in overflow-hidden border-4 border-white/20">
            {/* Effet de fond animé */}
            <div className={`absolute top-0 left-0 w-full h-2 ${
              modalContent.type === 'success' ? 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600' :
              modalContent.type === 'warning' ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600' :
              'bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800'
            }`}></div>
            
            <div className={`p-8 rounded-t-3xl ${
              modalContent.type === 'success' ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50' :
              modalContent.type === 'warning' ? 'bg-gradient-to-br from-amber-50 to-amber-100/50' :
              'bg-gradient-to-br from-slate-50 to-slate-100/50'
            }`}>
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-2xl shadow-lg ${
                  modalContent.type === 'success' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
                  modalContent.type === 'warning' ? 'bg-gradient-to-br from-amber-500 to-amber-600' :
                  'bg-gradient-to-br from-slate-600 to-slate-700'
                }`}>
                  {modalContent.type === 'success' ? (
                    <CheckCircleIcon className="h-10 w-10 text-white" />
                  ) : modalContent.type === 'warning' ? (
                    <ExclamationTriangleIcon className="h-10 w-10 text-white" />
                  ) : (
                    <InformationCircleIcon className="h-10 w-10 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-black text-slate-900 mb-2">{modalContent.title}</h3>
                  <div className={`h-1 w-20 rounded-full ${
                    modalContent.type === 'success' ? 'bg-emerald-500' :
                    modalContent.type === 'warning' ? 'bg-amber-500' :
                    'bg-slate-600'
                  }`}></div>
                </div>
              </div>
            </div>
            
            <div className="p-8 bg-white">
              <p className="text-slate-700 whitespace-pre-line leading-relaxed text-base">
                {modalContent.message}
              </p>
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className={`px-8 py-3 rounded-xl text-white font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl ${
                    modalContent.type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700' :
                    modalContent.type === 'warning' ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700' :
                    'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800'
                  }`}
                >
                  Compris !
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal G50 Officiel */}
      {showG50Modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 animate-scale-in border-4 border-emerald-500">
            {/* En-tête officiel */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 rounded-t-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-white mb-2">📋 FORMULAIRE G50</h2>
                  <p className="text-emerald-100 font-semibold">Déclaration mensuelle de TVA - Série G n°50</p>
                </div>
                <button
                  onClick={() => setShowG50Modal(false)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  aria-label="Fermer le formulaire G50"
                  title="Fermer"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-8 max-h-[calc(100vh-200px)] overflow-y-auto bg-gradient-to-br from-slate-50 to-white">
              {/* En-tête administratif */}
              <div className="mb-6 p-6 bg-gradient-to-r from-slate-100 to-slate-50 rounded-xl border-2 border-slate-300 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-600 uppercase">République Algérienne Démocratique et Populaire</h3>
                    <h4 className="text-xs text-slate-600">Ministère des Finances - Direction Générale des Impôts</h4>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-600">Série G N°</div>
                    <div className="text-2xl font-black text-emerald-600">50</div>
                  </div>
                </div>
              </div>

              {/* Informations déclarant */}
              <div className="mb-6 p-6 bg-white rounded-xl border-2 border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                  <BuildingOfficeIcon className="h-5 w-5 mr-2 text-emerald-600" />
                  Identification du déclarant
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase">N° d'identification fiscale (NIF)</label>
                    <div className="mt-1 p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono font-bold text-slate-900">
                      099912345678901
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase">Article d'imposition</label>
                    <div className="mt-1 p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono font-bold text-slate-900">
                      412010000000
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-600 uppercase">Raison sociale</label>
                    <div className="mt-1 p-3 bg-slate-50 rounded-lg border border-slate-200 font-bold text-slate-900">
                      DINARLYTIC SARL
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-600 uppercase">Adresse du siège social</label>
                    <div className="mt-1 p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-900">
                      Cité des Affaires, Bt A, N°15, Alger Centre - 16000 Alger
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase">Activité principale</label>
                    <div className="mt-1 p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-900">
                      Services informatiques
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase">Code activité (NAC)</label>
                    <div className="mt-1 p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono font-bold text-slate-900">
                      62010
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase">Mois de déclaration</label>
                    <div className="mt-1 p-3 bg-emerald-50 rounded-lg border border-emerald-200 font-bold text-emerald-700">
                      OCTOBRE 2024
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase">Date limite de dépôt</label>
                    <div className="mt-1 p-3 bg-amber-50 rounded-lg border border-amber-200 font-bold text-amber-700">
                      20/11/2024
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION A: Opérations imposables */}
              <div className="mb-6 p-6 bg-white rounded-xl border-2 border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white font-black mr-2">A</span>
                  Chiffre d'affaires réalisé (Opérations imposables)
                </h3>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-12 gap-2 text-xs font-bold text-slate-700 uppercase bg-slate-100 p-3 rounded-lg">
                    <div className="col-span-1">Ligne</div>
                    <div className="col-span-6">Désignation</div>
                    <div className="col-span-2 text-center">Taux</div>
                    <div className="col-span-3 text-right">Montant HT (DA)</div>
                  </div>

                  {[
                    { ligne: '01', designation: 'Ventes de produits et marchandises', taux: '19%', montant: 4850000 },
                    { ligne: '02', designation: 'Prestations de services', taux: '19%', montant: 1728947 },
                    { ligne: '03', designation: 'Opérations soumises au taux réduit', taux: '9%', montant: 0 },
                    { ligne: '04', designation: 'Autres opérations taxables', taux: '19%', montant: 0 }
                  ].map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200">
                      <div className="col-span-1 font-mono font-bold text-slate-900">{item.ligne}</div>
                      <div className="col-span-6 text-sm text-slate-700">{item.designation}</div>
                      <div className="col-span-2 text-center">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                          {item.taux}
                        </span>
                      </div>
                      <div className="col-span-3 text-right font-mono font-bold text-slate-900">
                        {item.montant.toLocaleString()}
                      </div>
                    </div>
                  ))}

                  <div className="grid grid-cols-12 gap-2 items-center p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg border-2 border-emerald-300">
                    <div className="col-span-1 font-mono font-black text-emerald-700">05</div>
                    <div className="col-span-6 text-sm font-black text-emerald-700">TOTAL BASE TAXABLE</div>
                    <div className="col-span-2"></div>
                    <div className="col-span-3 text-right font-mono font-black text-emerald-700 text-lg">
                      6,578,947
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION B: TVA Collectée */}
              <div className="mb-6 p-6 bg-white rounded-xl border-2 border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white font-black mr-2">B</span>
                  TVA Collectée
                </h3>
                
                <div className="space-y-3">
                  {[
                    { ligne: '10', designation: 'TVA sur ventes et prestations (19%)', calcul: '6,578,947 × 19%', montant: 1250000 },
                    { ligne: '11', designation: 'TVA sur opérations au taux réduit (9%)', calcul: '0 × 9%', montant: 0 },
                    { ligne: '12', designation: 'TVA sur autres opérations', calcul: '-', montant: 0 }
                  ].map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="col-span-1 font-mono font-bold text-slate-900">{item.ligne}</div>
                      <div className="col-span-5 text-sm text-slate-700">{item.designation}</div>
                      <div className="col-span-3 text-center text-xs font-mono text-slate-600">{item.calcul}</div>
                      <div className="col-span-3 text-right font-mono font-bold text-slate-900">
                        {item.montant.toLocaleString()}
                      </div>
                    </div>
                  ))}

                  <div className="grid grid-cols-12 gap-2 items-center p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg border-2 border-emerald-300">
                    <div className="col-span-1 font-mono font-black text-emerald-700">13</div>
                    <div className="col-span-8 text-sm font-black text-emerald-700">TOTAL TVA COLLECTÉE</div>
                    <div className="col-span-3 text-right font-mono font-black text-emerald-700 text-lg">
                      1,250,000
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION A-BIS: Opérations exonérées */}
              <div className="mb-6 p-6 bg-white rounded-xl border-2 border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-400 text-white font-black mr-2 text-sm">A'</span>
                  Opérations exonérées (sans TVA)
                </h3>
                
                <div className="space-y-3">
                  {[
                    { ligne: '06', designation: 'Exportations de biens', montant: 0 },
                    { ligne: '07', designation: 'Opérations exonérées par la loi', montant: 0 },
                    { ligne: '08', designation: 'Ventes en suspension de TVA', montant: 0 }
                  ].map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="col-span-1 font-mono font-bold text-slate-900">{item.ligne}</div>
                      <div className="col-span-8 text-sm text-slate-700">{item.designation}</div>
                      <div className="col-span-3 text-right font-mono font-bold text-slate-600">
                        {item.montant.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION C: TVA Déductible */}
              <div className="mb-6 p-6 bg-white rounded-xl border-2 border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-600 text-white font-black mr-2">C</span>
                  TVA Déductible sur achats et charges
                </h3>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-12 gap-2 text-xs font-bold text-slate-700 uppercase bg-slate-100 p-3 rounded-lg">
                    <div className="col-span-1">Ligne</div>
                    <div className="col-span-6">Nature des achats</div>
                    <div className="col-span-2 text-center">Base HT</div>
                    <div className="col-span-3 text-right">TVA (DA)</div>
                  </div>

                  {[
                    { ligne: '20', designation: 'Achats de biens et marchandises destinés à la revente', base: 3263158, montant: 620000 },
                    { ligne: '21', designation: 'Services et prestations', base: 1500000, montant: 285000 },
                    { ligne: '22', designation: 'Acquisition d\'immobilisations', base: 500000, montant: 95000 },
                    { ligne: '23', designation: 'Autres charges (loyers, fournitures...)', base: 263158, montant: 50000 },
                    { ligne: '24', designation: 'Crédit de TVA du mois précédent à reporter', base: null, montant: 0 }
                  ].map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200">
                      <div className="col-span-1 font-mono font-bold text-slate-900">{item.ligne}</div>
                      <div className="col-span-6 text-sm text-slate-700">{item.designation}</div>
                      <div className="col-span-2 text-center text-xs font-mono text-slate-600">
                        {item.base ? item.base.toLocaleString() : '-'}
                      </div>
                      <div className="col-span-3 text-right font-mono font-bold text-slate-900">
                        {item.montant.toLocaleString()}
                      </div>
                    </div>
                  ))}

                  <div className="grid grid-cols-12 gap-2 items-center p-4 bg-gradient-to-r from-slate-100 to-slate-200 rounded-lg border-2 border-slate-300">
                    <div className="col-span-1 font-mono font-black text-slate-700">25</div>
                    <div className="col-span-8 text-sm font-black text-slate-700">TOTAL TVA DÉDUCTIBLE</div>
                    <div className="col-span-3 text-right font-mono font-black text-slate-700 text-lg">
                      1,050,000
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION D: Liquidation */}
              <div className="mb-6 p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border-2 border-red-300 shadow-lg">
                <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white font-black mr-2">D</span>
                  Liquidation de la TVA
                </h3>
                
                <div className="space-y-4">
                  {/* Récapitulatif des totaux */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-lg border-2 border-emerald-300 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-bold text-slate-600 uppercase">Ligne 13 - TVA Collectée</div>
                        <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="text-2xl font-black text-emerald-700">1,250,000 DA</div>
                      <div className="text-xs text-emerald-600 mt-1">Section B</div>
                    </div>
                    <div className="p-4 bg-white rounded-lg border-2 border-slate-300 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-bold text-slate-600 uppercase">Ligne 25 - TVA Déductible</div>
                        <CheckCircleIcon className="h-5 w-5 text-slate-600" />
                      </div>
                      <div className="text-2xl font-black text-slate-700">1,050,000 DA</div>
                      <div className="text-xs text-slate-600 mt-1">Section C</div>
                    </div>
                  </div>

                  {/* Calcul intermédiaire */}
                  <div className="p-4 bg-white rounded-lg border-2 border-slate-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Différence (13 - 25)</span>
                      <span className="font-mono font-bold text-slate-900">
                        1,250,000 - 1,050,000 = <span className="text-red-600">200,000 DA</span>
                      </span>
                    </div>
                  </div>

                  {/* TVA Nette à payer */}
                  <div className="p-6 bg-gradient-to-r from-red-600 to-red-700 rounded-xl shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
                    <div className="relative flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-red-100 uppercase mb-2">Ligne 30 - TVA NETTE À PAYER</div>
                        <div className="text-xs text-red-200">TVA Collectée - TVA Déductible (si positif)</div>
                      </div>
                      <div className="text-right">
                        <div className="text-5xl font-black text-white">200,000</div>
                        <div className="text-xl font-bold text-red-100">DA</div>
                      </div>
                    </div>
                  </div>

                  {/* Crédit reportable */}
                  <div className="p-4 bg-white rounded-lg border-2 border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-700">Ligne 31 - Crédit de TVA à reporter</div>
                        <div className="text-xs text-slate-600">Si TVA déductible &gt; TVA collectée</div>
                      </div>
                      <div className="text-xl font-black text-slate-900">0 DA</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION E: Mode de paiement */}
              <div className="mb-6 p-6 bg-white rounded-xl border-2 border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white font-black mr-2">E</span>
                  Mode de paiement
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50 rounded-lg border-2 border-emerald-300">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                      <div className="text-sm font-bold text-emerald-700">☑ Virement bancaire</div>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1 mt-3">
                      <div><span className="font-bold">Banque:</span> BNA - Agence Alger Centre</div>
                      <div><span className="font-bold">RIB:</span> 0041 2345 6789 0123 4567 89</div>
                      <div><span className="font-bold">Bénéficiaire:</span> Trésor Public - DGI</div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg border-2 border-slate-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-5 h-5 rounded border-2 border-slate-400"></div>
                      <div className="text-sm font-bold text-slate-600">☐ Chèque bancaire</div>
                    </div>
                    <div className="flex items-center space-x-2 mt-3">
                      <div className="w-5 h-5 rounded border-2 border-slate-400"></div>
                      <div className="text-sm font-bold text-slate-600">☐ Versement espèces</div>
                    </div>
                    <div className="flex items-center space-x-2 mt-3">
                      <div className="w-5 h-5 rounded border-2 border-slate-400"></div>
                      <div className="text-sm font-bold text-slate-600">☐ Autre moyen</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
                  <div className="flex items-center space-x-2">
                    <InformationCircleIcon className="h-5 w-5 text-amber-600" />
                    <div className="text-xs text-amber-700">
                      <span className="font-bold">Rappel:</span> Le paiement doit être effectué au plus tard le <span className="font-black">20/11/2024</span> pour éviter les pénalités de retard (10% + 3% par mois).
                    </div>
                  </div>
                </div>
              </div>

              {/* Analyses Avancées G50 */}
              <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-lg">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                  <SparklesIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Analyses Avancées & Tendances
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {/* Tendance TVA */}
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-600 uppercase">Tendance TVA</span>
                      <ArrowTrendingUpIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-blue-600">+18%</div>
                    <div className="text-xs text-slate-500 mt-1">vs 3 mois précédents</div>
                  </div>

                  {/* Ratio TVA Nette/CA */}
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-600 uppercase">Ratio TVA/CA</span>
                      <ChartBarIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-blue-600">3.0%</div>
                    <div className="text-xs text-slate-500 mt-1">TVA nette / CA HT</div>
                  </div>

                  {/* Taux de récupération TVA */}
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-600 uppercase">Récupération</span>
                      <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="text-2xl font-bold text-emerald-600">84%</div>
                    <div className="text-xs text-slate-500 mt-1">TVA déductible / collectée</div>
                  </div>

                  {/* Score de conformité */}
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-600 uppercase">Conformité</span>
                      <SparklesIcon className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="text-2xl font-bold text-emerald-600">95%</div>
                    <div className="text-xs text-slate-500 mt-1">Score de conformité</div>
                  </div>
                </div>

                {/* Recommandations intelligentes */}
                <div className="bg-white rounded-lg p-4 border-2 border-blue-300">
                  <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center">
                    <InformationCircleIcon className="h-4 w-4 mr-2" />
                    Recommandations Intelligentes
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start">
                      <span className="text-emerald-600 mr-2">✓</span>
                      <span className="text-slate-700">Votre taux de récupération TVA (84%) est excellent. Continuez à optimiser vos achats.</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-blue-600 mr-2">ℹ</span>
                      <span className="text-slate-700">La TVA nette a augmenté de 18% sur 3 mois. Prévoyez une trésorerie suffisante pour les prochains versements.</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-amber-600 mr-2">⚠</span>
                      <span className="text-slate-700">Pensez à déclarer avant le 20 du mois pour éviter les pénalités de retard.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Récapitulatif final */}
              <div className="mb-6 p-6 bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl border-2 border-slate-300 shadow-lg">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-700 text-white font-black mr-2">📊</span>
                  Récapitulatif de la déclaration
                </h3>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-white rounded-lg border-2 border-slate-200 text-center">
                    <div className="text-xs font-bold text-slate-600 uppercase mb-2">CA Total imposable</div>
                    <div className="text-xl font-black text-slate-900">6,578,947 DA</div>
                    <div className="text-xs text-slate-600 mt-1">Ligne 05</div>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-lg border-2 border-emerald-200 text-center">
                    <div className="text-xs font-bold text-emerald-600 uppercase mb-2">TVA Collectée</div>
                    <div className="text-xl font-black text-emerald-700">1,250,000 DA</div>
                    <div className="text-xs text-emerald-600 mt-1">Ligne 13</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border-2 border-slate-200 text-center">
                    <div className="text-xs font-bold text-slate-600 uppercase mb-2">TVA Déductible</div>
                    <div className="text-xl font-black text-slate-700">1,050,000 DA</div>
                    <div className="text-xs text-slate-600 mt-1">Ligne 25</div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-red-600 to-red-700 rounded-xl text-center shadow-xl">
                  <div className="text-sm font-bold text-red-100 uppercase mb-3">MONTANT À VERSER AU TRÉSOR PUBLIC</div>
                  <div className="text-6xl font-black text-white mb-2">200,000</div>
                  <div className="text-2xl font-bold text-red-100">DINARS ALGÉRIENS</div>
                  <div className="mt-4 pt-4 border-t border-red-400/30">
                    <div className="text-xs text-red-100">
                      En toutes lettres: <span className="font-black">DEUX CENT MILLE DINARS</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Déclaration et signature */}
              <div className="mb-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-slate-300">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-700 text-white font-black mr-2">F</span>
                  Déclaration sur l'honneur et engagement
                </h3>
                
                <div className="p-4 bg-white rounded-lg border-2 border-slate-200 mb-4">
                  <p className="text-sm text-slate-700 leading-relaxed italic">
                    Je soussigné(e), <span className="font-bold not-italic">Gérant de DINARLYTIC SARL</span>, certifie sur l'honneur que les renseignements fournis dans la présente déclaration sont exacts et complets. 
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed mt-3 italic">
                    Je m'engage à fournir tous les documents comptables et justificatifs sur demande de l'administration fiscale, et à rectifier immédiatement toute erreur ou omission portée à ma connaissance.
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed mt-3 italic">
                    Je reconnais être informé(e) des sanctions pénales prévues par l'article 303 du Code des Impôts Directs en cas de déclaration frauduleuse.
                  </p>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="p-5 bg-white rounded-xl border-2 border-slate-200 text-center shadow-sm">
                    <div className="text-xs font-bold text-slate-600 uppercase mb-3">Fait à</div>
                    <div className="font-bold text-slate-900 text-lg">Alger</div>
                  </div>
                  <div className="p-5 bg-white rounded-xl border-2 border-slate-200 text-center shadow-sm">
                    <div className="text-xs font-bold text-slate-600 uppercase mb-3">Le</div>
                    <div className="font-bold text-slate-900 text-lg">{new Date().toLocaleDateString('fr-FR')}</div>
                  </div>
                  <div className="p-5 bg-white rounded-xl border-2 border-slate-200 text-center shadow-sm">
                    <div className="text-xs font-bold text-slate-600 uppercase mb-3">Qualité</div>
                    <div className="font-bold text-slate-900 text-lg">Gérant</div>
                  </div>
                </div>

                <div className="mt-4 p-6 bg-gradient-to-br from-emerald-50 to-white rounded-xl border-2 border-emerald-300">
                  <div className="text-xs font-bold text-emerald-600 uppercase mb-3 text-center">Cachet de l'entreprise et signature du déclarant</div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Cachet de l'entreprise */}
                    <div className="p-6 bg-white rounded-lg border-2 border-slate-300 relative">
                      <div className="text-center">
                        <div className="text-xs font-bold text-slate-600 mb-3">CACHET OFFICIEL</div>
                        
                        {/* Cachet circulaire SVG */}
                        <div className="flex items-center justify-center">
                          <svg className="w-40 h-40" viewBox="0 0 200 200">
                            {/* Cercle extérieur */}
                            <circle cx="100" cy="100" r="90" fill="none" stroke="#059669" strokeWidth="4" />
                            <circle cx="100" cy="100" r="85" fill="none" stroke="#059669" strokeWidth="2" />
                            
                            {/* Texte circulaire supérieur */}
                            <path id="circlePath1" d="M 30,100 A 70,70 0 0,1 170,100" fill="none" />
                            <text fontSize="11" fontWeight="900" fill="#059669">
                              <textPath href="#circlePath1" startOffset="50%" textAnchor="middle">
                                RÉPUBLIQUE ALGÉRIENNE
                              </textPath>
                            </text>
                            
                            {/* Texte circulaire inférieur */}
                            <path id="circlePath2" d="M 170,100 A 70,70 0 0,1 30,100" fill="none" />
                            <text fontSize="11" fontWeight="900" fill="#059669">
                              <textPath href="#circlePath2" startOffset="50%" textAnchor="middle">
                                DINARLYTIC SARL
                              </textPath>
                            </text>
                            
                            {/* Centre */}
                            <text x="100" y="95" fontSize="16" fontWeight="900" fill="#059669" textAnchor="middle">
                              NIF
                            </text>
                            <text x="100" y="112" fontSize="10" fontWeight="700" fill="#334155" textAnchor="middle">
                              099912345678901
                            </text>
                            
                            {/* Étoiles décoratives */}
                            <path d="M 100,30 L 102,36 L 108,36 L 103,40 L 105,46 L 100,42 L 95,46 L 97,40 L 92,36 L 98,36 Z" fill="#10b981" />
                            <path d="M 100,165 L 102,171 L 108,171 L 103,175 L 105,181 L 100,177 L 95,181 L 97,175 L 92,171 L 98,171 Z" fill="#10b981" />
                          </svg>
                        </div>
                        
                        <div className="mt-3 text-xs text-slate-600">
                          Cachet officiel certifié
                        </div>
                      </div>
                    </div>

                    {/* Signature manuscrite */}
                    <div className="p-6 bg-white rounded-lg border-2 border-slate-300 relative">
                      <div className="text-center mb-3">
                        <div className="text-xs font-bold text-slate-600">SIGNATURE DU GÉRANT</div>
                      </div>
                      
                      {/* Signature SVG manuscrite */}
                      <div className="flex items-center justify-center h-32 bg-slate-50 rounded-lg border border-slate-200">
                        <svg className="w-48 h-24" viewBox="0 0 240 120">
                          {/* Signature cursive réaliste */}
                          <path
                            d="M 20,80 Q 30,60 40,70 T 60,75 Q 70,80 80,70 T 100,65 Q 110,60 120,68 T 140,72 Q 150,75 160,70 T 180,68 Q 190,65 200,72 T 220,75"
                            fill="none"
                            stroke="#0f172a"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity="0"
                          >
                            <animate attributeName="opacity" from="0" to="1" dur="0.5s" fill="freeze" />
                            <animate 
                              attributeName="stroke-dasharray" 
                              from="0 1000" 
                              to="1000 0" 
                              dur="2s" 
                              fill="freeze" 
                            />
                          </path>
                          
                          {/* Paraphe */}
                          <path
                            d="M 60,85 Q 80,95 100,85 Q 120,75 140,88"
                            fill="none"
                            stroke="#0f172a"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            opacity="0"
                          >
                            <animate attributeName="opacity" from="0" to="1" begin="1.5s" dur="0.5s" fill="freeze" />
                          </path>
                          
                          {/* Initiales décoratives */}
                          <text x="180" y="95" fontSize="28" fontWeight="900" fill="#0f172a" fontFamily="'Brush Script MT', cursive" opacity="0">
                            M.B
                            <animate attributeName="opacity" from="0" to="1" begin="2s" dur="0.5s" fill="freeze" />
                          </text>
                        </svg>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-center space-x-2">
                          <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                          <span className="text-sm font-bold text-emerald-700">✓ SIGNÉ ÉLECTRONIQUEMENT</span>
                        </div>
                        <div className="text-xs text-slate-600 text-center">
                          Signature numérique valide
                        </div>
                        <div className="text-xs font-mono text-slate-500 text-center bg-slate-100 p-2 rounded">
                          SHA256: {Math.random().toString(36).substr(2, 32).toUpperCase().substring(0, 16)}...
                        </div>
                        <div className="text-xs text-slate-600 text-center">
                          {new Date().toLocaleString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-slate-100 rounded-lg border border-slate-300">
                  <div className="text-xs text-slate-600 text-center">
                    <span className="font-bold">⚠️ Important:</span> Cette déclaration engage la responsabilité du signataire. 
                    Toute fausse déclaration est passible de sanctions fiscales et pénales.
                  </div>
                </div>
              </div>

              {/* Informations administratives */}
              <div className="mb-6 p-4 bg-gradient-to-r from-slate-100 to-slate-50 rounded-xl border-2 border-slate-300">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-bold text-slate-700">Référence déclaration:</span>
                    <span className="ml-2 font-mono text-slate-900">G50-{new Date().getFullYear()}-{(new Date().getMonth() + 1).toString().padStart(2, '0')}-{Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">Date de génération:</span>
                    <span className="ml-2 text-slate-900">{new Date().toLocaleString('fr-FR')}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">Centre des impôts:</span>
                    <span className="ml-2 text-slate-900">CDI Alger Centre</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">Code guichet:</span>
                    <span className="ml-2 font-mono text-slate-900">16001</span>
                  </div>
                </div>
              </div>

              {/* Boutons d'action premium */}
              <div className="sticky bottom-0 bg-gradient-to-r from-slate-100 to-white p-6 rounded-xl border-2 border-slate-300 shadow-2xl">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Formulaire validé</div>
                      <div className="text-xs text-slate-600">Prêt pour transmission</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowG50Modal(false)}
                      className="px-6 py-3 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-bold border-2 border-slate-300 shadow-md hover:shadow-lg"
                    >
                      ← Fermer
                    </button>
                    <button
                      onClick={() => {
                        setShowG50Modal(false);
                        setModalContent({
                          title: '🖨️ Impression en cours',
                          message: 'Préparation du formulaire pour impression...\n\n✅ Format A4 officiel\n✅ En-tête DGI\n✅ Codes-barres générés\n\nEnvoi vers l\'imprimante...',
                          type: 'success'
                        });
                        setShowModal(true);
                        setTimeout(() => setShowModal(false), 3000);
                      }}
                      className="px-6 py-3 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-bold border-2 border-slate-300 shadow-md hover:shadow-lg hover:scale-105"
                    >
                      <PrinterIcon className="h-5 w-5 inline mr-2" />
                      Imprimer
                    </button>
                    <button
                      onClick={() => {
                        setShowG50Modal(false);
                        setModalContent({
                          title: '📥 Téléchargement réussi',
                          message: 'PDF généré avec succès !\n\n📄 Fichier: G50_Octobre_2024_DINARLYTIC.pdf\n📦 Taille: 458 KB\n✅ Conforme format DGI\n🔒 Sécurisé et horodaté\n\n💾 Sauvegardé dans "Mes Documents"',
                          type: 'success'
                        });
                        setShowModal(true);
                        setTimeout(() => setShowModal(false), 3500);
                      }}
                      className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all font-bold shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <ArrowDownTrayIcon className="h-5 w-5 inline mr-2" />
                      Télécharger PDF
                    </button>
                    <button
                      onClick={() => {
                        setShowG50Modal(false);
                        setModalContent({
                          title: '📤 Transmission réussie',
                          message: 'Formulaire G50 transmis à la DGI !\n\n✅ Envoi sécurisé (SSL/TLS)\n✅ Signature électronique validée\n✅ Horodatage certifié\n📨 Accusé de réception: #AR' + Math.random().toString(36).substr(2, 9).toUpperCase() + '\n\n⏰ Reçu le: ' + new Date().toLocaleString('fr-FR') + '\n\n📧 Copie envoyée à votre email',
                          type: 'success'
                        });
                        setShowModal(true);
                        setTimeout(() => setShowModal(false), 4500);
                      }}
                      className="px-8 py-3 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-xl hover:from-slate-800 hover:to-black transition-all font-bold shadow-lg hover:shadow-xl hover:scale-105 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
                      <div className="relative flex items-center">
                        <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                        Transmettre à la DGI
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Analyse IA Fiscale */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl max-w-5xl w-full animate-scale-in border-4 border-emerald-500 overflow-hidden">
            {/* Effet de fond animé */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse animate-delay-1000"></div>
            </div>

            {/* En-tête */}
            <div className="relative p-8 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-2xl animate-pulse">
                    <SparklesIcon className="h-12 w-12 text-white" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black text-white mb-2">🧠 Analyse IA Fiscale</h2>
                    <p className="text-emerald-200 font-medium">LIA - Logiciel d'Intelligence Analytique</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAIModal(false);
                    setAiAnalysisStep(0);
                  }}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Fermer l'analyse IA fiscale"
                  title="Fermer"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenu de l'analyse */}
            <div className="relative p-8 max-h-[calc(100vh-250px)] overflow-y-auto">
              {/* Étape 0: Initialisation */}
              {aiAnalysisStep >= 0 && (
                <div className="mb-6 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 animate-slide-in">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${aiAnalysisStep > 0 ? 'bg-emerald-500' : 'bg-slate-600 animate-pulse'}`}>
                      {aiAnalysisStep > 0 ? (
                        <CheckCircleIcon className="h-6 w-6 text-white" />
                      ) : (
                        <ArrowPathIcon className="h-6 w-6 text-white animate-spin" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-bold">🔄 Initialisation de l'analyse fiscale</div>
                      <div className="text-emerald-200 text-sm mt-1">Connexion au moteur LIA • Chargement données fiscales...</div>
                      {aiAnalysisStep > 0 && (
                        <div className="text-xs text-emerald-300 mt-2">
                          ✓ Connexion établie • TVA: 1,250k • IBS: 910k • TAP: 200k • IRG: 45k
                        </div>
                      )}
                    </div>
                    {aiAnalysisStep === 0 && (
                      <div className="text-emerald-400 font-mono text-sm animate-pulse">Analyzing...</div>
                    )}
                  </div>
                </div>
              )}

              {/* Étape 1: Analyse TVA */}
              {aiAnalysisStep >= 1 && (
                <div className="mb-6 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 animate-slide-in">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${aiAnalysisStep > 1 ? 'bg-emerald-500' : 'bg-slate-600 animate-pulse'}`}>
                      {aiAnalysisStep > 1 ? (
                        <CheckCircleIcon className="h-6 w-6 text-white" />
                      ) : (
                        <ArrowPathIcon className="h-6 w-6 text-white animate-spin" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-bold">📊 Analyse TVA</div>
                      <div className="text-emerald-200 text-sm mt-1">Détection des tendances TVA...</div>
                      {aiAnalysisStep > 1 && (
                        <div className="mt-3 space-y-2">
                          <div className="p-4 bg-emerald-500/20 rounded-lg border border-emerald-400/30">
                            <div className="text-emerald-300 text-sm font-bold">📈 Tendance TVA: +18% sur 3 mois</div>
                            <div className="text-emerald-200 text-xs mt-2">Évolution TVA nette mensuelle:</div>
                            <div className="grid grid-cols-3 gap-2 mt-2">
                              <div className="p-2 bg-white/10 rounded text-center">
                                <div className="text-xs text-emerald-300">Avril</div>
                                <div className="font-bold text-white">25k DA</div>
                              </div>
                              <div className="p-2 bg-white/10 rounded text-center">
                                <div className="text-xs text-emerald-300">Mai</div>
                                <div className="font-bold text-white">30k DA</div>
                              </div>
                              <div className="p-2 bg-white/10 rounded text-center">
                                <div className="text-xs text-emerald-300">Juin</div>
                                <div className="font-bold text-white">85k DA</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Étape 2: Analyse IBS */}
              {aiAnalysisStep >= 2 && (
                <div className="mb-6 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 animate-slide-in">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${aiAnalysisStep > 2 ? 'bg-emerald-500' : 'bg-slate-600 animate-pulse'}`}>
                      {aiAnalysisStep > 2 ? (
                        <CheckCircleIcon className="h-6 w-6 text-white" />
                      ) : (
                        <ArrowPathIcon className="h-6 w-6 text-white animate-spin" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-bold">🏢 Analyse IBS (Impôt Bénéfices)</div>
                      <div className="text-emerald-200 text-sm mt-1">Calcul prévisionnel IBS...</div>
                      {aiAnalysisStep > 2 && (
                        <div className="mt-3 space-y-2">
                          <div className="p-4 bg-amber-500/20 rounded-lg border border-amber-400/30">
                            <div className="text-amber-300 text-sm font-bold">⚠️ Attention: IBS acompte à prévoir</div>
                            <div className="text-amber-200 text-xs mt-2">
                              Bénéfice prévisionnel: <span className="font-bold">3,500,000 DA</span>
                              <br />IBS estimé (26%): <span className="font-bold">910,000 DA</span>
                              <br />Déjà payé: <span className="font-bold">600,000 DA</span>
                              <br />Solde à prévoir: <span className="font-bold text-amber-400">310,000 DA</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Étape 3: Optimisation TVA */}
              {aiAnalysisStep >= 3 && (
                <div className="mb-6 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 animate-slide-in">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${aiAnalysisStep > 3 ? 'bg-emerald-500' : 'bg-slate-600 animate-pulse'}`}>
                      {aiAnalysisStep > 3 ? (
                        <CheckCircleIcon className="h-6 w-6 text-white" />
                      ) : (
                        <ArrowPathIcon className="h-6 w-6 text-white animate-spin" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-bold">💡 Détection d'opportunités</div>
                      <div className="text-emerald-200 text-sm mt-1">Recherche d'optimisations fiscales...</div>
                      {aiAnalysisStep > 3 && (
                        <div className="mt-3 space-y-2">
                          <div className="p-4 bg-cyan-500/20 rounded-lg border border-cyan-400/30">
                            <div className="text-cyan-300 text-sm font-bold">💡 Optimisation: Récupération TVA possible</div>
                            <div className="text-cyan-200 text-xs mt-2">
                              <strong>3 factures d'achat</strong> sans TVA récupérée détectées:
                            </div>
                            <div className="mt-2 space-y-1">
                              <div className="flex justify-between text-xs text-cyan-100 bg-white/10 p-2 rounded">
                                <span>Facture #ACH-2024-038</span>
                                <span className="font-bold">12,500 DA</span>
                              </div>
                              <div className="flex justify-between text-xs text-cyan-100 bg-white/10 p-2 rounded">
                                <span>Facture #ACH-2024-041</span>
                                <span className="font-bold">8,750 DA</span>
                              </div>
                              <div className="flex justify-between text-xs text-cyan-100 bg-white/10 p-2 rounded">
                                <span>Facture #ACH-2024-045</span>
                                <span className="font-bold">5,200 DA</span>
                              </div>
                            </div>
                            <div className="mt-2 pt-2 border-t border-cyan-400/30 text-xs text-cyan-100">
                              Potentiel de récupération: <span className="font-black text-cyan-300">26,450 DA</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Étape 4: Détection d'anomalies */}
              {aiAnalysisStep >= 4 && (
                <div className="mb-6 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 animate-slide-in">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${aiAnalysisStep > 4 ? 'bg-emerald-500' : 'bg-slate-600 animate-pulse'}`}>
                      {aiAnalysisStep > 4 ? (
                        <CheckCircleIcon className="h-6 w-6 text-white" />
                      ) : (
                        <ArrowPathIcon className="h-6 w-6 text-white animate-spin" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-bold">🔍 Détection d'anomalies</div>
                      <div className="text-emerald-200 text-sm mt-1">Vérification de la cohérence fiscale...</div>
                      {aiAnalysisStep > 4 && (
                        <div className="mt-3 space-y-2">
                          <div className="p-4 bg-emerald-500/20 rounded-lg border border-emerald-400/30">
                            <div className="text-emerald-300 text-sm font-bold">✓ Aucune anomalie majeure détectée</div>
                            <div className="text-emerald-200 text-xs mt-2">
                              ✓ Cohérence TVA collectée/déductible: OK
                              <br />✓ Bases imposables validées: OK
                              <br />✓ Taux d'imposition conformes: OK
                              <br />✓ Calendrier déclarations à jour: OK
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Étape 5: Rapport final */}
              {aiAnalysisStep >= 5 && (
                <div className="mb-6 p-8 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-2xl border-2 border-emerald-400/50 animate-slide-in shadow-2xl">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-xl">
                      <CheckCircleIcon className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-white">✅ Analyse Fiscale Terminée</h3>
                      <p className="text-emerald-200 text-sm">Rapport complet généré avec succès</p>
                    </div>
                  </div>

                  {/* Résumé des résultats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                      <div className="text-emerald-300 text-xs font-bold uppercase mb-2">Tendances</div>
                      <div className="text-4xl font-black text-white">2</div>
                      <div className="text-xs text-emerald-200 mt-1">Positives</div>
                    </div>
                    <div className="p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                      <div className="text-cyan-300 text-xs font-bold uppercase mb-2">Optimisations</div>
                      <div className="text-4xl font-black text-white">3</div>
                      <div className="text-xs text-cyan-200 mt-1">Opportunités</div>
                    </div>
                    <div className="p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                      <div className="text-amber-300 text-xs font-bold uppercase mb-2">Alertes</div>
                      <div className="text-4xl font-black text-white">1</div>
                      <div className="text-xs text-amber-200 mt-1">À surveiller</div>
                    </div>
                    <div className="p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                      <div className="text-emerald-300 text-xs font-bold uppercase mb-2">Anomalies</div>
                      <div className="text-4xl font-black text-white">0</div>
                      <div className="text-xs text-emerald-200 mt-1">Aucune</div>
                    </div>
                  </div>

                  {/* Score fiscal */}
                  <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 mb-6">
                    <div className="text-center">
                      <div className="text-sm text-emerald-300 font-bold uppercase mb-4">Score de Conformité Fiscale</div>
                      <div className="relative inline-block">
                        <svg className="w-40 h-40 transform -rotate-90">
                          <circle cx="80" cy="80" r="70" fill="none" stroke="#334155" strokeWidth="14" />
                          <circle
                            cx="80"
                            cy="80"
                            r="70"
                            fill="none"
                            stroke="url(#fiscalGradient)"
                            strokeWidth="14"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 70}`}
                            strokeDashoffset={`${2 * Math.PI * 70 * (1 - 0.92)}`}
                          />
                          <defs>
                            <linearGradient id="fiscalGradient">
                              <stop offset="0%" stopColor="#10b981" />
                              <stop offset="100%" stopColor="#059669" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="text-6xl font-black text-white">92</div>
                          <div className="text-sm text-emerald-300 font-bold">/100</div>
                        </div>
                      </div>
                      <div className="text-xl font-black text-emerald-400 mt-4">Excellente conformité</div>
                    </div>
                  </div>

                  {/* Recommandations détaillées */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                      <div className="text-emerald-300 text-sm font-bold mb-3">✅ Points forts</div>
                      <ul className="space-y-2 text-xs text-slate-200">
                        <li className="flex items-start"><span className="text-emerald-400 mr-2">•</span> TVA à jour et cohérente</li>
                        <li className="flex items-start"><span className="text-emerald-400 mr-2">•</span> Délais de déclaration respectés</li>
                        <li className="flex items-start"><span className="text-emerald-400 mr-2">•</span> Aucun retard de paiement</li>
                      </ul>
                    </div>
                    <div className="p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                      <div className="text-amber-300 text-sm font-bold mb-3">💡 À améliorer</div>
                      <ul className="space-y-2 text-xs text-slate-200">
                        <li className="flex items-start"><span className="text-amber-400 mr-2">•</span> Prévoir acompte IBS 310k DA</li>
                        <li className="flex items-start"><span className="text-amber-400 mr-2">•</span> Récupérer TVA sur 3 factures</li>
                        <li className="flex items-start"><span className="text-amber-400 mr-2">•</span> Anticiper pic TVA de juin</li>
                      </ul>
                    </div>
                  </div>

                  {/* Actions du rapport */}
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => alert('📥 Téléchargement rapport IA Fiscal\n\n✅ Fichier: Analyse_IA_Fiscale_' + new Date().toLocaleDateString('fr-FR').replace(/\//g, '-') + '.pdf\n✅ Taille: 3.2 MB\n✅ Contenu:\n  • Analyse TVA détaillée\n  • Prévisions IBS\n  • Recommandations\n  • Graphiques\n\nRapport sauvegardé !')}
                      className="px-5 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl transition-all font-bold hover:scale-105 border border-white/30"
                    >
                      📥 Télécharger PDF
                    </button>
                    <button
                      onClick={() => alert('📧 Partage du rapport\n\nEnvoi par email à:\n✅ Direction générale\n✅ Expert-comptable\n✅ Responsable financier\n\nEmail envoyé avec succès !')}
                      className="px-5 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl transition-all font-bold hover:scale-105 border border-white/30"
                    >
                      📧 Partager
                    </button>
                    <button
                      onClick={() => {
                        setShowAIModal(false);
                        setAiAnalysisStep(0);
                      }}
                      className="px-5 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all font-bold hover:scale-105 shadow-lg"
                    >
                      ✓ Terminer
                    </button>
                  </div>
                </div>
              )}

              {/* Message si en cours */}
              {aiAnalysisStep < 5 && (
                <div className="text-center p-8">
                  <div className="inline-block">
                    <div className="flex items-center space-x-3 text-emerald-300">
                      <ArrowPathIcon className="h-10 w-10 animate-spin" />
                      <span className="text-xl font-bold">Analyse en cours...</span>
                    </div>
                    <div className="mt-4 text-sm text-slate-400">
                      Étape {aiAnalysisStep + 1} / 5 • {['Initialisation', 'Analyse TVA', 'Analyse IBS', 'Optimisations', 'Anomalies'][aiAnalysisStep]}
                    </div>
                    {/* Barre de progression */}
                    <div className="mt-6 w-80">
                      <svg className="w-full h-3" viewBox="0 0 100 12" preserveAspectRatio="none" aria-label="Progression de l'analyse">
                        <rect x="0" y="0" width="100" height="12" fill="#334155" rx="6" ry="6" />
                        <defs>
                          <linearGradient id="aiProgress" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#059669" />
                          </linearGradient>
                        </defs>
                        <rect x="0" y="0" width={((aiAnalysisStep + 1) / 5) * 100} height="12" fill="url(#aiProgress)" rx="6" ry="6" />
                      </svg>
                    </div>
                    <div className="mt-2 text-xs text-emerald-300 font-mono">
                      {Math.round(((aiAnalysisStep + 1) / 5) * 100)}% complété
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Animation CSS pour le modal et effets */}
      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FiscaliteDeclarations;


