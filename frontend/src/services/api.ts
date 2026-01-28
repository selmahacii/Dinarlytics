/**
 * Unified API Entry Point (Clean Architecture)
 * Re-exports modular services for structured data access.
 */

// Import all modular services
export { authService } from './modules/authService';
export { clientsService } from './modules/clientsService';
export { suppliersService } from './modules/suppliersService';
export { invoiceService } from './modules/invoiceService';
export { analyticService } from './modules/analyticService';
export { auditService } from './modules/auditService';

import { authService } from './modules/authService';
import { clientsService } from './modules/clientsService';
import { suppliersService } from './modules/suppliersService';
import { invoiceService } from './modules/invoiceService';
import { analyticService } from './modules/analyticService';
import { auditService } from './modules/auditService';

// Legacy mapping for compatibility
export {
  authService as auth,
  clientsService as clients,
  suppliersService as suppliers,
  invoiceService as invoices,
  analyticService as analytics,
  auditService as audits
};

export default {
  auth: authService,
  clients: clientsService,
  suppliers: suppliersService,
  invoices: invoiceService,
  analytics: analyticService,
  audits: auditService
};
