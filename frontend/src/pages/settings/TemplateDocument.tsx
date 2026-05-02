import React, { useState, useEffect, useRef } from 'react';
import { 
  DocumentTextIcon, 
  PlusIcon, 
  PencilIcon, 
  EyeIcon, 
  TrashIcon, 
  ArrowDownTrayIcon,
  PrinterIcon,
  CogIcon,
  CodeBracketIcon,
  DocumentArrowDownIcon,
  ClipboardDocumentListIcon,
  PaintBrushIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon,
  FolderIcon,
  DocumentIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import Card from '@shared/components/UI/Card';
import Modal from '@shared/components/UI/Modal';
import { useApp } from '@core/context/AppContext';

const TemplateDocument: React.FC = () => {
  const { formatCurrency } = useApp();
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isVariableModalOpen, setIsVariableModalOpen] = useState(false);
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Éditeur WYSIWYG
  const [editorContent, setEditorContent] = useState('');
  const [editorMode, setEditorMode] = useState('wysiwyg'); // wysiwyg, html, css
  const [cssStyles, setCssStyles] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  // Variables dynamiques
  const [availableVariables, setAvailableVariables] = useState([
    { name: 'NOM_CLIENT', description: 'Nom du client', example: 'Entreprise ABC' },
    { name: 'DATE_FACTURE', description: 'Date de la facture', example: '22/09/2024' },
    { name: 'MONTANT_TOTAL', description: 'Montant total', example: '1,250.00 DA' },
    { name: 'NUMERO_FACTURE', description: 'Numéro de facture', example: 'FAC-2024-001' },
    { name: 'ADRESSE_CLIENT', description: 'Adresse du client', example: '123 Rue Example' },
    { name: 'TELEPHONE_CLIENT', description: 'Téléphone client', example: '+213 123 456 789' },
    { name: 'EMAIL_CLIENT', description: 'Email client', example: 'client@example.com' },
    { name: 'NOM_ENTREPRISE', description: 'Nom de votre entreprise', example: 'Dinarlytic SARL' },
    { name: 'ADRESSE_ENTREPRISE', description: 'Adresse entreprise', example: '456 Business Street' },
    { name: 'SIRET', description: 'Numéro SIRET', example: '12345678901234' },
    { name: 'TVA_NUMBER', description: 'Numéro TVA', example: 'DZ123456789' },
    { name: 'DATE_CREATION', description: 'Date de création', example: '22/09/2024' },
    { name: 'SIGNATURE', description: 'Signature', example: 'Signature électronique' }
  ]);

  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Données de démonstration pour les templates
  const initialTemplates = [
    {
      id: 1,
      name: 'Facture Standard',
      category: 'Facturation',
      description: 'Template de facture avec en-tête personnalisé',
      content: `
        <div class="invoice-template">
          <div class="header">
            <h1>{{NOM_ENTREPRISE}}</h1>
            <p>{{ADRESSE_ENTREPRISE}}</p>
            <p>SIRET: {{SIRET}} | TVA: {{TVA_NUMBER}}</p>
          </div>
          <div class="client-info">
            <h3>Facturé à:</h3>
            <p><strong>{{NOM_CLIENT}}</strong></p>
            <p>{{ADRESSE_CLIENT}}</p>
            <p>Tél: {{TELEPHONE_CLIENT}}</p>
            <p>Email: {{EMAIL_CLIENT}}</p>
          </div>
          <div class="invoice-details">
            <h3>Facture #{{NUMERO_FACTURE}}</h3>
            <p>Date: {{DATE_FACTURE}}</p>
          </div>
          <div class="amount">
            <h2>Total: {{MONTANT_TOTAL}}</h2>
          </div>
          <div class="signature">
            <p>Signature: {{SIGNATURE}}</p>
            <p>Date: {{DATE_CREATION}}</p>
          </div>
        </div>
      `,
      css: `
        .invoice-template {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .client-info {
          background: #f5f5f5;
          padding: 15px;
          margin-bottom: 20px;
        }
        .invoice-details {
          text-align: right;
          margin-bottom: 20px;
        }
        .amount {
          text-align: right;
          font-size: 24px;
          font-weight: bold;
          color: #2c5aa0;
          margin: 30px 0;
        }
        .signature {
          margin-top: 50px;
          text-align: right;
        }
      `,
      createdAt: '2024-01-15',
      lastModified: '2024-01-20',
      usageCount: 45,
      isActive: true
    },
    {
      id: 2,
      name: 'Devis Commercial',
      category: 'Commercial',
      description: 'Template de devis avec tableau de produits',
      content: `
        <div class="quote-template">
          <div class="header">
            <h1>{{NOM_ENTREPRISE}}</h1>
            <h2>DEVIS</h2>
          </div>
          <div class="client-section">
            <h3>Client: {{NOM_CLIENT}}</h3>
            <p>{{ADRESSE_CLIENT}}</p>
          </div>
          <div class="quote-details">
            <p><strong>Devis #{{NUMERO_FACTURE}}</strong></p>
            <p>Date: {{DATE_FACTURE}}</p>
            <p>Validité: 30 jours</p>
          </div>
          <div class="products-table">
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Quantité</th>
                  <th>Prix unitaire</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Produit/Service</td>
                  <td>1</td>
                  <td>{{MONTANT_TOTAL}}</td>
                  <td>{{MONTANT_TOTAL}}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="total-section">
            <h3>Total TTC: {{MONTANT_TOTAL}}</h3>
          </div>
        </div>
      `,
      css: `
        .quote-template {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #2c5aa0;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h2 {
          color: #2c5aa0;
          font-size: 28px;
        }
        .products-table {
          margin: 30px 0;
        }
        .products-table table {
          width: 100%;
          border-collapse: collapse;
        }
        .products-table th,
        .products-table td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        .products-table th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        .total-section {
          text-align: right;
          font-size: 20px;
          font-weight: bold;
          color: #2c5aa0;
          margin-top: 30px;
        }
      `,
      createdAt: '2024-01-10',
      lastModified: '2024-01-18',
      usageCount: 23,
      isActive: true
    },
    {
      id: 3,
      name: 'Lettre de Relance',
      category: 'Commercial',
      description: 'Template de relance pour factures impayées',
      content: `
        <div class="reminder-letter">
          <div class="header">
            <h1>{{NOM_ENTREPRISE}}</h1>
            <p>{{ADRESSE_ENTREPRISE}}</p>
          </div>
          <div class="date">
            <p>{{DATE_CREATION}}</p>
          </div>
          <div class="client-address">
            <p>{{NOM_CLIENT}}</p>
            <p>{{ADRESSE_CLIENT}}</p>
          </div>
          <div class="subject">
            <h3>Objet: Relance facture {{NUMERO_FACTURE}}</h3>
          </div>
          <div class="content">
            <p>Madame, Monsieur,</p>
            <p>Nous vous informons que la facture {{NUMERO_FACTURE}} d'un montant de {{MONTANT_TOTAL}} 
            émise le {{DATE_FACTURE}} n'a pas encore été réglée.</p>
            <p>Nous vous remercions de bien vouloir procéder au règlement dans les plus brefs délais.</p>
            <p>Cordialement,</p>
            <p>{{NOM_ENTREPRISE}}</p>
          </div>
        </div>
      `,
      css: `
        .reminder-letter {
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          line-height: 1.6;
        }
        .header {
          text-align: center;
          border-bottom: 1px solid #ccc;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        .client-address {
          margin-bottom: 20px;
        }
        .subject {
          font-weight: bold;
          margin-bottom: 20px;
          color: #d32f2f;
        }
        .content p {
          margin-bottom: 15px;
        }
      `,
      createdAt: '2024-01-05',
      lastModified: '2024-01-12',
      usageCount: 12,
      isActive: true
    },
    {
      id: 4,
      name: 'Contrat de Service',
      category: 'Juridique',
      description: 'Template de contrat de prestation de service',
      content: `
        <div class="contract-template">
          <div class="header">
            <h1>CONTRAT DE PRESTATION DE SERVICE</h1>
          </div>
          <div class="parties">
            <h3>Entre les soussignés :</h3>
            <p><strong>{{NOM_ENTREPRISE}}</strong>, société au capital de X DA, 
            immatriculée au RCS sous le numéro {{SIRET}}, 
            dont le siège social est situé {{ADRESSE_ENTREPRISE}}</p>
            <p>ET</p>
            <p><strong>{{NOM_CLIENT}}</strong>, {{ADRESSE_CLIENT}}</p>
          </div>
          <div class="object">
            <h3>Objet du contrat :</h3>
            <p>Le présent contrat a pour objet la réalisation de [DÉCRIRE LES PRESTATIONS] 
            pour un montant total de {{MONTANT_TOTAL}}.</p>
          </div>
          <div class="terms">
            <h3>Modalités :</h3>
            <p>Date de début : {{DATE_CREATION}}</p>
            <p>Date de fin : [DATE_FIN]</p>
            <p>Paiement : [MODALITÉS_PAIEMENT]</p>
          </div>
          <div class="signatures">
            <div class="signature-block">
              <p>Le Prestataire</p>
              <p>{{NOM_ENTREPRISE}}</p>
              <p>Signature : {{SIGNATURE}}</p>
            </div>
            <div class="signature-block">
              <p>Le Client</p>
              <p>{{NOM_CLIENT}}</p>
              <p>Signature : _________________</p>
            </div>
          </div>
        </div>
      `,
      css: `
        .contract-template {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          line-height: 1.6;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .parties, .object, .terms {
          margin-bottom: 25px;
        }
        .signatures {
          display: flex;
          justify-content: space-between;
          margin-top: 50px;
        }
        .signature-block {
          width: 45%;
          text-align: center;
          border-top: 1px solid #ccc;
          padding-top: 20px;
        }
      `,
      createdAt: '2024-01-08',
      lastModified: '2024-01-15',
      usageCount: 8,
      isActive: true
    }
  ];

  useEffect(() => {
    setTemplates(initialTemplates);
  }, []);

  const categories = [
    { id: 'all', name: 'Tous', count: initialTemplates.length },
    { id: 'Facturation', name: 'Facturation', count: 1 },
    { id: 'Commercial', name: 'Commercial', count: 2 },
    { id: 'Juridique', name: 'Juridique', count: 1 }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateTemplate = () => {
    setIsCreateModalOpen(true);
  };

  const handleConfirmCreateTemplate = (templateData: any) => {
    const newTemplate = {
      id: Date.now(),
      name: templateData.name || 'Nouveau Template',
      category: templateData.category || 'Autre',
      description: templateData.description || 'Template personnalisé',
      content: templateData.content || '<div class="template"><h1>{{NOM_ENTREPRISE}}</h1><p>Contenu du template...</p></div>',
      css: templateData.css || '.template { font-family: Arial, sans-serif; padding: 20px; }',
      createdAt: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      usageCount: 0,
      isActive: true
    };
    setTemplates([newTemplate, ...templates]);
    setSelectedTemplate(newTemplate);
    setIsCreateModalOpen(false);
    setIsEditorOpen(true);
  };

  const handleEditTemplate = (template: any) => {
    setSelectedTemplate(template);
    setEditorContent(template.content);
    setCssStyles(template.css);
    setIsEditorOpen(true);
  };

  const handleSaveTemplate = () => {
    if (selectedTemplate) {
      const updatedTemplate = {
        ...selectedTemplate,
        content: editorContent,
        css: cssStyles,
        lastModified: new Date().toISOString().split('T')[0]
      };
      setTemplates(templates.map(t => t.id === selectedTemplate.id ? updatedTemplate : t));
      setSelectedTemplate(updatedTemplate);
      setIsEditorOpen(false);
    }
  };

  const handlePreviewTemplate = (template: any) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };

  const handleInsertVariable = (variable: string) => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(`{{${variable}}}`));
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
    setIsVariableModalOpen(false);
  };

  const processTemplate = (content: string, variables: any = {}) => {
    let processedContent = content;
    availableVariables.forEach(variable => {
      const value = variables[variable.name] || variable.example;
      processedContent = processedContent.replace(
        new RegExp(`{{${variable.name}}}`, 'g'), 
        value
      );
    });
    return processedContent;
  };

  const handleExport = (format: string) => {
    if (selectedTemplate) {
      const processedContent = processTemplate(selectedTemplate.content);
      alert(`Export du template en format ${format} en cours...`);
      // Ici on implémenterait la logique d'export réelle
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Facturation': return 'bg-blue-100 text-blue-800';
      case 'Commercial': return 'bg-green-100 text-green-800';
      case 'Juridique': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">Templates de Documents</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Créez et gérez vos templates de documents personnalisables</p>
        </div>
        <div className="text-left sm:text-right bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
            {currentTime.toLocaleTimeString('fr-FR')}
          </div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
            {templates.length} templates disponibles
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Templates</p>
              <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <PlayIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Utilisés</p>
              <p className="text-2xl font-bold text-gray-900">
                {templates.reduce((sum, t) => sum + t.usageCount, 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Actifs</p>
              <p className="text-2xl font-bold text-gray-900">
                {templates.filter(t => t.isActive).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <SparklesIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Variables</p>
              <p className="text-2xl font-bold text-gray-900">{availableVariables.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtres et contrôles */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un template..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-64"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.count})
              </option>
            ))}
          </select>

          <button
            onClick={handleCreateTemplate}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nouveau Template
          </button>
        </div>
      </Card>

      {/* Liste des templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <DocumentIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                {template.category}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Utilisé:</span>
                <span className="font-medium">{template.usageCount} fois</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Modifié:</span>
                <span className="font-medium">{template.lastModified}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Statut:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  template.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {template.isActive ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleEditTemplate(template)}
                className="flex-1 flex items-center justify-center px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-black text-[10px] uppercase tracking-widest shadow-md"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Éditer
              </button>
              
              <button
                onClick={() => handlePreviewTemplate(template)}
                className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
                title="Aperçu"
              >
                <EyeIcon className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => handleExport('PDF')}
                className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all"
                title="Exporter"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal Éditeur WYSIWYG */}
      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={`Éditeur - ${selectedTemplate?.name || 'Nouveau Template'}`}
        size="xl"
      >
        <div className="space-y-6">
          {/* Barre d'outils */}
          <div className="flex flex-wrap items-center gap-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <button
              onClick={() => setEditorMode('wysiwyg')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                editorMode === 'wysiwyg' 
                  ? 'bg-slate-700 text-white shadow-md' 
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              WYSIWYG
            </button>
            <button
              onClick={() => setEditorMode('html')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                editorMode === 'html' 
                  ? 'bg-slate-700 text-white shadow-md' 
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              HTML
            </button>
            <button
              onClick={() => setEditorMode('css')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                editorMode === 'css' 
                  ? 'bg-slate-700 text-white shadow-md' 
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              CSS
            </button>
            
            <div className="border-l border-slate-300 mx-2 h-6"></div>
            
            <button
              onClick={() => setIsVariableModalOpen(true)}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <CodeBracketIcon className="h-4 w-4 mr-2" />
              Variables
            </button>
            
            <button
              onClick={() => setIsStyleModalOpen(true)}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <PaintBrushIcon className="h-4 w-4 mr-2" />
              Styles
            </button>
            
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              {isPreviewMode ? 'Éditer' : 'Prévisualiser'}
            </button>
          </div>

          {/* Zone d'édition */}
          <div className="border border-slate-300 rounded-xl shadow-sm">
            {isPreviewMode ? (
              <div 
                className="p-6 min-h-96 bg-white"
                dangerouslySetInnerHTML={{ 
                  __html: processTemplate(editorContent) + `<style>${cssStyles}</style>` 
                }}
              />
            ) : (
              <div className="space-y-4">
                {editorMode === 'wysiwyg' && (
                  <div
                    ref={editorRef}
                    contentEditable
                    className="p-6 min-h-96 border-b border-slate-200 focus:outline-none bg-white"
                    onInput={(e) => setEditorContent(e.currentTarget.innerHTML)}
                    dangerouslySetInnerHTML={{ __html: editorContent }}
                  />
                )}
                {editorMode === 'html' && (
                  <textarea
                    value={editorContent}
                    onChange={(e) => setEditorContent(e.target.value)}
                    className="w-full p-4 min-h-96 font-mono text-sm border-0 focus:outline-none bg-slate-50 text-slate-800"
                    placeholder="Contenu HTML..."
                  />
                )}
                {editorMode === 'css' && (
                  <textarea
                    value={cssStyles}
                    onChange={(e) => setCssStyles(e.target.value)}
                    className="w-full p-4 min-h-96 font-mono text-sm border-0 focus:outline-none bg-slate-50 text-slate-800"
                    placeholder="Styles CSS..."
                  />
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              onClick={() => setIsEditorOpen(false)}
              className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all duration-200 font-medium border border-slate-300"
            >
              Annuler
            </button>
            <button
              onClick={handleSaveTemplate}
              className="px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-lg hover:from-slate-800 hover:to-slate-900 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
            >
              Sauvegarder
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Variables */}
      <Modal
        isOpen={isVariableModalOpen}
        onClose={() => setIsVariableModalOpen(false)}
        title="Variables Dynamiques"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-slate-600 mb-4">
            Cliquez sur une variable pour l'insérer dans votre template :
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableVariables.map((variable) => (
              <button
                key={variable.name}
                onClick={() => handleInsertVariable(variable.name)}
                className="p-4 text-left border border-slate-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="font-mono text-sm text-emerald-600 font-semibold">{`{{${variable.name}}}`}</div>
                <div className="text-sm text-slate-700 mt-1">{variable.description}</div>
                <div className="text-xs text-slate-500 mt-1">Ex: {variable.example}</div>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Modal Styles */}
      <Modal
        isOpen={isStyleModalOpen}
        onClose={() => setIsStyleModalOpen(false)}
        title="Styles CSS"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-slate-600 mb-4">
            Personnalisez l'apparence de votre template avec CSS :
          </p>
          <textarea
            value={cssStyles}
            onChange={(e) => setCssStyles(e.target.value)}
            className="w-full p-4 h-64 font-mono text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-slate-50 text-slate-800"
            placeholder="/* Styles CSS personnalisés */"
          />
          <div className="flex justify-end pt-4 border-t border-slate-200">
            <button
              onClick={() => setIsStyleModalOpen(false)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
            >
              Appliquer
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Prévisualisation */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={`Prévisualisation - ${selectedTemplate?.name || 'Template'}`}
        size="xl"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <button
                onClick={() => handleExport('PDF')}
                className="flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Export PDF
              </button>
              <button
                onClick={() => handleExport('Word')}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                Export Word
              </button>
              <button
                onClick={() => handleExport('HTML')}
                className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <CodeBracketIcon className="h-4 w-4 mr-2" />
                Export HTML
              </button>
            </div>
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Fermer
            </button>
          </div>
          
          <div className="border border-gray-300 rounded-lg p-6 bg-white">
            <div 
              dangerouslySetInnerHTML={{ 
                __html: selectedTemplate ? processTemplate(selectedTemplate.content) + `<style>${selectedTemplate.css}</style>` : '' 
              }}
            />
          </div>
        </div>
      </Modal>

      {/* Modal Création de Template */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nouveau Template de Document"
        size="lg"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Créer un Template</h3>
            <p className="text-sm text-blue-700">Créez un nouveau template de document personnalisé</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                Nom du template <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="templateName"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
                placeholder="Ex: Facture Standard"
              />
              <p className="text-xs text-gray-500">Nom descriptif pour identifier le template</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                Catégorie <span className="text-red-500">*</span>
              </label>
              <select
                id="templateCategory"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
              >
                <option value="Factures">📄 Factures</option>
                <option value="Devis">📋 Devis</option>
                <option value="Reçus">🧾 Reçus</option>
                <option value="Contrats">📝 Contrats</option>
                <option value="Rapports">📊 Rapports</option>
                <option value="Autre">📁 Autre</option>
              </select>
              <p className="text-xs text-gray-500">Catégorie du document</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">Description</label>
              <textarea
                id="templateDescription"
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors resize-none"
                placeholder="Description du template..."
              />
              <p className="text-xs text-gray-500">Description optionnelle du template</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                Contenu HTML <span className="text-red-500">*</span>
              </label>
              <textarea
                id="templateContent"
                rows={6}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors font-mono resize-none"
                placeholder="<div class='template'>
  <h1>{{NOM_ENTREPRISE}}</h1>
  <p>Adresse: {{ADRESSE_ENTREPRISE}}</p>
  <p>Date: {{DATE_FACTURE}}</p>
  <!-- Contenu du template -->
</div>"
              />
              <p className="text-xs text-slate-500">Structure HTML du template avec variables {`{{VARIABLE}}`}</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">Styles CSS</label>
              <textarea
                id="templateCss"
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors font-mono resize-none"
                placeholder=".template {
  font-family: Arial, sans-serif;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.template h1 {
  color: #2563eb;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 10px;
}"
              />
              <p className="text-xs text-slate-500">Styles CSS personnalisés pour le template</p>
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h4 className="font-medium text-amber-900 mb-2">Variables disponibles</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><code className="bg-amber-100 px-1 rounded text-amber-800">{`{{NOM_ENTREPRISE}}`}</code></div>
              <div><code className="bg-amber-100 px-1 rounded text-amber-800">{`{{ADRESSE_ENTREPRISE}}`}</code></div>
              <div><code className="bg-amber-100 px-1 rounded text-amber-800">{`{{DATE_FACTURE}}`}</code></div>
              <div><code className="bg-amber-100 px-1 rounded text-amber-800">{`{{NOM_CLIENT}}`}</code></div>
              <div><code className="bg-amber-100 px-1 rounded text-amber-800">{`{{MONTANT_TOTAL}}`}</code></div>
              <div><code className="bg-amber-100 px-1 rounded text-amber-800">{`{{NUMERO_FACTURE}}`}</code></div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Annuler
            </button>
            <button
              onClick={() => {
                const name = (document.getElementById('templateName') as HTMLInputElement)?.value;
                const category = (document.getElementById('templateCategory') as HTMLSelectElement)?.value;
                const description = (document.getElementById('templateDescription') as HTMLTextAreaElement)?.value;
                const content = (document.getElementById('templateContent') as HTMLTextAreaElement)?.value;
                const css = (document.getElementById('templateCss') as HTMLTextAreaElement)?.value;
                
                if (!name) {
                  alert('Le nom du template est requis');
                  return;
                }
                
                handleConfirmCreateTemplate({
                  name,
                  category,
                  description,
                  content,
                  css
                });
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Créer le Template
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TemplateDocument;


