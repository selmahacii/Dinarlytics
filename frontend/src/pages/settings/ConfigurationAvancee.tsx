import React, { useState } from 'react';
import { 
  CogIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  DocumentTextIcon,
  CalculatorIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  EyeIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
  ShieldCheckIcon,
  UsersIcon,
  BanknotesIcon,
  PlayIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import Card from '@shared/components/UI/Card';
import Modal from '@shared/components/UI/Modal';
import { useApp } from '@core/context/AppContext';
import { useTranslation } from '@shared/hooks/useTranslation';

const ConfigurationAvancee: React.FC = () => {
  const { formatCurrency } = useApp();
  const { t } = useTranslation();
  
  // États pour les modals
  const [isChampModalOpen, setIsChampModalOpen] = useState(false);
  const [isFormuleModalOpen, setIsFormuleModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isRegleModalOpen, setIsRegleModalOpen] = useState(false);
  const [isEntrepriseModalOpen, setIsEntrepriseModalOpen] = useState(false);
  const [isConsolidationModalOpen, setIsConsolidationModalOpen] = useState(false);
  
  // États pour le formulaire de champ personnalisé
  const [champForm, setChampForm] = useState({
    nom: '',
    module: '',
    description: '',
    type: '',
    categorie: '',
    ordre: 1,
    valeurDefaut: '',
    unite: '',
    options: '',
    longueurMin: '',
    longueurMax: '',
    min: '',
    max: '',
    regleValidation: '',
    aide: '',
    obligatoire: false,
    historique: true,
    indexe: true,
    actif: true,
    permissions: ['lecture', 'ecriture']
  });
  const [showPreview, setShowPreview] = useState(false);
  
  // États pour le formulaire de règle métier
  const [regleForm, setRegleForm] = useState({
    nom: '',
    description: '',
    module: '',
    priorite: 1,
    condition: '',
    action: '',
    type: 'validation',
    active: true,
    notifications: true,
    logExecution: true,
    variables: [] as string[],
    tests: [] as { input: string; expected: string }[]
  });
  const [showReglePreview, setShowReglePreview] = useState(false);
  const [currentTest, setCurrentTest] = useState({ input: '', expected: '' });
  
  // États pour le formulaire de template de document
  const [templateForm, setTemplateForm] = useState({
    nom: '',
    description: '',
    type: '',
    categorie: '',
    contenu: '',
    styles: [],
    variables: [],
    format: 'HTML',
    responsive: true,
    version: '1.0',
    auteur: 'Admin'
  });
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [currentVariable, setCurrentVariable] = useState('');
  const [currentStyle, setCurrentStyle] = useState('');
  const [editorMode, setEditorMode] = useState('wysiwyg'); // wysiwyg, html, preview
  
  // États pour le formulaire de formule personnalisée
  const [formuleForm, setFormuleForm] = useState({
    nom: '',
    description: '',
    formule: '',
    module: '',
    type: 'calcul',
    categorie: 'Commercial',
    variables: [] as string[],
    tests: [] as { input: string; expected: string }[],
    documentation: '',
    version: '1.0',
    auteur: 'Admin',
    performance: 'optimale',
    complexite: 'simple'
  });
  const [showFormulePreview, setShowFormulePreview] = useState(false);
  const [formuleResult, setFormuleResult] = useState('');
  const [testData, setTestData] = useState({});

  // États pour les données
  const [activeTab, setActiveTab] = useState('champs');
  const [selectedModule, setSelectedModule] = useState('clients');

  // Fonctions de gestion du formulaire
  const handleChampFormChange = (field: string, value: any) => {
    setChampForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreview = () => {
    setShowPreview(!showPreview);
  };

  const handleCreateChamp = () => {
    // Pas de backend de configuration dynamique : ajouté à la liste de la
    // session uniquement (non persisté après rechargement).
    setChampsPersonnalises(prev => [...prev, { ...champForm, id: `champ-${Date.now()}` }]);
    setIsChampModalOpen(false);
    setChampForm({
      nom: '',
      module: '',
      description: '',
      type: '',
      categorie: '',
      ordre: 1,
      valeurDefaut: '',
      unite: '',
      options: '',
      longueurMin: '',
      longueurMax: '',
      min: '',
      max: '',
      regleValidation: '',
      aide: '',
      obligatoire: false,
      historique: true,
      indexe: true,
      actif: true,
      permissions: ['lecture', 'ecriture']
    });
    setShowPreview(false);
  };

  const renderFieldPreview = () => {
    if (!champForm.type) return null;

    const commonProps = {
      className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
      placeholder: champForm.aide || `Saisissez ${champForm.nom.toLowerCase()}`,
      value: champForm.valeurDefaut || '',
      readOnly: true
    };

    switch (champForm.type) {
      case 'texte':
        return <input type="text" {...commonProps} />;
      case 'nombre':
        return <input type="number" {...commonProps} min={champForm.min} max={champForm.max} />;
      case 'date':
        return <input type="date" {...commonProps} />;
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Sélectionner une option</option>
            {champForm.options.split('\n').filter(opt => opt.trim()).map((option, index) => (
              <option key={index} value={option.trim()}>{option.trim()}</option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            <label className="ml-2 text-sm text-gray-700">{champForm.nom}</label>
          </div>
        );
      case 'textarea':
        return <textarea {...commonProps} rows={3} />;
      case 'note':
        return (
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map(star => (
              <button key={star} className="text-gray-300 hover:text-yellow-400 focus:outline-none">
                ★
              </button>
            ))}
          </div>
        );
      default:
        return <input type="text" {...commonProps} />;
    }
  };

  // Fonctions de gestion des règles métier
  const handleRegleFormChange = (field: string, value: any) => {
    setRegleForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddVariable = () => {
    const variable = prompt('Nom de la variable:');
    if (variable) {
      handleRegleFormChange('variables', [...regleForm.variables, variable]);
    }
  };

  const handleRemoveVariable = (index: number) => {
    const newVariables = regleForm.variables.filter((_, i) => i !== index);
    handleRegleFormChange('variables', newVariables);
  };

  const handleAddTest = () => {
    if (currentTest.input && currentTest.expected) {
      handleRegleFormChange('tests', [...regleForm.tests, { ...currentTest }]);
      setCurrentTest({ input: '', expected: '' });
    }
  };

  const handleRemoveTest = (index: number) => {
    const newTests = regleForm.tests.filter((_, i) => i !== index);
    handleRegleFormChange('tests', newTests);
  };

  const handleReglePreview = () => {
    setShowReglePreview(!showReglePreview);
  };

  const handleCreateRegle = () => {
    setReglesMetier(prev => [...prev, { ...regleForm, id: `regle-${Date.now()}` }]);
    setIsRegleModalOpen(false);
    setRegleForm({
      nom: '',
      description: '',
      module: '',
      priorite: 1,
      condition: '',
      action: '',
      type: 'validation',
      active: true,
      notifications: true,
      logExecution: true,
      variables: [],
      tests: []
    });
    setShowReglePreview(false);
  };

  // Fonctions de gestion des formules personnalisées
  const handleFormuleFormChange = (field: string, value: any) => {
    setFormuleForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddFormuleVariable = () => {
    if (currentVariable.trim()) {
      handleFormuleFormChange('variables', [...formuleForm.variables, currentVariable.trim()]);
      setCurrentVariable('');
    }
  };

  const handleRemoveFormuleVariable = (index: number) => {
    const newVariables = formuleForm.variables.filter((_, i) => i !== index);
    handleFormuleFormChange('variables', newVariables);
  };

  const handleAddFormuleTest = () => {
    if (currentTest.input && currentTest.expected) {
      handleFormuleFormChange('tests', [...formuleForm.tests, { ...currentTest }]);
      setCurrentTest({ input: '', expected: '' });
    }
  };

  const handleRemoveFormuleTest = (index: number) => {
    const newTests = formuleForm.tests.filter((_, i) => i !== index);
    handleFormuleFormChange('tests', newTests);
  };

  const handleTestFormule = () => {
    // Aucun moteur d'évaluation de formules n'est encore implémenté :
    // on ne prétend pas calculer un résultat à partir du texte saisi.
    setFormuleResult("Le test d'exécution des formules n'est pas encore disponible.");
  };

  const handleFormulePreview = () => {
    setShowFormulePreview(!showFormulePreview);
  };

  const handleCreateFormule = () => {
    setFormulesPersonnalisees(prev => [...prev, { ...formuleForm, id: `formule-${Date.now()}` }]);
    setIsFormuleModalOpen(false);
    setFormuleForm({
      nom: '',
      description: '',
      formule: '',
      module: '',
      type: 'calcul',
      categorie: 'Commercial',
      variables: [],
      tests: [],
      documentation: '',
      version: '1.0',
      auteur: 'Admin',
      performance: 'optimale',
      complexite: 'simple'
    });
    setShowFormulePreview(false);
    setFormuleResult('');
  };

  // Fonctions utilitaires pour les formules
  const insertFunction = (func: string) => {
    const cursorPos = (document.getElementById('formule-editor') as HTMLTextAreaElement)?.selectionStart || 0;
    const newFormule = formuleForm.formule.slice(0, cursorPos) + func + formuleForm.formule.slice(cursorPos);
    handleFormuleFormChange('formule', newFormule);
  };

  const insertVariable = (variable: string) => {
    const cursorPos = (document.getElementById('formule-editor') as HTMLTextAreaElement)?.selectionStart || 0;
    const newFormule = formuleForm.formule.slice(0, cursorPos) + variable + formuleForm.formule.slice(cursorPos);
    handleFormuleFormChange('formule', newFormule);
  };

  // Aucun backend de configuration dynamique (champs/règles/formules)
  // n'existe encore : ces listes ne persistent que le temps de la session.
  const [champsPersonnalises, setChampsPersonnalises] = useState<any[]>([]);

  const [formulesPersonnalisees, setFormulesPersonnalisees] = useState<any[]>([]);

  const templatesDocuments: any[] = [];

  const [reglesMetier, setReglesMetier] = useState<any[]>([]);

  const entreprises: any[] = [];

  const donneesConsolidation: { periode: string; entreprises: any[]; totalConsolide: { ca: number; benefice: number } } = {
    periode: '',
    entreprises: [],
    totalConsolide: {
      ca: 0,
      benefice: 0
    }
  };

  const modules = [
    { id: 'clients', nom: 'Clients', icon: UsersIcon },
    { id: 'fournisseurs', nom: 'Fournisseurs', icon: BuildingOfficeIcon },
    { id: 'articles', nom: 'Articles', icon: DocumentTextIcon },
    { id: 'factures', nom: 'Factures', icon: BanknotesIcon },
    { id: 'inventaire', nom: 'Inventaire', icon: ChartBarIcon }
  ];

  const tabs = [
    { id: 'champs', nom: 'Champs Personnalisés', icon: PencilIcon },
    { id: 'formules', nom: 'Formules Personnalisées', icon: CalculatorIcon },
    { id: 'templates', nom: 'Templates Documents', icon: DocumentTextIcon },
    { id: 'regles', nom: 'Règles Métier', icon: ShieldCheckIcon },
    { id: 'entreprises', nom: 'Multi-Entreprises', icon: BuildingOfficeIcon },
    { id: 'consolidation', nom: 'Consolidation', icon: ChartBarIcon }
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ⚙️ Configuration Avancée
        </h1>
        <p className="text-gray-600">
          Personnalisez votre application avec des champs personnalisés, formules, templates et règles métier.
          Gérez plusieurs entreprises et consolidez leurs données.
        </p>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200 overflow-x-auto no-scrollbar">
          <nav className="flex space-x-8 px-6 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-black text-[10px] uppercase tracking-widest flex items-center space-x-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.nom}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Onglet Champs Personnalisés */}
          {activeTab === 'champs' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  Champs Personnalisés par Module
                </h2>
                <button
                  onClick={() => setIsChampModalOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center px-4 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Ajouter un Champ
                </button>
              </div>

              {/* Sélecteur de module */}
              <div className="flex flex-wrap gap-2">
                {modules.map((module) => (
                  <button
                    key={module.id}
                    onClick={() => setSelectedModule(module.id)}
                    className={`flex items-center px-4 py-2.5 rounded-xl border transition-all font-bold text-xs ${
                      selectedModule === module.id
                        ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <module.icon className="h-4 w-4 mr-2" />
                    {module.nom}
                  </button>
                ))}
              </div>

              {/* Statistiques des champs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <PencilIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-900">Total Champs</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {champsPersonnalises.filter(c => c.module === selectedModule).length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-900">Actifs</p>
                      <p className="text-2xl font-bold text-green-600">
                        {champsPersonnalises.filter(c => c.module === selectedModule && c.actif).length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <ShieldCheckIcon className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-orange-900">Obligatoires</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {champsPersonnalises.filter(c => c.module === selectedModule && c.obligatoire).length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <ChartBarIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-purple-900">Indexés</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {champsPersonnalises.filter(c => c.module === selectedModule && c.indexe).length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Liste des champs enrichie */}
              <div className="grid grid-cols-1 gap-4">
                {champsPersonnalises
                  .filter(champ => champ.module === selectedModule)
                  .map((champ) => (
                    <div key={champ.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          {/* En-tête avec badges */}
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">{champ.nom}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              champ.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {champ.actif ? 'Actif' : 'Inactif'}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {champ.type}
                            </span>
                            {champ.obligatoire && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                Obligatoire
                              </span>
                            )}
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {champ.categorie}
                            </span>
                          </div>

                          {/* Description et aide */}
                          <p className="text-sm text-gray-600 mb-2">{champ.description}</p>
                          {champ.aide && (
                            <p className="text-xs text-blue-600 mb-3 bg-blue-50 p-2 rounded">
                              💡 {champ.aide}
                            </p>
                          )}

                          {/* Détails techniques */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-gray-500">Ordre d'affichage</p>
                              <p className="text-sm font-medium">{champ.ordre}</p>
                            </div>
                            {champ.valeurDefaut !== undefined && (
                              <div>
                                <p className="text-xs text-gray-500">Valeur par défaut</p>
                                <p className="text-sm font-medium">{champ.valeurDefaut}</p>
                              </div>
                            )}
                            {champ.unite && (
                              <div>
                                <p className="text-xs text-gray-500">Unité</p>
                                <p className="text-sm font-medium">{champ.unite}</p>
                              </div>
                            )}
                            {champ.longueurMax && (
                              <div>
                                <p className="text-xs text-gray-500">Longueur max</p>
                                <p className="text-sm font-medium">{champ.longueurMax} caractères</p>
                              </div>
                            )}
                          </div>

                          {/* Contraintes et validation */}
                          {(champ.min !== undefined || champ.max !== undefined || champ.regleValidation) && (
                            <div className="bg-gray-50 p-3 rounded-lg mb-3">
                              <h4 className="text-xs font-medium text-gray-700 mb-2">Contraintes et Validation</h4>
                              <div className="space-y-1 text-xs text-gray-600">
                                {champ.min !== undefined && (
                                  <p>• Valeur minimum: {champ.min}</p>
                                )}
                                {champ.max !== undefined && (
                                  <p>• Valeur maximum: {champ.max}</p>
                                )}
                                {champ.decimales !== undefined && (
                                  <p>• Décimales: {champ.decimales}</p>
                                )}
                                {champ.regleValidation && (
                                  <p>• Règle: {champ.regleValidation}</p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Options pour les champs select */}
                          {champ.options && (
                            <div className="bg-blue-50 p-3 rounded-lg mb-3">
                              <h4 className="text-xs font-medium text-blue-700 mb-2">Options disponibles</h4>
                              <div className="flex flex-wrap gap-1">
                                {champ.options.map((option, index) => (
                                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                    {option}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Permissions et historique */}
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <span>Permissions:</span>
                              <span className="font-medium">{champ.permissions.join(', ')}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span>Historique:</span>
                              <span className={`font-medium ${champ.historique ? 'text-green-600' : 'text-red-600'}`}>
                                {champ.historique ? 'Oui' : 'Non'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span>Indexé:</span>
                              <span className={`font-medium ${champ.indexe ? 'text-green-600' : 'text-red-600'}`}>
                                {champ.indexe ? 'Oui' : 'Non'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col space-y-2 ml-4">
                          <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Modifier">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-green-600 transition-colors" title="Dupliquer">
                            <DocumentDuplicateIcon className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Supprimer">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Onglet Formules Personnalisées */}
          {activeTab === 'formules' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  Formules Personnalisées
                </h2>
                <button
                  onClick={() => setIsFormuleModalOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center px-4 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Ajouter une Formule
                </button>
              </div>

              {/* Statistiques des formules */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <CalculatorIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-900">Total Formules</p>
                      <p className="text-2xl font-bold text-blue-600">{formulesPersonnalisees.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-900">Actives</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formulesPersonnalisees.filter(f => f.actif).length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <ChartBarIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-purple-900">Utilisations</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {formulesPersonnalisees.reduce((sum, f) => sum + (f.utilisation || 0), 0)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <ClockIcon className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-orange-900">Dernière Modif</p>
                      <p className="text-sm font-bold text-orange-600">
                        {formulesPersonnalisees[0]?.derniereModification || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Liste des formules enrichie */}
              <div className="grid grid-cols-1 gap-6">
                {formulesPersonnalisees.map((formule) => (
                  <div key={formule.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {/* En-tête avec badges */}
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">{formule.nom}</h3>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {formule.type}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {formule.module}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {formule.categorie}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            formule.complexite === 'simple' ? 'bg-green-100 text-green-800' :
                            formule.complexite === 'moyenne' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {formule.complexite}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-600 mb-3">{formule.description}</p>

                        {/* Formule */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <h4 className="text-xs font-medium text-gray-700 mb-2">Formule</h4>
                          <code className="text-sm text-gray-800 font-mono break-all">{formule.formule}</code>
                        </div>

                        {/* Variables */}
                        {formule.variables && (
                          <div className="bg-blue-50 p-3 rounded-lg mb-4">
                            <h4 className="text-xs font-medium text-blue-700 mb-2">Variables utilisées</h4>
                            <div className="flex flex-wrap gap-1">
                              {formule.variables.map((variable, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                  {variable}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tests unitaires */}
                        {formule.tests && (
                          <div className="bg-green-50 p-3 rounded-lg mb-4">
                            <h4 className="text-xs font-medium text-green-700 mb-2">Tests unitaires</h4>
                            <div className="space-y-2">
                              {formule.tests.map((test, index) => (
                                <div key={index} className="text-xs text-green-800">
                                  <span className="font-medium">Test {index + 1}:</span>
                                  <span className="ml-2">
                                    {Object.entries(test.input).map(([key, value]) => `${key}=${value}`).join(', ')} → {test.expected}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Métadonnées */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-500">Version</p>
                            <p className="text-sm font-medium">{formule.version}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Auteur</p>
                            <p className="text-sm font-medium">{formule.auteur}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Utilisations</p>
                            <p className="text-sm font-medium">{formule.utilisation || 0}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Performance</p>
                            <p className={`text-sm font-medium ${
                              formule.performance === 'optimale' ? 'text-green-600' : 'text-yellow-600'
                            }`}>
                              {formule.performance}
                            </p>
                          </div>
                        </div>

                        {/* Documentation */}
                        {formule.documentation && (
                          <div className="bg-yellow-50 p-3 rounded-lg mb-4">
                            <h4 className="text-xs font-medium text-yellow-700 mb-1">Documentation</h4>
                            <p className="text-xs text-yellow-800">{formule.documentation}</p>
                          </div>
                        )}

                        {/* Dates */}
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <span>Dernière modif:</span>
                            <span className="font-medium">{formule.derniereModification}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>Dernière utilisation:</span>
                            <span className="font-medium">{formule.derniereUtilisation || 'Jamais'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col space-y-2 ml-4">
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Modifier">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 transition-colors" title="Tester">
                          <PlayIcon className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors" title="Dupliquer">
                          <DocumentDuplicateIcon className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Supprimer">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Onglet Templates Documents */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  Templates de Documents
                </h2>
                <button
                  onClick={() => setIsTemplateModalOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center px-4 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Ajouter un Template
                </button>
              </div>

              {/* Statistiques des templates */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <DocumentTextIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-purple-900">Total Templates</p>
                      <p className="text-2xl font-bold text-purple-600">{templatesDocuments.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-900">Actifs</p>
                      <p className="text-2xl font-bold text-green-600">
                        {templatesDocuments.filter(t => t.actif).length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <ChartBarIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-900">Utilisations</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {templatesDocuments.reduce((sum, t) => sum + (t.utilisation || 0), 0)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <ClockIcon className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-orange-900">Dernière Modif</p>
                      <p className="text-sm font-bold text-orange-600">
                        {templatesDocuments[0]?.derniereModification || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Liste des templates enrichie */}
              <div className="grid grid-cols-1 gap-6">
                {templatesDocuments.map((template) => (
                  <div key={template.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {/* En-tête avec badges */}
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">{template.nom}</h3>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {template.type}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {template.categorie}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {template.format}
                          </span>
                          {template.responsive && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Responsive
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-600 mb-3">{template.description}</p>

                        {/* Variables utilisées */}
                        {template.variables && (
                          <div className="bg-blue-50 p-3 rounded-lg mb-4">
                            <h4 className="text-xs font-medium text-blue-700 mb-2">Variables disponibles</h4>
                            <div className="flex flex-wrap gap-1">
                              {template.variables.map((variable, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                  {variable}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Styles et format */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-500">Version</p>
                            <p className="text-sm font-medium">{template.version}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Taille</p>
                            <p className="text-sm font-medium">{template.taille}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Auteur</p>
                            <p className="text-sm font-medium">{template.auteur}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Utilisations</p>
                            <p className="text-sm font-medium">{template.utilisation || 0}</p>
                          </div>
                        </div>

                        {/* Styles CSS */}
                        {template.styles && (
                          <div className="bg-gray-50 p-3 rounded-lg mb-4">
                            <h4 className="text-xs font-medium text-gray-700 mb-2">Styles CSS</h4>
                            <div className="flex flex-wrap gap-1">
                              {template.styles.map((style, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                                  {style}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Aperçu du contenu */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <h4 className="text-xs font-medium text-gray-700 mb-2">Aperçu du contenu</h4>
                          <div className="max-h-32 overflow-y-auto">
                            <pre className="text-xs text-gray-800 whitespace-pre-wrap">{template.contenu}</pre>
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <span>Dernière modif:</span>
                            <span className="font-medium">{template.derniereModification}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>Dernière utilisation:</span>
                            <span className="font-medium">{template.derniereUtilisation || 'Jamais'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col space-y-2 ml-4">
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Prévisualiser">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 transition-colors" title="Modifier">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors" title="Dupliquer">
                          <DocumentDuplicateIcon className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-orange-600 transition-colors" title="Tester">
                          <PlayIcon className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Supprimer">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Onglet Règles Métier */}
          {activeTab === 'regles' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Règles Métier Configurables
                </h2>
                <button
                  onClick={() => setIsRegleModalOpen(true)}
                  className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Ajouter une Règle
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {reglesMetier.map((regle) => (
                  <div key={regle.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-gray-900">{regle.nom}</h3>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Priorité {regle.priorite}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {regle.module}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{regle.description}</p>
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-1">Condition:</h4>
                            <div className="bg-white p-2 rounded border">
                              <code className="text-sm text-gray-800">{regle.condition.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-1">Action:</h4>
                            <div className="bg-white p-2 rounded border">
                              <code className="text-sm text-gray-800">{regle.action}</code>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Onglet Multi-Entreprises */}
          {activeTab === 'entreprises' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Gestion Multi-Entreprises
                </h2>
                <button
                  onClick={() => setIsEntrepriseModalOpen(true)}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Ajouter une Entreprise
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {entreprises.map((entreprise) => (
                  <div key={entreprise.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-gray-900">{entreprise.nom}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            entreprise.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {entreprise.actif ? 'Actif' : 'Inactif'}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {entreprise.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{entreprise.adresse}</p>
                        <div className="mt-2 space-y-1 text-xs text-gray-500">
                          <p><strong>SIREN:</strong> {entreprise.siren}</p>
                          <p><strong>Devise:</strong> {entreprise.devise}</p>
                          <p><strong>Plan Comptable:</strong> {entreprise.planComptable}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                          <ArrowPathIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Onglet Consolidation */}
          {activeTab === 'consolidation' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Consolidation des Comptes de Groupe
                </h2>
                <button
                  onClick={() => setIsConsolidationModalOpen(true)}
                  className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  Générer Consolidation
                </button>
              </div>

              {/* Résumé de consolidation */}
              <div className="bg-teal-50 p-6 rounded-lg border border-teal-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Résumé Consolidé - Période {donneesConsolidation.periode}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Chiffre d'Affaires Consolidé</h4>
                    <div className="space-y-2">
                      {donneesConsolidation.entreprises.map((ent, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{ent.nom}:</span>
                          <span className="font-semibold">
                            {formatCurrency(ent.ca)} {ent.devise}
                            {ent.tauxChange !== 1 && (
                              <span className="text-xs text-gray-500 ml-1">
                                (×{ent.tauxChange})
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                      <div className="border-t pt-2">
                        <div className="flex justify-between items-center font-bold text-lg">
                          <span>Total Consolidé:</span>
                          <span className="text-teal-600">
                            {formatCurrency(donneesConsolidation.totalConsolide.ca)} DZD
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Bénéfice Consolidé</h4>
                    <div className="space-y-2">
                      {donneesConsolidation.entreprises.map((ent, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{ent.nom}:</span>
                          <span className="font-semibold">
                            {formatCurrency(ent.benefice)} {ent.devise}
                            {ent.tauxChange !== 1 && (
                              <span className="text-xs text-gray-500 ml-1">
                                (×{ent.tauxChange})
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                      <div className="border-t pt-2">
                        <div className="flex justify-between items-center font-bold text-lg">
                          <span>Total Consolidé:</span>
                          <span className="text-teal-600">
                            {formatCurrency(donneesConsolidation.totalConsolide.benefice)} DZD
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tableau de consolidation */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Entreprise
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Devise
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Taux de Change
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CA Original
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CA en DZD
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bénéfice Original
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bénéfice en DZD
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {donneesConsolidation.entreprises.map((entreprise, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {entreprise.nom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {entreprise.devise}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {entreprise.tauxChange}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(entreprise.ca)} {entreprise.devise}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {formatCurrency(entreprise.ca * entreprise.tauxChange)} DZD
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(entreprise.benefice)} {entreprise.devise}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {formatCurrency(entreprise.benefice * entreprise.tauxChange)} DZD
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Ajouter un Champ Personnalisé */}
      <Modal
        isOpen={isChampModalOpen}
        onClose={() => setIsChampModalOpen(false)}
        title="Ajouter un Champ Personnalisé"
        size="lg"
      >
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {/* Informations de base */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Informations de base</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du champ *
                </label>
                <input
                  type="text"
                  value={champForm.nom}
                  onChange={(e) => handleChampFormChange('nom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Code Client"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Module *
                </label>
                <select 
                  value={champForm.module}
                  onChange={(e) => handleChampFormChange('module', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner un module</option>
                  <option value="clients">Clients</option>
                  <option value="factures">Factures</option>
                  <option value="articles">Articles</option>
                  <option value="fournisseurs">Fournisseurs</option>
                  <option value="inventaire">Inventaire</option>
                  <option value="analyses">Analyses</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={champForm.description}
                onChange={(e) => handleChampFormChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Description du champ et de son utilisation"
              />
            </div>
          </div>

          {/* Type et configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Type et configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de champ *
                </label>
                <select 
                  value={champForm.type}
                  onChange={(e) => handleChampFormChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner un type</option>
                  <option value="texte">Texte</option>
                  <option value="nombre">Nombre</option>
                  <option value="date">Date</option>
                  <option value="select">Sélection</option>
                  <option value="checkbox">Case à cocher</option>
                  <option value="textarea">Zone de texte</option>
                  <option value="note">Note (étoiles)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie
                </label>
                <select 
                  value={champForm.categorie}
                  onChange={(e) => handleChampFormChange('categorie', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner une catégorie</option>
                  <option value="Identification">Identification</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Financier">Financier</option>
                  <option value="Personnel">Personnel</option>
                  <option value="Statut">Statut</option>
                  <option value="Administratif">Administratif</option>
                  <option value="Qualité">Qualité</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordre d'affichage
                </label>
                <input
                  type="number"
                  value={champForm.ordre}
                  onChange={(e) => handleChampFormChange('ordre', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valeur par défaut
                </label>
                <input
                  type="text"
                  value={champForm.valeurDefaut}
                  onChange={(e) => handleChampFormChange('valeurDefaut', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Valeur par défaut"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unité
                </label>
                <input
                  type="text"
                  value={champForm.unite}
                  onChange={(e) => handleChampFormChange('unite', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: DZD, jours, kg"
                />
              </div>
            </div>
          </div>

          {/* Options pour les champs de type sélection */}
          {champForm.type === 'select' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Options de sélection</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Options disponibles (une par ligne)
                </label>
                <textarea
                  value={champForm.options}
                  onChange={(e) => handleChampFormChange('options', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                />
                <p className="text-xs text-gray-500 mt-1">Saisissez une option par ligne</p>
              </div>
            </div>
          )}

          {/* Contraintes et validation */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Contraintes et validation</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longueur minimale
                </label>
                <input
                  type="number"
                  value={champForm.longueurMin}
                  onChange={(e) => handleChampFormChange('longueurMin', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longueur maximale
                </label>
                <input
                  type="number"
                  value={champForm.longueurMax}
                  onChange={(e) => handleChampFormChange('longueurMax', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="255"
                  min="1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valeur minimale
                </label>
                <input
                  type="number"
                  value={champForm.min}
                  onChange={(e) => handleChampFormChange('min', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valeur maximale
                </label>
                <input
                  type="number"
                  value={champForm.max}
                  onChange={(e) => handleChampFormChange('max', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="999999"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Règle de validation (Expression régulière)
              </label>
              <input
                type="text"
                value={champForm.regleValidation}
                onChange={(e) => handleChampFormChange('regleValidation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="^[A-Z]{2,3}-[0-9]{4}$"
              />
              <p className="text-xs text-gray-500 mt-1">Exemple: ^CLI-[0-9]{4}$ pour un code client</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message d'aide
              </label>
              <input
                type="text"
                value={champForm.aide}
                onChange={(e) => handleChampFormChange('aide', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Format: CLI-XXXX (4 chiffres)"
              />
            </div>
          </div>

          {/* Paramètres avancés */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Paramètres avancés</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="obligatoire"
                    checked={champForm.obligatoire}
                    onChange={(e) => handleChampFormChange('obligatoire', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="obligatoire" className="ml-2 text-sm text-gray-700">
                    Champ obligatoire
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="historique"
                    checked={champForm.historique}
                    onChange={(e) => handleChampFormChange('historique', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="historique" className="ml-2 text-sm text-gray-700">
                    Conserver l'historique des modifications
                  </label>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="indexe"
                    checked={champForm.indexe}
                    onChange={(e) => handleChampFormChange('indexe', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="indexe" className="ml-2 text-sm text-gray-700">
                    Indexer pour la recherche
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="actif"
                    checked={champForm.actif}
                    onChange={(e) => handleChampFormChange('actif', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="actif" className="ml-2 text-sm text-gray-700">
                    Champ actif
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Permissions
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="lecture"
                    checked={champForm.permissions.includes('lecture')}
                    onChange={(e) => {
                      const newPermissions = e.target.checked 
                        ? [...champForm.permissions, 'lecture']
                        : champForm.permissions.filter(p => p !== 'lecture');
                      handleChampFormChange('permissions', newPermissions);
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="lecture" className="ml-2 text-sm text-gray-700">
                    Lecture
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="ecriture"
                    checked={champForm.permissions.includes('ecriture')}
                    onChange={(e) => {
                      const newPermissions = e.target.checked 
                        ? [...champForm.permissions, 'ecriture']
                        : champForm.permissions.filter(p => p !== 'ecriture');
                      handleChampFormChange('permissions', newPermissions);
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="ecriture" className="ml-2 text-sm text-gray-700">
                    Écriture
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Prévisualisation */}
          {showPreview && champForm.type && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Prévisualisation du champ</h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {champForm.nom || 'Nom du champ'}
                    {champForm.obligatoire && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderFieldPreview()}
                  {champForm.aide && (
                    <p className="text-xs text-gray-500">{champForm.aide}</p>
                  )}
                  {champForm.unite && (
                    <p className="text-xs text-gray-500">Unité: {champForm.unite}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsChampModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handlePreview}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {showPreview ? 'Masquer' : 'Prévisualiser'}
            </button>
            <button
              type="button"
              onClick={handleCreateChamp}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Créer le champ
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Ajouter une Formule Personnalisée */}
      <Modal
        isOpen={isFormuleModalOpen}
        onClose={() => setIsFormuleModalOpen(false)}
        title="Ajouter une Formule Personnalisée"
        size="xl"
      >
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {/* Informations de base */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Informations de base</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la formule *
                </label>
                <input
                  type="text"
                  value={formuleForm.nom}
                  onChange={(e) => handleFormuleFormChange('nom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Ex: Calcul TVA"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Module *
                </label>
                <select 
                  value={formuleForm.module}
                  onChange={(e) => handleFormuleFormChange('module', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Sélectionner un module</option>
                  <option value="factures">Factures</option>
                  <option value="articles">Articles</option>
                  <option value="clients">Clients</option>
                  <option value="fournisseurs">Fournisseurs</option>
                  <option value="inventaire">Inventaire</option>
                  <option value="analyses">Analyses</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formuleForm.description}
                onChange={(e) => handleFormuleFormChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                rows={3}
                placeholder="Description de la formule et de son utilisation"
              />
            </div>
          </div>

          {/* Configuration de la formule */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Configuration de la formule</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de formule *
                </label>
                <select 
                  value={formuleForm.type}
                  onChange={(e) => handleFormuleFormChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="calcul">Calcul</option>
                  <option value="pourcentage">Pourcentage</option>
                  <option value="monetaire">Monétaire</option>
                  <option value="nombre">Nombre</option>
                  <option value="texte">Texte</option>
                  <option value="condition">Condition</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie
                </label>
                <select 
                  value={formuleForm.categorie}
                  onChange={(e) => handleFormuleFormChange('categorie', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="Commercial">Commercial</option>
                  <option value="Fiscal">Fiscal</option>
                  <option value="Analytique">Analytique</option>
                  <option value="Financier">Financier</option>
                  <option value="Logistique">Logistique</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Complexité
                </label>
                <select 
                  value={formuleForm.complexite}
                  onChange={(e) => handleFormuleFormChange('complexite', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="simple">Simple</option>
                  <option value="moyenne">Moyenne</option>
                  <option value="complexe">Complexe</option>
                </select>
              </div>
            </div>
          </div>

          {/* Éditeur de formule */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Éditeur de formule</h3>
            
            {/* Barre d'outils */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700">Fonctions:</span>
                <button
                  type="button"
                  onClick={() => insertFunction('SUM(')}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                >
                  SUM()
                </button>
                <button
                  type="button"
                  onClick={() => insertFunction('AVG(')}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                >
                  AVG()
                </button>
                <button
                  type="button"
                  onClick={() => insertFunction('MAX(')}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                >
                  MAX()
                </button>
                <button
                  type="button"
                  onClick={() => insertFunction('MIN(')}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                >
                  MIN()
                </button>
                <button
                  type="button"
                  onClick={() => insertFunction('IF(')}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                >
                  IF()
                </button>
                <button
                  type="button"
                  onClick={() => insertFunction('ROUND(')}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                >
                  ROUND()
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-sm font-medium text-gray-700">Opérateurs:</span>
                <button
                  type="button"
                  onClick={() => insertFunction(' + ')}
                  className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => insertFunction(' - ')}
                  className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => insertFunction(' * ')}
                  className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                >
                  ×
                </button>
                <button
                  type="button"
                  onClick={() => insertFunction(' / ')}
                  className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                >
                  ÷
                </button>
                <button
                  type="button"
                  onClick={() => insertFunction(' ** ')}
                  className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                >
                  ^
                </button>
              </div>
            </div>

            {/* Éditeur de formule */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Formule *
              </label>
              <textarea
                id="formule-editor"
                value={formuleForm.formule}
                onChange={(e) => handleFormuleFormChange('formule', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
                rows={6}
                placeholder="Ex: MONTANT_HT * (1 + TAUX_TVA / 100)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Utilisez les variables en MAJUSCULES, les fonctions mathématiques et les opérateurs
              </p>
            </div>

            {/* Test de la formule */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleTestFormule}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Tester la formule
              </button>
              {formuleResult && (
                <div className="flex-1 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-sm text-green-800">{formuleResult}</span>
                </div>
              )}
            </div>
          </div>

          {/* Variables utilisées */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Variables utilisées</h3>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {formuleForm.variables.map((variable, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  {variable}
                  <button
                    type="button"
                    onClick={() => handleRemoveFormuleVariable(index)}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            
            <div className="flex space-x-3">
              <input
                type="text"
                value={currentVariable}
                onChange={(e) => setCurrentVariable(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Nom de la variable (ex: MONTANT_HT)"
                onKeyPress={(e) => e.key === 'Enter' && handleAddFormuleVariable()}
              />
              <button
                type="button"
                onClick={handleAddFormuleVariable}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Ajouter
              </button>
            </div>
          </div>

          {/* Tests de la formule */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Tests de la formule</h3>
            
            <div className="space-y-3">
              {formuleForm.tests.map((test, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-700">Test {index + 1}:</span>
                    <span className="ml-2 text-sm text-gray-600">
                      {test.input} → {test.expected}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFormuleTest(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
              
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={currentTest.input}
                  onChange={(e) => setCurrentTest(prev => ({ ...prev, input: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Données d'entrée (JSON)"
                />
                <input
                  type="text"
                  value={currentTest.expected}
                  onChange={(e) => setCurrentTest(prev => ({ ...prev, expected: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Résultat attendu"
                />
                <button
                  type="button"
                  onClick={handleAddFormuleTest}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>

          {/* Documentation */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Documentation</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Documentation de la formule
              </label>
              <textarea
                value={formuleForm.documentation}
                onChange={(e) => handleFormuleFormChange('documentation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                rows={4}
                placeholder="Documentation détaillée de la formule, exemples d'utilisation, etc."
              />
            </div>
          </div>

          {/* Prévisualisation */}
          {showFormulePreview && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Prévisualisation de la formule</h3>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-green-900">{formuleForm.nom || 'Nom de la formule'}</h4>
                    <p className="text-sm text-green-800">{formuleForm.description || 'Description'}</p>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-green-700">Formule:</h5>
                    <code className="text-sm text-green-800 bg-green-100 p-2 rounded block mt-1 font-mono">
                      {formuleForm.formule || 'Aucune formule définie'}
                    </code>
                  </div>
                  
                  {formuleForm.variables.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-green-700">Variables:</h5>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formuleForm.variables.map((variable, index) => (
                          <span key={index} className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded">
                            {variable}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {formuleForm.documentation && (
                    <div>
                      <h5 className="text-sm font-medium text-green-700">Documentation:</h5>
                      <p className="text-sm text-green-800 mt-1">{formuleForm.documentation}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsFormuleModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleFormulePreview}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              {showFormulePreview ? 'Masquer' : 'Prévisualiser'}
            </button>
            <button
              type="button"
              onClick={handleCreateFormule}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Créer la formule
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        title="Ajouter un Template de Document"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Cette fonctionnalité permettrait de créer des templates de documents personnalisables.
          </p>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2">Fonctionnalités disponibles :</h4>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Éditeur WYSIWYG pour les templates</li>
              <li>• Variables dynamiques (&#123;&#123;NOM_CLIENT&#125;&#125;, &#123;&#123;DATE_FACTURE&#125;&#125;)</li>
              <li>• Styles CSS personnalisables</li>
              <li>• Prévisualisation en temps réel</li>
              <li>• Export PDF, Word, HTML</li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* Modal Ajouter une Règle Métier */}
      <Modal
        isOpen={isRegleModalOpen}
        onClose={() => setIsRegleModalOpen(false)}
        title="Ajouter une Règle Métier"
        size="xl"
      >
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {/* Informations de base */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Informations de base</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la règle *
                </label>
                <input
                  type="text"
                  value={regleForm.nom}
                  onChange={(e) => handleRegleFormChange('nom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Ex: Validation TVA obligatoire"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Module *
                </label>
                <select 
                  value={regleForm.module}
                  onChange={(e) => handleRegleFormChange('module', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Sélectionner un module</option>
                  <option value="factures">Factures</option>
                  <option value="clients">Clients</option>
                  <option value="articles">Articles</option>
                  <option value="fournisseurs">Fournisseurs</option>
                  <option value="inventaire">Inventaire</option>
                  <option value="comptabilite">Comptabilité</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={regleForm.description}
                onChange={(e) => handleRegleFormChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                rows={3}
                placeholder="Description de la règle métier et de son objectif"
              />
            </div>
          </div>

          {/* Configuration de la règle */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Configuration de la règle</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de règle *
                </label>
                <select 
                  value={regleForm.type}
                  onChange={(e) => handleRegleFormChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="validation">Validation</option>
                  <option value="calcul">Calcul automatique</option>
                  <option value="alerte">Alerte</option>
                  <option value="workflow">Workflow</option>
                  <option value="notification">Notification</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priorité
                </label>
                <input
                  type="number"
                  value={regleForm.priorite}
                  onChange={(e) => handleRegleFormChange('priorite', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="1"
                  min="1"
                  max="10"
                />
              </div>
            </div>
          </div>

          {/* Condition de la règle */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Condition de la règle</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expression de condition *
              </label>
              <textarea
                value={regleForm.condition}
                onChange={(e) => handleRegleFormChange('condition', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-sm"
                rows={4}
                placeholder="Ex: montant_ht > 1000 AND taux_tva = 0.19"
              />
              <p className="text-xs text-gray-500 mt-1">
                Utilisez les opérateurs: AND, OR, NOT, =, !=, &gt;, &lt;, &gt;=, &lt;=, IN, LIKE
              </p>
            </div>

            {/* Variables utilisées */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Variables utilisées
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {regleForm.variables.map((variable, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                    {variable}
                    <button
                      type="button"
                      onClick={() => handleRemoveVariable(index)}
                      className="ml-2 text-orange-600 hover:text-orange-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddVariable}
                className="px-3 py-1 text-sm text-orange-600 border border-orange-300 rounded-lg hover:bg-orange-50"
              >
                + Ajouter une variable
              </button>
            </div>
          </div>

          {/* Action de la règle */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Action à exécuter</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action à exécuter *
              </label>
              <textarea
                value={regleForm.action}
                onChange={(e) => handleRegleFormChange('action', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-sm"
                rows={4}
                placeholder="Ex: ALERT('TVA obligatoire pour montant > 1000 DZD')"
              />
              <p className="text-xs text-gray-500 mt-1">
                Actions disponibles: ALERT(), VALIDATE(), CALCULATE(), NOTIFY(), BLOCK()
              </p>
            </div>
          </div>

          {/* Tests de la règle */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Tests de la règle</h3>
            
            <div className="space-y-3">
              {regleForm.tests.map((test, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-700">Test {index + 1}:</span>
                    <span className="ml-2 text-sm text-gray-600">
                      {test.input} → {test.expected}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTest(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
              
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={currentTest.input}
                  onChange={(e) => setCurrentTest(prev => ({ ...prev, input: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Données d'entrée (JSON)"
                />
                <input
                  type="text"
                  value={currentTest.expected}
                  onChange={(e) => setCurrentTest(prev => ({ ...prev, expected: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Résultat attendu"
                />
                <button
                  type="button"
                  onClick={handleAddTest}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>

          {/* Paramètres avancés */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Paramètres avancés</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={regleForm.active}
                  onChange={(e) => handleRegleFormChange('active', e.target.checked)}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                  Règle active
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notifications"
                  checked={regleForm.notifications}
                  onChange={(e) => handleRegleFormChange('notifications', e.target.checked)}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="notifications" className="ml-2 text-sm text-gray-700">
                  Notifications activées
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="logExecution"
                  checked={regleForm.logExecution}
                  onChange={(e) => handleRegleFormChange('logExecution', e.target.checked)}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="logExecution" className="ml-2 text-sm text-gray-700">
                  Log des exécutions
                </label>
              </div>
            </div>
          </div>

          {/* Prévisualisation */}
          {showReglePreview && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Prévisualisation de la règle</h3>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-orange-900">{regleForm.nom || 'Nom de la règle'}</h4>
                    <p className="text-sm text-orange-800">{regleForm.description || 'Description'}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-orange-700">Condition:</h5>
                      <code className="text-xs text-orange-800 bg-orange-100 p-2 rounded block mt-1">
                        {regleForm.condition || 'Aucune condition définie'}
                      </code>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-orange-700">Action:</h5>
                      <code className="text-xs text-orange-800 bg-orange-100 p-2 rounded block mt-1">
                        {regleForm.action || 'Aucune action définie'}
                      </code>
                    </div>
                  </div>
                  
                  {regleForm.variables.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-orange-700">Variables:</h5>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {regleForm.variables.map((variable, index) => (
                          <span key={index} className="px-2 py-1 bg-orange-200 text-orange-800 text-xs rounded">
                            {variable}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsRegleModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleReglePreview}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              {showReglePreview ? 'Masquer' : 'Prévisualiser'}
            </button>
            <button
              type="button"
              onClick={handleCreateRegle}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Créer la règle
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isEntrepriseModalOpen}
        onClose={() => setIsEntrepriseModalOpen(false)}
        title="Ajouter une Entreprise"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Cette fonctionnalité permettrait de gérer plusieurs entreprises dans une seule interface.
          </p>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h4 className="font-semibold text-indigo-900 mb-2">Fonctionnalités disponibles :</h4>
            <ul className="text-sm text-indigo-800 space-y-1">
              <li>• Gestion multi-sociétés avec séparation des données</li>
              <li>• Plans comptables différents par entreprise</li>
              <li>• Devises multiples avec taux de change</li>
              <li>• Basculement rapide entre entreprises</li>
              <li>• Permissions par entreprise</li>
            </ul>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isConsolidationModalOpen}
        onClose={() => setIsConsolidationModalOpen(false)}
        title="Générer Consolidation"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Cette fonctionnalité permettrait de consolider automatiquement les comptes de toutes les entreprises.
          </p>
          <div className="bg-teal-50 p-4 rounded-lg">
            <h4 className="font-semibold text-teal-900 mb-2">Fonctionnalités disponibles :</h4>
            <ul className="text-sm text-teal-800 space-y-1">
              <li>• Consolidation automatique des comptes</li>
              <li>• Conversion des devises en devise de référence</li>
              <li>• Élimination des transactions inter-entreprises</li>
              <li>• Rapports consolidés automatiques</li>
              <li>• Comparaisons et analyses de groupe</li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ConfigurationAvancee;


