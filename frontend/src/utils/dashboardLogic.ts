/**
 * Test et démonstration du système adaptatif de dashboard
 * 
 * Ce fichier montre comment le système détecte automatiquement
 * le type d'utilisateur et affiche le bon dashboard
 */

// ✅ BOUTIQUE EL BARAKA
export const boutiqueElBaraka = {
  id: '1',
  nom: 'Boutique El Baraka', 
  email: 'boutique@elbaraka.dz',
  role: 'admin',
  companyType: 'boutique', // ← Clé importante pour la détection
  revenue: 1200000,
  employees: 3,
  segment: 'micro'
};

// ✅ LOGIQUE DE REDIRECTION
export const getRedirectPath = (user: any): string => {
  // Si l'utilisateur est une boutique
  if (user.companyType === 'boutique' || user.nom.includes('Boutique')) {
    return '/dashboard/boutique'; // Dashboard spécialisé boutique
  }
  
  // Si c'est une pharmacie
  if (user.companyType === 'pharmacie' || user.nom.includes('Pharmacie')) {
    return '/dashboard/pharmacie';
  }
  
  // Si c'est un restaurant
  if (user.companyType === 'restaurant' || user.nom.includes('Restaurant')) {
    return '/dashboard/restaurant';
  }
  
  // Dashboard standard pour les autres
  return '/dashboard';
};

// ✅ TEST DE LA LOGIQUE
console.log('🧪 Tests de redirection:');
console.log('Boutique El Baraka →', getRedirectPath(boutiqueElBaraka)); // Should be /dashboard/boutique

export const testUsers = [
  {
    nom: 'Boutique El Baraka',
    companyType: 'boutique',
    expectedPath: '/dashboard/boutique'
  },
  {
    nom: 'Entreprise Standard SARL', 
    companyType: 'sarl',
    expectedPath: '/dashboard'
  },
  {
    nom: 'Pharmacie Salam',
    companyType: 'pharmacie', 
    expectedPath: '/dashboard/pharmacie'
  }
];

testUsers.forEach(user => {
  const path = getRedirectPath(user);
  const isCorrect = path === user.expectedPath;
  console.log(`${isCorrect ? '✅' : '❌'} ${user.nom} → ${path} (attendu: ${user.expectedPath})`);
});