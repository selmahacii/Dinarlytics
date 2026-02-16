import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChartBarIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CubeIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  CreditCardIcon,
  ScaleIcon,
  CalculatorIcon,
  DocumentChartBarIcon,
  TableCellsIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  ShareIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useApp } from '@core/context/AppContext';
import { usePermission } from '@shared/hooks/usePermission';
import Card from '@shared/components/UI/Card';
import api from '@/services/api';
import { AdaptiveContentDisplay, AdaptiveContentGenerator } from '@shared/utils/AdaptiveContent';

const RapportsAnalytics: React.FC = () => {
  const { companyData, formatCurrency, user } = useApp();
  const permissionObj = usePermission();
  const hasPermission = permissionObj.has;
  const [loading, setLoading] = useState(true);
  const [pageContent, setPageContent] = useState<any>(null);

  React.useEffect(() => {
    async function fetchDynamicContent() {
      try {
        // Try to fetch from API via api.ts
        const data = await api.reports.getAnalytics();
        if (data && data.pageContent) {
          setPageContent(data.pageContent);
        } else {
          // Fallback: generate from companyData
          const contentContext = {
            user,
            segment: user?.segment || 'micro',
            companyType: user?.companyType || 'eurl',
            role: user?.role || 'utilisateur',
            hasPermission,
            companyData,
          };
          const generated = AdaptiveContentGenerator.generatePageContent('rapports', contentContext);
          setPageContent(generated);
        }
      } catch (err) {
        // Fallback: generate from companyData
        const contentContext = {
          user,
          segment: user?.segment || 'micro',
          companyType: user?.companyType || 'eurl',
          role: user?.role || 'utilisateur',
          hasPermission,
          companyData,
        };
        const generated = AdaptiveContentGenerator.generatePageContent('rapports', contentContext);
        setPageContent(generated);
      } finally {
        setLoading(false);
      }
    }
    fetchDynamicContent();
  }, [companyData, user, hasPermission]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des rapports analytiques...</p>
        </div>
      </div>
    );
  }

  const contentContext = {
    user,
    segment: user?.segment || 'micro',
    companyType: user?.companyType || 'eurl',
    role: user?.role || 'utilisateur',
    hasPermission,
    companyData,
  };

  return (
    <div className="space-y-6">
      <AdaptiveContentDisplay pageId="rapports" context={contentContext} />
    </div>
  );
}

export default RapportsAnalytics;


