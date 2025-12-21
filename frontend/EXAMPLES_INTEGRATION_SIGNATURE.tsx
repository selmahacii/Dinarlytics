/**
 * GUIDE D'EXEMPLES - Signatures Électroniques et Codes QR
 * 
 * Ce fichier contient des exemples de code commentés.
 * Copiez les sections nécessaires dans vos pages réelles.
 * 
 * NOTE: Ce fichier ne sera pas compilé - il sert uniquement de référence.
 */

/* eslint-disable */
// @ts-nocheck

/**
 * EXEMPLES D'INTÉGRATION - À COPIER DANS VOS PAGES
 */

// ============================================================
// ÉTAPE 1: IMPORTS À AJOUTER EN HAUT DE LA PAGE
// ============================================================

// import DocumentWithSignatureDisplay from '../components/UI/DocumentWithSignatureDisplay';
// import BonDocument from '../components/Factures/BonDocument';
// import { DocumentSignature, DocumentQRMetadata } from '../types/index';

// ============================================================
// ÉTAPE 2: ÉTAT À AJOUTER
// ============================================================

// Dans le composant React:
const [documentSignatures, setDocumentSignatures] = useState<DocumentSignature[]>([]);
const [qrMetadata, setQrMetadata] = useState<DocumentQRMetadata | undefined>();

// ============================================================
// ÉTAPE 3: FONCTION UTILITAIRE À AJOUTER
// ============================================================

const generateQRMetadata = (facture: any): DocumentQRMetadata => {
  return {
    documentType: 'facture',
    documentId: facture.id || facture.numero,
    numero: facture.numero,
    date: facture.date || new Date().toISOString(),
    clientNom: facture.client,
    montantTotal: facture.total || 0,
    qrVersion: 'v1.0'
  };
};

// ============================================================
// ÉTAPE 4: HANDLER POUR SIGNATURE
// ============================================================

const handleSignatureAdded = (signature: DocumentSignature, qrData: string) => {
  // Ajouter la signature à la liste locale
  setDocumentSignatures(prev => [...prev, signature]);
  
  // Ici, appeler l'API pour sauvegarder la signature en base
  // await saveFactureSignature(selectedFacture.id, signature);
  
  // Afficher un toast de succès
  console.log('✅ Signature ajoutée:', signature.id);
};

// ============================================================
// ÉTAPE 5: EXEMPLE 1 - DANS LA MODALE DE DÉTAILS FACTURE
// ============================================================

// Remplacer la section détails de facture par:

{isDetailsModalOpen && selectedFacture && (
  <Modal
    isOpen={isDetailsModalOpen}
    onClose={() => setIsDetailsModalOpen(false)}
    title={`Facture ${selectedFacture.numero}`}
    size="lg"
  >
    <div className="space-y-6">
      {/* Détails facture existants */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold mb-3">Détails Facture</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <p><strong>Numéro:</strong> {selectedFacture.numero}</p>
          <p><strong>Date:</strong> {selectedFacture.date}</p>
          <p><strong>Client:</strong> {selectedFacture.client}</p>
          <p><strong>Montant:</strong> {selectedFacture.total?.toLocaleString('fr-DZ')} DA</p>
        </div>
      </div>

      {/* NOUVEAU: Signatures et QR */}
      <DocumentWithSignatureDisplay
        documentId={selectedFacture.id}
        documentNumber={selectedFacture.numero}
        documentType="facture"
        signatures={selectedFacture.signatures || []}
        qrMetadata={generateQRMetadata(selectedFacture)}
        currentUser={{
          email: currentUser.email || 'user@company.dz',
          nom: currentUser.nom || 'User',
          role: currentUser.role || 'Comptable'
        }}
        onSignatureAdded={handleSignatureAdded}
        showQR={true}
      />
    </div>
  </Modal>
)}

// ============================================================
// ÉTAPE 6: EXEMPLE 2 - BON DE COMMANDE
// ============================================================

// Si vous avez une page GestionCommandes.tsx:

const renderBonCommande = (bon: any) => {
  return (
    <BonDocument
      type="bon-commande"
      numero={bon.numero}
      date={bon.date}
      reference={bon.referenceClient}
      fournisseur={{
        nom: bon.fournisseurNom,
        adresse: bon.fournisseurAdresse,
        contact: bon.fournisseurContact
      }}
      articles={bon.articles.map(a => ({
        nom: a.nom,
        quantite: a.quantite,
        unite: a.unite || 'pcs',
        prixUnitaire: a.prixUnitaire,
        total: a.total
      }))}
      montantTotal={bon.montantTotal}
      statut={bon.statut}
      signatures={bon.signatures || []}
      qrMetadata={generateQRMetadata({
        ...bon,
        documentType: 'bon-commande'
      })}
      currentUser={{
        email: currentUser.email || 'user@company.dz',
        nom: currentUser.nom || 'User',
        role: currentUser.role || 'Manager'
      }}
      onSignatureAdded={(sig, qr) => {
        // Sauvegarder la signature du bon
        updateBonCommande(bon.id, { 
          signatures: [...(bon.signatures || []), sig],
          qrData: qr 
        });
      }}
      onPrint={() => {
        window.print();
      }}
      onExport={() => {
        // Exporter en PDF avec signatures
        exportBonToPDF(bon);
      }}
    />
  );
};

// ============================================================
// ÉTAPE 7: EXEMPLE 3 - BON DE LIVRAISON
// ============================================================

// Si vous avez une page GestionLivraisons.tsx:

const renderBonLivraison = (livraison: any) => {
  return (
    <BonDocument
      type="bon-livraison"
      numero={livraison.numero}
      date={livraison.date}
      reference={livraison.numeroCommande}
      client={{
        nom: livraison.clientNom,
        adresse: livraison.clientAdresse,
        contact: livraison.clientContact
      }}
      articles={livraison.articles.map(a => ({
        nom: a.nom,
        quantite: a.quantiteLivree,
        unite: a.unite || 'pcs'
      }))}
      montantTotal={0}  // Bons de livraison n'ont pas toujours montant
      statut={livraison.statut}
      signatures={livraison.signatures || []}
      currentUser={{
        email: currentUser.email || 'user@company.dz',
        nom: currentUser.nom || 'User',
        role: currentUser.role || 'Magasinier'
      }}
      onSignatureAdded={(sig, qr) => {
        updateBonLivraison(livraison.id, { 
          signatures: [...(livraison.signatures || []), sig]
        });
      }}
      onPrint={() => window.print()}
    />
  );
};

// ============================================================
// ÉTAPE 8: AJOUTER UN BOUTON POUR SIGNER EN LISTE
// ============================================================

// Dans le tableau des factures/bons, ajouter une colonne action:

const ActionColumn = ({ document, onSign }: any) => {
  const hasSignatures = document.signatures && document.signatures.length > 0;
  
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onSign(document)}
        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
        disabled={hasSignatures}
      >
        {hasSignatures ? '✓ Signé' : 'Signer'}
      </button>
    </div>
  );
};

// ============================================================
// ÉTAPE 9: SAUVEGARDER SIGNATURES EN BASE (BACKEND)
// ============================================================

// API call exemple:
const saveFactureSignature = async (factureId: string, signature: DocumentSignature) => {
  try {
    const response = await fetch(`/api/factures/${factureId}/signatures`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signature)
    });
    return await response.json();
  } catch (error) {
    console.error('Erreur signature:', error);
    throw error;
  }
};

// ============================================================
// ÉTAPE 10: IMPRIMER AVEC SIGNATURES ET QR
// ============================================================

const printDocumentWithSignatures = () => {
  const printWindow = window.open('', '', 'width=800,height=600');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>${selectedFacture.numero}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .articles { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .articles th, .articles td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            .articles th { background-color: #f0f0f0; font-weight: bold; }
            .signatures { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; }
            .signature-box { display: inline-block; margin-right: 40px; min-width: 200px; }
            .qr { text-align: center; margin-top: 20px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${selectedFacture.numero}</h1>
            <p>Date: ${selectedFacture.date}</p>
          </div>
          
          <div class="details">
            <div>
              <strong>Client:</strong><br/>
              ${selectedFacture.client}<br/>
              ${selectedFacture.adresseClient || ''}
            </div>
            <div>
              <strong>Détails:</strong><br/>
              Montant: ${selectedFacture.total?.toLocaleString('fr-DZ')} DA<br/>
              Statut: ${selectedFacture.statut}
            </div>
          </div>

          ${selectedFacture.signatures ? `
            <div class="signatures">
              <h3>Signatures Électroniques</h3>
              ${selectedFacture.signatures.map(sig => `
                <div class="signature-box">
                  <p><strong>${sig.nom}</strong></p>
                  <p style="font-size: 12px; color: #666;">${sig.role}</p>
                  <img src="${sig.signatureData}" style="height: 50px;" />
                  <p style="font-size: 10px; color: #999;">${new Date(sig.signedDate).toLocaleDateString('fr-DZ')}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <div class="qr">
            <p style="font-size: 12px; color: #666;">Code QR d'authentification</p>
            <img src="[QR_CODE_URL]" style="width: 100px; height: 100px;" />
          </div>

          <p style="text-align: center; font-size: 10px; color: #999; margin-top: 40px;">
            Document généré le ${new Date().toLocaleString('fr-DZ')} - Avec signatures électroniques et code QR
          </p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
};

export {
  DocumentWithSignatureDisplay,
  BonDocument,
  generateQRMetadata,
  handleSignatureAdded,
  saveFactureSignature,
  printDocumentWithSignatures
};
