# Fix for FacturesVente.tsx crash

Replace lines 5388-5390 in `src/pages/FacturesVente.tsx`:

## OLD CODE (causing crash):
```tsx
{paiements.filter((p: any) => p.facture === selectedFacture.numero).length > 0 ? (
  <div className="space-y-3">
    {paiements.filter((p: any) => p.facture === selectedFacture.numero).map((paiement: any) => (
```

## NEW CODE (fixed):
```tsx
{(selectedFacture.paiements || []).filter((p: any) => p.facture === selectedFacture.numero).length > 0 ? (
  <div className="space-y-3">
    {(selectedFacture.paiements || []).filter((p: any) => p.facture === selectedFacture.numero).map((paiement: any) => (
```

This fixes the undefined `paiements` variable error by using the payments array from `selectedFacture` with a safe fallback to empty array.
