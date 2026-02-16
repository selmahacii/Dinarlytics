import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './shared/components/Effects/ErrorBoundary';
import Layout from './core/layout/Layout';
import Login from '@features/auth/pages/Login';
import { ProtectedRoute } from '@shared/components/ProtectedRoute';

// Dashboard Components (Mapped from shared/components)
import RealisticDashboard from '@shared/components/Dashboard/RealisticDashboard';
import AnalyticsAvancees from '@features/dashboard/pages/AnalyticsAvancees';

// Operations Components
import Clients from '@/pages/crm/Clients';
import Fournisseurs from '@/pages/crm/Fournisseurs';
import Articles from '@/pages/inventory/Articles';
import Inventaire from '@/pages/inventory/Inventaire';
import GestionPaiementsClients from '@features/operations/pages/GestionPaiementsClients';

// Finance Components
import AnalyticsFacturation from '@/pages/analytics/AnalyticsFacturation';
import RapportsComptables from '@/pages/accounting/RapportsComptables';
import DocumentsFiscaux from '@/pages/accounting/DocumentsFiscaux';
import Fiscalite from '@/pages/accounting/Fiscalite';
import ConsolidationCompta from '@/pages/accounting/Consolidation';
import TemplatesDocuments from '@/pages/accounting/comptabilite/TemplatesDocuments';
import Statistiques from '@/pages/analytics/Statistiques';
import VentesClients from '@/pages/analytics/rapports/VentesClients';
import AchatsFournisseurs from '@/pages/analytics/rapports/AchatsFournisseurs';
import StocksProduits from '@/pages/analytics/rapports/StocksProduits';
import TresorerieBanque from '@/pages/analytics/rapports/TresorerieBanque';
import ComptabiliteResultats from '@/pages/analytics/rapports/ComptabiliteResultats';
import FiscaliteDeclarations from '@/pages/analytics/rapports/FiscaliteDeclarations';
import PersonnalisesComparatifs from '@/pages/analytics/rapports/PersonnalisesComparatifs';
import Audit from '@/pages/analytics/Audit';

// AI
import ChatbotLIA from '@features/ai/pages/ChatbotLIA';

// System & Admin
import GestionUtilisateurs from '@/pages/settings/GestionUtilisateurs';
import AdminRoleManagement from '@/pages/admin/AdminRoleManagement';
import Parametres from '@/pages/settings/Parametres';
import ConfigurationAvancee from '@/pages/settings/ConfigurationAvancee';
import Integrations from '@/pages/settings/Integrations';

// Lazy Loaded
const BudgetPage = React.lazy(() => import('@/pages/analytics/Budget'));
const RapprochementBancairePage = React.lazy(() => import('@/pages/accounting/RapprochementBancaire'));

import { useRealtime } from '@shared/hooks/useRealtime';

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
                  <Route path="/dashboard" element={<RealisticDashboard isVisible={true} />} />
                  <Route path="/dashboard/temps-reel" element={<RealisticDashboard isVisible={true} />} />
                  <Route path="/dashboard/analytics" element={<AnalyticsAvancees />} />

                  {/* Commercial */}
                  <Route path="/clients" element={<ProtectedRoute requiredPermission="clients-manage"><Clients /></ProtectedRoute>} />
                  <Route path="/fournisseurs" element={<ProtectedRoute requiredPermission="fournisseurs-manage"><Fournisseurs /></ProtectedRoute>} />
                  <Route path="/articles" element={<ProtectedRoute requiredPermission="articles-manage"><Articles /></ProtectedRoute>} />
                  <Route path="/inventaire" element={<ProtectedRoute requiredPermission="stocks-read"><Inventaire /></ProtectedRoute>} />

                  {/* Sales */}
                  <Route path="/factures-vente" element={<ProtectedRoute requiredPermission="facturation-read"><AnalyticsFacturation /></ProtectedRoute>} />
                  <Route path="/analytics-facturation" element={<ProtectedRoute requiredPermission="facturation-read"><AnalyticsFacturation /></ProtectedRoute>} />
                  <Route path="/gestion-paiements-clients" element={<ProtectedRoute requiredPermission="facturation-read"><GestionPaiementsClients /></ProtectedRoute>} />

                  {/* Accounting */}
                  <Route path="/comptabilite/etats" element={<ProtectedRoute requiredPermission="comptabilite-read"><RapportsComptables /></ProtectedRoute>} />
                  <Route path="/comptabilite/balance" element={<ProtectedRoute requiredPermission="comptabilite-read"><RapportsComptables /></ProtectedRoute>} />
                  <Route path="/fiscalite" element={<ProtectedRoute requiredPermission="comptabilite-read"><Fiscalite /></ProtectedRoute>} />
                  <Route path="/consolidation" element={<ProtectedRoute requiredPermission="comptabilite-validate"><ConsolidationCompta /></ProtectedRoute>} />
                  <Route path="/template-document" element={<ProtectedRoute requiredPermission="comptabilite-write"><TemplatesDocuments /></ProtectedRoute>} />
                  <Route path="/documents-fiscaux" element={<ProtectedRoute requiredPermission="rapports-basic"><DocumentsFiscaux /></ProtectedRoute>} />

                  {/* AI & Audit */}
                  <Route path="/lia/chatbot" element={<ProtectedRoute requiredPermission="lia-access"><ChatbotLIA /></ProtectedRoute>} />
                  {/* Mapped AnalysesLIA to Statistiques if missing */}
                  <Route path="/lia/analyses" element={<ProtectedRoute requiredPermission="lia-access"><Statistiques /></ProtectedRoute>} />
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
