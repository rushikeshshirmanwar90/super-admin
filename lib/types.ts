export interface Client {
  _id?: string;
  name: string;
  phoneNumber: number;
  email: string;
  password?: string;
  city: string;
  state: string;
  address: string;
  staffs?: string[];
  logo?: string;
  license?: number;
  isLicenseActive?: boolean;
  licenseExpiryDate?: Date | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardStats {
  totalClients: number;
  activeClients: number;
  expiredLicenses: number;
  recentClients?: Client[];
}

export interface AdminData {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  clientId: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ClientData = Client;
