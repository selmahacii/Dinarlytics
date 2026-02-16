import React, { useState } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowRightIcon,
  ArrowLeftIcon,
  BuildingOfficeIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { COMPANY_TYPES, ACCESS_LEVELS, COMPANY_SIZES, AVAILABLE_MODULES } from '@/types/CompanyTypes';

interface CompanyWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (config: any) => void;
}

const CompanyWizard: React.FC<CompanyWizardProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedAccess, setSelectedAccess] = useState<string>('');
  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    capital: 0,
    employees: 0,
    revenue: 0
  });

  const steps = [
    { id: 1, name: 'Type d\'entreprise', icon: BuildingOfficeIcon },
    { id: 2, name: 'Taille', icon: UsersIcon },
    { id: 3, name: 'Niveau d\'accès', icon: ShieldCheckIcon },
    { id: 4, name: 'Configuration', icon: CogIcon },
    { id: 5, name: 'Récapitulatif', icon: CheckCircleIcon }
  ];

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    const config = {
      type: selectedType,
      size: selectedSize,
      access: selectedAccess,
      companyInfo,
      modules: getRecommendedModules(),
      features: getRecommendedFeatures()
    };
    onComplete(config);
    onClose();
  };

  const getRecommendedModules = () => {
    const type = COMPANY_TYPES.find(t => t.id === selectedType);
    return type ? type.requiredModules : [];
  };

  const getRecommendedFeatures = () => {
    const type = COMPANY_TYPES.find(t => t.id === selectedType);
    return type ? type.features : [];
  };

  const getSelectedType = () => COMPANY_TYPES.find(t => t.id === selectedType);
  const getSelectedSize = () => COMPANY_SIZES.find(s => s.id === selectedSize);
  const getSelectedAccess = () => ACCESS_LEVELS.find(a => a.id === selectedAccess);

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Choisissez votre type d'entreprise</h3>
        <p className="text-gray-600">Sélectionnez le statut juridique de votre entreprise</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COMPANY_TYPES.map((type) => (
          <div
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
              selectedType === type.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className="text-4xl mb-4">{type.icon}</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">{type.name}</h4>
              <p className="text-sm text-gray-600 mb-4">{type.fullName}</p>
              <p className="text-xs text-gray-500 mb-4">{type.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Capital min:</span>
                  <span className="font-medium">{type.minCapital.toLocaleString()} DA</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Employés max:</span>
                  <span className="font-medium">{type.maxEmployees}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Complexité:</span>
                  <span className={`font-medium ${
                    type.complexity === 'simple' ? 'text-green-600' :
                    type.complexity === 'medium' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {type.complexity === 'simple' ? 'Simple' :
                     type.complexity === 'medium' ? 'Moyenne' : 'Complexe'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Définissez la taille de votre entreprise</h3>
        <p className="text-gray-600">Cela nous aide à recommander les bonnes fonctionnalités</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {COMPANY_SIZES.map((size) => (
          <div
            key={size.id}
            onClick={() => setSelectedSize(size.id)}
            className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
              selectedSize === size.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <h4 className="text-lg font-semibold text-gray-900 mb-2">{size.name}</h4>
            <p className="text-sm text-gray-600 mb-4">{size.description}</p>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Employés:</span>
                <span className="font-medium">{size.employeeRange}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Chiffre d'affaires:</span>
                <span className="font-medium">{size.revenueRange}</span>
              </div>
            </div>
            
            <div className="mt-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Fonctionnalités incluses:</h5>
              <ul className="text-xs text-gray-600 space-y-1">
                {size.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircleIcon className="h-3 w-3 text-green-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Sélectionnez votre niveau d'accès</h3>
        <p className="text-gray-600">Choisissez le plan qui correspond à vos besoins</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {ACCESS_LEVELS.map((access) => (
          <div
            key={access.id}
            onClick={() => setSelectedAccess(access.id)}
            className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
              selectedAccess === access.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">{access.name}</h4>
              <p className="text-sm text-gray-600 mb-4">{access.description}</p>
              
              <div className="mb-4">
                <span className="text-3xl font-bold text-blue-600">
                  {access.price.toLocaleString()} {access.currency}
                </span>
                <span className="text-gray-500">/{access.billing === 'monthly' ? 'mois' : 'an'}</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Utilisateurs max:</span>
                  <span className="font-medium">{access.maxUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Entreprises max:</span>
                  <span className="font-medium">{access.maxCompanies}</span>
                </div>
              </div>
              
              <div className="mt-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Fonctionnalités:</h5>
                <ul className="text-xs text-gray-600 space-y-1">
                  {access.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircleIcon className="h-3 w-3 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Configuration de votre entreprise</h3>
        <p className="text-gray-600">Renseignez les informations de base</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900">
            Nom de l'entreprise <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={companyInfo.name}
            onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            placeholder="Nom de votre entreprise"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900">
            Capital social (DA)
          </label>
          <input
            type="number"
            value={companyInfo.capital}
            onChange={(e) => setCompanyInfo({...companyInfo, capital: parseInt(e.target.value) || 0})}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            placeholder="Montant du capital"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900">
            Nombre d'employés
          </label>
          <input
            type="number"
            value={companyInfo.employees}
            onChange={(e) => setCompanyInfo({...companyInfo, employees: parseInt(e.target.value) || 0})}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            placeholder="Nombre d'employés"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900">
            Chiffre d'affaires annuel (DA)
          </label>
          <input
            type="number"
            value={companyInfo.revenue}
            onChange={(e) => setCompanyInfo({...companyInfo, revenue: parseInt(e.target.value) || 0})}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            placeholder="CA annuel"
          />
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => {
    const type = getSelectedType();
    const size = getSelectedSize();
    const access = getSelectedAccess();
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Récapitulatif de votre configuration</h3>
          <p className="text-gray-600">Vérifiez les détails avant de finaliser</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Type d'entreprise</h4>
              <div className="flex items-center">
                <span className="text-2xl mr-3">{type?.icon}</span>
                <div>
                  <p className="font-medium">{type?.name}</p>
                  <p className="text-sm text-gray-600">{type?.fullName}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Taille</h4>
              <p className="font-medium">{size?.name}</p>
              <p className="text-sm text-gray-600">{size?.employeeRange}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Niveau d'accès</h4>
              <p className="font-medium">{access?.name}</p>
              <p className="text-sm text-gray-600">
                {access?.price.toLocaleString()} {access?.currency}/{access?.billing === 'monthly' ? 'mois' : 'an'}
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Informations entreprise</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Nom:</span>
                <span className="ml-2 font-medium">{companyInfo.name || 'Non renseigné'}</span>
              </div>
              <div>
                <span className="text-gray-600">Capital:</span>
                <span className="ml-2 font-medium">{companyInfo.capital.toLocaleString()} DA</span>
              </div>
              <div>
                <span className="text-gray-600">Employés:</span>
                <span className="ml-2 font-medium">{companyInfo.employees}</span>
              </div>
              <div>
                <span className="text-gray-600">CA annuel:</span>
                <span className="ml-2 font-medium">{companyInfo.revenue.toLocaleString()} DA</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Modules inclus</h4>
            <div className="grid grid-cols-2 gap-2">
              {getRecommendedModules().map((moduleId, index) => {
                const module = AVAILABLE_MODULES[moduleId as keyof typeof AVAILABLE_MODULES];
                return (
                  <div key={index} className="flex items-center text-sm">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    {module?.name}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return renderStep1();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedType !== '';
      case 2: return selectedSize !== '';
      case 3: return selectedAccess !== '';
      case 4: return companyInfo.name !== '';
      case 5: return true;
      default: return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Configuration d'Entreprise</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>
          
          {/* Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    isActive ? 'bg-blue-600 text-white' :
                    isCompleted ? 'bg-green-600 text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {isCompleted ? (
                      <CheckCircleIcon className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRightIcon className="h-5 w-5 text-gray-400 mx-4" />
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Content */}
          <div className="mb-6">
            {renderCurrentStep()}
          </div>
          
          {/* Actions */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Précédent
            </button>
            
            {currentStep < 5 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Finaliser la configuration
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyWizard;



