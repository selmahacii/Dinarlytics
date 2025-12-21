export type GroupeClient = {
  id: string;
  nom: string;
  description: string;
  type: 'secteur' | 'taille' | 'risque' | 'geographique';
  couleur: string;
  nombreClients: number;
  chiffreAffaires: number;
  soldeMoyen: number;
  clients: ClientParGroupe[];
};

export type ClientParGroupe = {
  id: string;
  nom: string;
  secteur: string;
  chiffreAffaires: number;
  solde: number;
  risque: 'faible' | 'moyen' | 'élevé';
};

export const mockGroupesClients: GroupeClient[] = [
  {
    id: 'g1',
    nom: 'Industrie légère',
    description: 'PME industrielles et manufacturières',
    type: 'secteur',
    couleur: 'blue',
    nombreClients: 8,
    chiffreAffaires: 9500000,
    soldeMoyen: 320000,
    clients: [
      { id: 'c1', nom: 'Alger Plast', secteur: 'Plastique', chiffreAffaires: 2500000, solde: 120000, risque: 'moyen' },
      { id: 'c2', nom: 'Oran Steel', secteur: 'Métallurgie', chiffreAffaires: 1800000, solde: -45000, risque: 'élevé' }
    ]
  },
  {
    id: 'g2',
    nom: 'Services B2B',
    description: 'Prestataires et cabinets',
    type: 'secteur',
    couleur: 'green',
    nombreClients: 6,
    chiffreAffaires: 5200000,
    soldeMoyen: 210000,
    clients: [
      { id: 'c3', nom: 'ConsultCorp', secteur: 'Conseil', chiffreAffaires: 1500000, solde: 90000, risque: 'faible' },
      { id: 'c4', nom: 'IT Services DZ', secteur: 'Tech', chiffreAffaires: 2200000, solde: 145000, risque: 'faible' }
    ]
  }
];

export const mockClientsParGroupe: ClientParGroupe[] = mockGroupesClients.reduce((acc: ClientParGroupe[], g) => [...acc, ...g.clients], []);

export const getAllClientsFromGroupes = (groupes: GroupeClient[]): ClientParGroupe[] =>
  groupes.reduce((acc: ClientParGroupe[], g) => [...acc, ...g.clients], []);
