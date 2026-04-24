import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './shared/components/Effects/ErrorBoundary';
import Layout from './core/layout/Layout';
import Login from '@features/auth/pages/Login';
import { ProtectedRoute } from '@shared/components/ProtectedRoute';
import { CSRFTokenService } from '@security/csrfToken';

// Dashboard Components (Refactored!)
import DashboardRefactore from '@features/dashboard/pages/DashboardRefactore';
// Deprecated: import RealisticDashboard from '@shared/components/Dashboard/RealisticDashboard';
import AnalyticsAvancees from '@features/dashboard/pages/AnalyticsAvancees';

// Operations Components
import Clients from '@/pages/crm/Clients';
import Fournisseurs from '@/pages/crm/Fournisseurs';
import Devis from '@/pages/crm/Devis';
import GestionRelances from '@/pages/crm/GestionRelances';
import Articles from '@/pages/inventory/Articles';
import Inventaire from '@/pages/inventory/Inventaire';
import GestionPaiementsClients from '@features/operations/pages/GestionPaiementsClients';
import GestionRH from '@/pages/rh/GestionRH';
import BonCommande from '@/pages/achats/BonCommande';
import TableauAmortissements from '@/pages/accounting/TableauAmortissements';

import AnalyticsFacturation from '@/pages/analytics/AnalyticsFacturation';
import AnalyticsAchats from '@/pages/analytics/AnalyticsAchats';
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
import GestionEntreprise from '@/pages/settings/GestionEntreprise';
import GestionAcces from '@/pages/settings/GestionAcces';
import GestionAccesAvancee from '@/pages/settings/GestionAccesAvancee';

// Missing Routes Integration
import Tresorerie from '@/pages/accounting/Tresorerie';
import GroupesClients from '@/pages/crm/GroupesClients';
import SuiviLivraisons from '@/pages/inventory/SuiviLivraisons';
import RapportsAnalytics from '@/pages/analytics/RapportsAnalytics';
import AuditExplorer from '@features/system/pages/AuditExplorer';

// Lazy Loaded
const BudgetPage = React.lazy(() => import('@/pages/analytics/Budget'));
const RapprochementBancairePage = React.lazy(() => import('@/pages/accounting/RapprochementBancaire'));

import { useRealtime } from '@shared/hooks/useRealtime';

function App() {
  // ✅ Initialize CSRF token on app startup
  useEffect(() => {
    const initializeCSRF = async () => {
      try {
        const token = await CSRFTokenService.initialize();
        if (token) {
          console.log('✅ CSRF Token initialized successfully');
        } else {
          console.warn('⚠️ CSRF Token initialization returned null');
        }
      } catch (error) {
        console.error('❌ Failed to initialize CSRF token:', error);
      }
    };

    initializeCSRF();
  }, []);

  useRealtime();

  return (
    <ErrorBoundary>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/*" element={
            <Layout>
              <Suspense fallback={<div className="p-8 text-center">Chargement du module...</div>}>
                <Routes>
                  {/* Dashboard - Refactored Components */}
                  <Route path="/dashboard" element={<ProtectedRoute requiredPermission="dashboard-access"><DashboardRefactore isCollapsible /></ProtectedRoute>} />
                  <Route path="/dashboard/temps-reel" element={<ProtectedRoute requiredPermission="dashboard-access"><DashboardRefactore isCollapsible /></ProtectedRoute>} />
                  <Route path="/dashboard/analytics" element={<ProtectedRoute requiredPermission="rapports-basic"><AnalyticsAvancees /></ProtectedRoute>} />
                  <Route path="/dashboard/alertes" element={<ProtectedRoute requiredPermission="dashboard-alerts"><Audit /></ProtectedRoute>} />
                  <Route path="/dashboard/calendrier" element={<ProtectedRoute requiredPermission="dashboard-calendar"><Fiscalite /></ProtectedRoute>} />

                  {/* Commercial */}
                  <Route path="/clients" element={<ProtectedRoute requiredPermission="clients-manage"><Clients /></ProtectedRoute>} />
                  <Route path="/clients/groupes" element={<ProtectedRoute requiredPermission="clients-manage"><GroupesClients /></ProtectedRoute>} />
                  <Route path="/fournisseurs" element={<ProtectedRoute requiredPermission="fournisseurs-manage"><Fournisseurs /></ProtectedRoute>} />
                  <Route path="/devis" element={<ProtectedRoute requiredPermission="facturation-create"><Devis /></ProtectedRoute>} />
                  <Route path="/articles" element={<ProtectedRoute requiredPermission="articles-manage"><Articles /></ProtectedRoute>} />
                  <Route path="/inventaire" element={<ProtectedRoute requiredPermission="stocks-read"><Inventaire /></ProtectedRoute>} />
                  <Route path="/stocks/livraisons" element={<ProtectedRoute requiredPermission="stocks-read"><SuiviLivraisons /></ProtectedRoute>} />

                  {/* HR & Payroll */}
                  <Route path="/rh" element={<ProtectedRoute requiredPermission="paie-read"><GestionRH /></ProtectedRoute>} />

                  {/* Purchases & Suppliers */}
                  <Route path="/bons-commande" element={<ProtectedRoute requiredPermission="fournisseurs-manage"><BonCommande /></ProtectedRoute>} />

                  {/* Client Follow-Ups */}
                  <Route path="/relances-clients" element={<ProtectedRoute requiredPermission="facturation-read"><GestionRelances /></ProtectedRoute>} />

                  {/* Accounting: Depreciation & Valuation */}
                  <Route path="/amortissements" element={<ProtectedRoute requiredPermission="comptabilite-read"><TableauAmortissements /></ProtectedRoute>} />

                  {/* Sales & Purchases */}
                  <Route path="/factures-vente" element={<ProtectedRoute requiredPermission="facturation-read"><AnalyticsFacturation /></ProtectedRoute>} />
                  <Route path="/achats-charges" element={<ProtectedRoute requiredPermission="facturation-read"><AnalyticsAchats /></ProtectedRoute>} />
                  <Route path="/analytics-facturation" element={<ProtectedRoute requiredPermission="facturation-read"><AnalyticsFacturation /></ProtectedRoute>} />
                  <Route path="/gestion-paiements-clients" element={<ProtectedRoute requiredPermission="facturation-read"><GestionPaiementsClients /></ProtectedRoute>} />

                  {/* Accounting */}
                  <Route path="/comptabilite/etats" element={<ProtectedRoute requiredPermission="comptabilite-read"><RapportsComptables /></ProtectedRoute>} />
                  <Route path="/comptabilite/balance" element={<ProtectedRoute requiredPermission="comptabilite-read"><RapportsComptables /></ProtectedRoute>} />
                  <Route path="/comptabilite/tresorerie" element={<ProtectedRoute requiredPermission="comptabilite-read"><Tresorerie /></ProtectedRoute>} />
                  <Route path="/fiscalite" element={<ProtectedRoute requiredPermission="comptabilite-read"><Fiscalite /></ProtectedRoute>} />
                  <Route path="/consolidation" element={<ProtectedRoute requiredPermission={['comptabilite-read', 'comptabilite-validate']}><ConsolidationCompta /></ProtectedRoute>} />
                  <Route path="/template-document" element={<ProtectedRoute requiredPermission="comptabilite-write"><TemplatesDocuments /></ProtectedRoute>} />
                  <Route path="/documents-fiscaux" element={<ProtectedRoute requiredPermission="rapports-basic"><DocumentsFiscaux /></ProtectedRoute>} />

                  {/* AI & Audit */}
                  <Route path="/lia/chatbot" element={<ProtectedRoute requiredPermission="lia-access"><ChatbotLIA /></ProtectedRoute>} />
                  {/* Mapped AnalysesLIA to Statistiques if missing */}
                  <Route path="/lia/analyses" element={<ProtectedRoute requiredPermission="lia-access"><Statistiques /></ProtectedRoute>} />
                  <Route path="/audit-explorer" element={<ProtectedRoute requiredPermission="audit-read"><AuditExplorer /></ProtectedRoute>} />
                  <Route path="/statistiques" element={<ProtectedRoute requiredPermission="rapports-basic"><Statistiques /></ProtectedRoute>} />

                  {/* Reports */}
                  <Route path="/rapports/ventes-clients" element={<ProtectedRoute requiredPermission="rapports-basic"><VentesClients /></ProtectedRoute>} />
                  <Route path="/rapports/achats-fournisseurs" element={<ProtectedRoute requiredPermission="rapports-basic"><AchatsFournisseurs /></ProtectedRoute>} />
                  <Route path="/rapports/stocks-produits" element={<ProtectedRoute requiredPermission="rapports-basic"><StocksProduits /></ProtectedRoute>} />
                  <Route path="/rapports/tresorerie-banque" element={<ProtectedRoute requiredPermission="rapports-basic"><TresorerieBanque /></ProtectedRoute>} />
                  <Route path="/rapports/analytics" element={<ProtectedRoute requiredPermission="rapports-basic"><RapportsAnalytics /></ProtectedRoute>} />

                  {/* Settings & Admin */}
                  <Route path="/utilisateurs" element={<ProtectedRoute requiredPermission="admin-users"><GestionUtilisateurs /></ProtectedRoute>} />
                  <Route path="/gestion-utilisateurs-acces" element={<ProtectedRoute requiredPermission="admin-users"><AdminRoleManagement /></ProtectedRoute>} />
                  <Route path="/acces" element={<ProtectedRoute requiredPermission="admin-users"><GestionAcces /></ProtectedRoute>} />
                  <Route path="/acces-avance" element={<ProtectedRoute requiredPermission="admin-users"><GestionAccesAvancee /></ProtectedRoute>} />
                  <Route path="/parametres" element={<ProtectedRoute requiredPermission="admin-settings"><Parametres /></ProtectedRoute>} />
                  <Route path="/entreprise" element={<ProtectedRoute requiredPermission="admin-settings"><GestionEntreprise /></ProtectedRoute>} />
                  <Route path="/configuration-avancee" element={<ProtectedRoute requiredPermission="admin-settings"><ConfigurationAvancee /></ProtectedRoute>} />
                  <Route path="/integrations" element={<ProtectedRoute requiredPermission="admin-settings"><Integrations /></ProtectedRoute>} />



                  {/* Lazy Loaded */}
                  <Route path="/budget" element={<ProtectedRoute requiredPermission="rapports-basic"><BudgetPage /></ProtectedRoute>} />
                  <Route path="/rapprochement-bancaire" element={<ProtectedRoute requiredPermission="comptabilite-read"><RapprochementBancairePage /></ProtectedRoute>} />

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
