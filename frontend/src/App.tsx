import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/Effects/ErrorBoundary';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import VueTempsReel from './pages/dashboard/VueTempsReel';
import AnalyticsAvancees from './pages/dashboard/AnalyticsAvancees';
import RapportsPersonnalises from './pages/dashboard/RapportsPersonnalises';
import VueEnsemble from './pages/dashboard/VueEnsemble';
import DashboardAdaptatif from './pages/dashboard/DashboardAdaptatif';
import BoutiqueDashboard from './pages/dashboard/BoutiqueDashboard';
import GraphiquesInteractifs from './pages/dashboard/GraphiquesInteractifs';
import AlertesIntelligentes from './pages/dashboard/AlertesIntelligentes';
import CalendrierRappels from './pages/dashboard/CalendrierRappels';
import TableauBordPersonnalisable from './pages/dashboard/TableauBordPersonnalisable';
import GestionComptable from './pages/accounting/GestionComptable';
import Clients from './pages/crm/Clients';
import Fournisseurs from './pages/crm/Fournisseurs';
import Articles from './pages/inventory/Articles';
import Inventaire from './pages/inventory/Inventaire';
import FacturesVente from './pages/sales/FacturesVente';
import AnalyticsFacturation from './pages/analytics/AnalyticsFacturation';
import SuiviLivraisons from './pages/inventory/SuiviLivraisons';
import GestionPaiementsClients from './pages/sales/GestionPaiementsClients';
import ConfigurationAvancee from './pages/settings/ConfigurationAvancee';
import MobileFeatures from './pages/MobileFeatures';
import Integrations from './pages/settings/Integrations';
import Audit from './pages/analytics/Audit';
import GroupesClients from './pages/crm/GroupesClients';
import Statistiques from './pages/analytics/Statistiques';
import TableauBordFinancier from './pages/dashboard/TableauBordFinancier';
import IndicateursPerformance from './pages/analytics/IndicateursPerformance';
import Parametres from './pages/settings/Parametres';
import RapportsAnalytics from './pages/analytics/RapportsAnalytics';
import RapportsComptables from './pages/accounting/RapportsComptables';
import ChatbotLIA from './pages/ai/ChatbotLIA';
import AnalysesLIA from './pages/ai/AnalysesLIA';
import EntrainementModeleIA from './pages/ai/EntrainementModeleIA';
import VentesClients from './pages/analytics/rapports/VentesClients';
import AchatsFournisseurs from './pages/analytics/rapports/AchatsFournisseurs';
import StocksProduits from './pages/analytics/rapports/StocksProduits';
import TresorerieBanque from './pages/analytics/rapports/TresorerieBanque';
import ComptabiliteResultats from './pages/analytics/rapports/ComptabiliteResultats';
import FiscaliteDeclarations from './pages/analytics/rapports/FiscaliteDeclarations';
import PersonnalisesComparatifs from './pages/analytics/rapports/PersonnalisesComparatifs';
import GestionUtilisateurs from './pages/settings/GestionUtilisateurs';
import DocumentsFiscaux from './pages/accounting/DocumentsFiscaux';
import GestionAcces from './pages/settings/GestionAcces';
import AdminRoleManagement from './pages/admin/AdminRoleManagement';
import Paie from './pages/hr/Paie';
const BudgetPage = React.lazy(() => import('./pages/analytics/Budget'));
const RapprochementBancairePage = React.lazy(() => import('./pages/accounting/RapprochementBancaire'));
import JournauxEcritures from './pages/accounting/comptabilite/JournauxEcritures';
import EtatsRapports from './pages/accounting/comptabilite/EtatsRapports';
import TemplatesDocuments from './pages/accounting/comptabilite/TemplatesDocuments';
import ConsolidationCompta from './pages/accounting/comptabilite/Consolidation';
import GestionEntreprises from './pages/accounting/comptabilite/GestionEntreprises';
import UtilisateursAcces from './pages/accounting/comptabilite/UtilisateursAcces';
import TestBoutique from './pages/sales/TestBoutique';
import VentesClientsBoutique from './pages/analytics/rapports/VentesClients';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/dashboard" element={<DashboardAdaptatif />} />
              <Route path="/dashboard/boutique" element={<BoutiqueDashboard />} />
              <Route path="/dashboard/vue-ensemble" element={<VueEnsemble />} />
              {/* Removed duplicate tableau-bord route, as it points to the same component as vue-ensemble. If both are needed, consider using a redirect instead. */}
              <Route path="/dashboard/graphiques" element={<GraphiquesInteractifs />} />
              <Route path="/dashboard/alertes" element={<AlertesIntelligentes />} />
              <Route path="/dashboard/calendrier" element={<CalendrierRappels />} />
              <Route path="/dashboard/temps-reel" element={<VueTempsReel />} />
              <Route path="/dashboard/analytics" element={<AnalyticsAvancees />} />
              <Route path="/dashboard/rapports" element={<RapportsPersonnalises />} />
              <Route path="/dashboard/personnalisable" element={<TableauBordPersonnalisable />} />
              <Route path="/gestion-comptable" element={<ProtectedRoute requiredPermission="comptabilite-read"><GestionComptable /></ProtectedRoute>} />
              <Route path="/clients" element={<ProtectedRoute requiredPermission="clients-manage"><Clients /></ProtectedRoute>} />
              <Route path="/fournisseurs" element={<ProtectedRoute requiredPermission="fournisseurs-manage"><Fournisseurs /></ProtectedRoute>} />
              <Route path="/factures" element={<ProtectedRoute requiredPermission="facturation-read"><FacturesVente /></ProtectedRoute>} />
              {/* Removed duplicate factures-vente route, as it points to the same component as factures. If both are needed, consider using a redirect instead. */}
                <Route path="/analytics-facturation" element={<ProtectedRoute requiredPermission="facturation-read"><AnalyticsFacturation /></ProtectedRoute>} />
                <Route path="/suivi-livraisons" element={<ProtectedRoute requiredPermission="stocks-read"><SuiviLivraisons /></ProtectedRoute>} />
                <Route path="/gestion-paiements-clients" element={<ProtectedRoute requiredPermission="facturation-read"><GestionPaiementsClients /></ProtectedRoute>} />
              <Route path="/articles" element={<ProtectedRoute requiredPermission="articles-manage"><Articles /></ProtectedRoute>} />
              <Route path="/inventaire" element={<ProtectedRoute requiredPermission="stocks-read"><Inventaire /></ProtectedRoute>} />
              <Route path="/configuration-avancee" element={<ProtectedRoute requiredRole="admin"><ConfigurationAvancee /></ProtectedRoute>} />
              <Route path="/integrations" element={<ProtectedRoute requiredRole="admin"><Integrations /></ProtectedRoute>} />
              <Route path="/audit" element={<ProtectedRoute requiredPermission="audit-read"><Audit /></ProtectedRoute>} />
              <Route path="/groupes-clients" element={<ProtectedRoute requiredPermission="clients-manage"><GroupesClients /></ProtectedRoute>} />
              <Route path="/lia/chatbot" element={<ProtectedRoute requiredPermission="lia-access"><ChatbotLIA /></ProtectedRoute>} />
              <Route path="/lia/analyses" element={<ProtectedRoute requiredPermission="lia-access"><AnalysesLIA /></ProtectedRoute>} />
              <Route path="/entrainement-modele-ia" element={<ProtectedRoute requiredPermission="lia-train"><EntrainementModeleIA /></ProtectedRoute>} />
              <Route path="/rapports/ventes-clients" element={<ProtectedRoute requiredPermission="rapports-basic"><VentesClients /></ProtectedRoute>} />
              <Route path="/rapports/achats-fournisseurs" element={<ProtectedRoute requiredPermission="rapports-basic"><AchatsFournisseurs /></ProtectedRoute>} />
              <Route path="/rapports/stocks-produits" element={<ProtectedRoute requiredPermission="rapports-basic"><StocksProduits /></ProtectedRoute>} />
              <Route path="/rapports/tresorerie-banque" element={<ProtectedRoute requiredPermission="rapports-basic"><TresorerieBanque /></ProtectedRoute>} />
              <Route path="/rapports/comptabilite-resultats" element={<ProtectedRoute requiredPermission="rapports-basic"><ComptabiliteResultats /></ProtectedRoute>} />
              <Route path="/rapports/fiscalite-declarations" element={<ProtectedRoute requiredPermission="rapports-basic"><FiscaliteDeclarations /></ProtectedRoute>} />
              <Route path="/rapports/personnalises-comparatifs" element={<ProtectedRoute requiredPermission="rapports-advanced"><PersonnalisesComparatifs /></ProtectedRoute>} />
                <Route path="/documents-fiscaux" element={<ProtectedRoute requiredPermission="rapports-basic"><DocumentsFiscaux /></ProtectedRoute>} />
              <Route path="/rapports-analytics" element={<ProtectedRoute requiredPermission="rapports-basic"><RapportsAnalytics /></ProtectedRoute>} />
              <Route path="/rapports-comptables" element={<ProtectedRoute requiredPermission="rapports-basic"><RapportsComptables /></ProtectedRoute>} />
              <Route path="/comptabilite/journaux" element={<ProtectedRoute requiredPermission="comptabilite-read"><JournauxEcritures /></ProtectedRoute>} />
              <Route path="/comptabilite/etats" element={<ProtectedRoute requiredPermission="comptabilite-read"><EtatsRapports /></ProtectedRoute>} />
              <Route path="/template-document" element={<ProtectedRoute requiredPermission="comptabilite-write"><TemplatesDocuments /></ProtectedRoute>} />
              <Route path="/consolidation" element={<ProtectedRoute requiredPermission="comptabilite-validate"><ConsolidationCompta /></ProtectedRoute>} />
              <Route path="/gestion-entreprise" element={<ProtectedRoute requiredRole="admin"><GestionEntreprises /></ProtectedRoute>} />
              <Route path="/gestion-utilisateurs-acces" element={<ProtectedRoute requiredRole="admin"><UtilisateursAcces /></ProtectedRoute>} />
              <Route path="/gestion-utilisateurs" element={<ProtectedRoute requiredRole="admin"><GestionUtilisateurs /></ProtectedRoute>} />
              <Route path="/gestion-acces" element={<ProtectedRoute requiredRole="admin"><GestionAcces /></ProtectedRoute>} />
              <Route path="/gestion-acces-avancee" element={<ProtectedRoute requiredRole="admin"><AdminRoleManagement /></ProtectedRoute>} />
              {/* Removed duplicate admin/roles route, as it points to the same component as gestion-acces-avancee. If both are needed, consider using a redirect instead. */}
              <Route path="/paie" element={<ProtectedRoute requiredPermission="paie-read"><Paie /></ProtectedRoute>} />
              <Route path="/budget" element={<Suspense fallback={<div>Loading...</div>}><BudgetPage /></Suspense>} />
              <Route path="/rapprochement-bancaire" element={<Suspense fallback={<div>Loading...</div>}><RapprochementBancairePage /></Suspense>} />
              <Route path="/parametres" element={<Parametres />} />
              {/* Fallback nested redirect to dashboard for unknown paths */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        } />
        <Route path="/test-boutique" element={<TestBoutique />} />
        <Route path="/ventes-clients-boutique" element={<VentesClientsBoutique />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;