export interface User {
  id: string;
  name: string;
  email: string;
  address?: string;
  role?: 'CUSTOMER' | 'ADMIN' | 'ROUTE_MANAGER';
}
