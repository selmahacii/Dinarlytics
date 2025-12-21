# Fix for FiscaliteDeclarations.tsx admin access

Replace lines 38-44 in `src/pages/rapports/FiscaliteDeclarations.tsx`:

## OLD CODE (blocking admins):
```tsx
const FiscaliteDeclarations: React.FC = () => {
  const { user, companyData, formatCurrency, currentDevise, currentCountry, fiscalRates, calculateTVA, getTVARate, fiscalDocuments } = useApp();
  const { has } = usePermission();
  const [selectedView, setSelectedView] = useState('vue-ensemble');
  // Garde d'accès minimale: nécessite au moins les rapports basiques
  if (!has('rapports-basic')) {
    return <RequirePermission permission="rapports-basic" />;
  }
```

## NEW CODE (allowing admins):
```tsx
const FiscaliteDeclarations: React.FC = () => {
  const { user, companyData, formatCurrency, currentDevise, currentCountry, fiscalRates, calculateTVA, getTVARate, fiscalDocuments } = useApp();
  const { has } = usePermission();
  const [selectedView, setSelectedView] = useState('vue-ensemble');
  
  const isAdmin = user?.role === 'admin' || has('admin');
  if (!has('rapports-basic') && !isAdmin) {
    return <RequirePermission permission="rapports-basic" />;
  }
```

This allows administrators to access fiscal declaration reports even if they don't have the specific `rapports-basic` permission.
