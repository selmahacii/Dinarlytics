import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './shared/components/Effects/ErrorBoundary';
import Layout from './core/layout/Layout';
import Login from './pages/Login';
import { ProtectedRoute } from './core/ProtectedRoute';

// Dashboard
import DashboardAdaptatif from './features/dashboard/pages/DashboardAdaptatif';
import VueTempsReel from './features/dashboard/pages/VueTempsReel';
import AnalyticsAvancees from './features/dashboard/pages/AnalyticsAvancees';
import GraphiquesInteractifs from './features/dashboard/pages/GraphiquesInteractifs';
import AlertesIntelligentes from './features/dashboard/pages/AlertesIntelligentes';
import CalendrierRappels from './features/dashboard/pages/CalendrierRappels';
import TableauBordPersonnalisable from './features/dashboard/pages/TableauBordPersonnalisable';

// Operations (Commercial, CRM, Inventory, Sales)
import Clients from './features/operations/pages/Clients';
import Fournisseurs from './features/operations/pages/Fournisseurs';
import Articles from './features/operations/pages/Articles';
import Inventaire from './features/operations/pages/Inventaire';
import FacturesVente from './features/operations/pages/FacturesVente';
import GestionPaiementsClients from './features/operations/pages/GestionPaiementsClients';

// Finance (Accounting & Analytics)
import AnalyticsFacturation from './features/finance/pages/AnalyticsFacturation';
import RapportsComptables from './features/finance/pages/RapportsComptables';
import DocumentsFiscaux from './features/finance/pages/DocumentsFiscaux';
import Fiscalite from './features/finance/pages/Fiscalite';
import ConsolidationCompta from './features/finance/pages/Consolidation';
import TemplatesDocuments from './features/finance/pages/TemplatesDocuments';
import Statistiques from './features/finance/pages/Statistiques';
import VentesClients from './features/finance/pages/VentesClients';
import AchatsFournisseurs from './features/finance/pages/AchatsFournisseurs';
import StocksProduits from './features/finance/pages/StocksProduits';
import TresorerieBanque from './features/finance/pages/TresorerieBanque';
import ComptabiliteResultats from './features/finance/pages/ComptabiliteResultats';
import FiscaliteDeclarations from './features/finance/pages/FiscaliteDeclarations';
import PersonnalisesComparatifs from './features/finance/pages/PersonnalisesComparatifs';
import Audit from './features/finance/pages/Audit';

// AI
import ChatbotLIA from './features/ai/pages/ChatbotLIA';
import AnalysesLIA from './features/ai/pages/AnalysesLIA';
import EntrainementModeleIA from './features/ai/pages/EntrainementModeleIA';

// System & Admin
import GestionUtilisateurs from './features/system/pages/GestionUtilisateurs';
import AdminRoleManagement from './features/system/pages/AdminRoleManagement';
import Parametres from './features/system/pages/Parametres';
import ConfigurationAvancee from './features/system/pages/ConfigurationAvancee';
import Integrations from './features/system/pages/Integrations';

const BudgetPage = React.lazy(() => import('./features/finance/pages/Budget'));
const RapprochementBancairePage = React.lazy(() => import('./features/finance/pages/RapprochementBancaire'));

import { useRealtime } from './shared/hooks/useRealtime';

function App() {
  useRealtime();

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/*" element={
            <Layout>
              <Suspense fallback={<div className="p-8 text-center">Chargement du module...</div>}>
                <Routes>
                  {/* Dashboard */}
                  <Route path="/dashboard" element={<DashboardAdaptatif />} />
                  <Route path="/dashboard/temps-reel" element={<VueTempsReel />} />
                  <Route path="/dashboard/analytics" element={<AnalyticsAvancees />} />
                  <Route path="/dashboard/alertes" element={<AlertesIntelligentes />} />
                  <Route path="/dashboard/calendrier" element={<CalendrierRappels />} />
                  <Route path="/dashboard/personnalisable" element={<TableauBordPersonnalisable />} />

                  {/* Commercial */}
                  <Route path="/clients" element={<ProtectedRoute requiredPermission="clients-manage"><Clients /></ProtectedRoute>} />
                  <Route path="/fournisseurs" element={<ProtectedRoute requiredPermission="fournisseurs-manage"><Fournisseurs /></ProtectedRoute>} />
                  <Route path="/articles" element={<ProtectedRoute requiredPermission="articles-manage"><Articles /></ProtectedRoute>} />
                  <Route path="/inventaire" element={<ProtectedRoute requiredPermission="stocks-read"><Inventaire /></ProtectedRoute>} />

                  {/* Sales */}
                  <Route path="/factures-vente" element={<ProtectedRoute requiredPermission="facturation-read"><FacturesVente /></ProtectedRoute>} />
                  <Route path="/analytics-facturation" element={<ProtectedRoute requiredPermission="facturation-read"><AnalyticsFacturation /></ProtectedRoute>} />
                  <Route path="/gestion-paiements-clients" element={<ProtectedRoute requiredPermission="facturation-read"><GestionPaiementsClients /></ProtectedRoute>} />

                  {/* Accounting */}
                  <Route path="/comptabilite/balance" element={<ProtectedRoute requiredPermission="comptabilite-read"><RapportsComptables /></ProtectedRoute>} />
                  <Route path="/fiscalite" element={<ProtectedRoute requiredPermission="comptabilite-read"><Fiscalite /></ProtectedRoute>} />
                  <Route path="/consolidation" element={<ProtectedRoute requiredPermission="comptabilite-validate"><ConsolidationCompta /></ProtectedRoute>} />
                  <Route path="/template-document" element={<ProtectedRoute requiredPermission="comptabilite-write"><TemplatesDocuments /></ProtectedRoute>} />
                  <Route path="/documents-fiscaux" element={<ProtectedRoute requiredPermission="rapports-basic"><DocumentsFiscaux /></ProtectedRoute>} />

                  {/* AI & Audit */}
                  <Route path="/lia/chatbot" element={<ProtectedRoute requiredPermission="lia-access"><ChatbotLIA /></ProtectedRoute>} />
                  <Route path="/lia/analyses" element={<ProtectedRoute requiredPermission="lia-access"><AnalysesLIA /></ProtectedRoute>} />
                  <Route path="/entrainement-modele-ia" element={<ProtectedRoute requiredPermission="lia-train"><EntrainementModeleIA /></ProtectedRoute>} />
                  <Route path="/audit-explorer" element={<ProtectedRoute requiredPermission="audit-read"><Audit /></ProtectedRoute>} />
                  <Route path="/statistiques" element={<ProtectedRoute requiredPermission="rapports-basic"><Statistiques /></ProtectedRoute>} />

                  {/* Reports */}
                  <Route path="/rapports/ventes-clients" element={<ProtectedRoute requiredPermission="rapports-basic"><VentesClients /></ProtectedRoute>} />
                  <Route path="/rapports/achats-fournisseurs" element={<ProtectedRoute requiredPermission="rapports-basic"><AchatsFournisseurs /></ProtectedRoute>} />
                  <Route path="/rapports/stocks-produits" element={<ProtectedRoute requiredPermission="rapports-basic"><StocksProduits /></ProtectedRoute>} />
                  <Route path="/rapports/tresorerie-banque" element={<ProtectedRoute requiredPermission="rapports-basic"><TresorerieBanque /></ProtectedRoute>} />

                  {/* Settings & Admin */}
                  <Route path="/gestion-utilisateurs-acces" element={<ProtectedRoute requiredPermission="manage_users"><AdminRoleManagement /></ProtectedRoute>} />
                  <Route path="/parametres" element={<Parametres />} />
                  <Route path="/configuration-avancee" element={<ProtectedRoute requiredRole="admin"><ConfigurationAvancee /></ProtectedRoute>} />
                  <Route path="/integrations" element={<ProtectedRoute requiredRole="admin"><Integrations /></ProtectedRoute>} />


                  {/* Lazy Loaded */}
                  <Route path="/budget" element={<BudgetPage />} />
                  <Route path="/rapprochement-bancaire" element={<RapprochementBancairePage />} />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Suspense>
            </Layout>
          } />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;