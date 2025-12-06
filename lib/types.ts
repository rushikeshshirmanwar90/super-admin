export interface ClientData {
  _id?: string;
  name: string;
  phoneNumber: string;
  email: string;
  city: string;
  state: string;
  address: string;
  logo: string;
}

export interface AdminData {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  clientId: string;
}
