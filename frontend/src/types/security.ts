export type Segment = 'micro' | 'small' | 'medium' | 'large' | 'enterprise';

export interface ModuleDef {
  id: string;
  name: string;
  route?: string;
  requiredPermission: string;
  minSegment?: Segment; // optional minimum segment to show module
  companyTypes?: string[]; // optional company type filter
  dataNeeds: string[]; // IDs of data domains needed
}

export interface DataDomainDef {
  id: string;
  name: string;
  description?: string;
  fields: string[]; // expected keys in companyData or related services
}

export interface RoleDataNeeds {
  roleId: string;
  baseNeeds: string[]; // data domain IDs
  bySegment?: Partial<Record<Segment, string[]>>; // extra needs per segment
}
