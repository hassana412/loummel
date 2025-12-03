export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
}

export interface ContactInfo {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  socialLinks: SocialLinks;
}

export interface VendorShop {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  logo?: string;
  isVIP: boolean;
  products: Product[];
  services: Service[];
  contact: ContactInfo;
  owner: {
    name: string;
    email: string;
    phone: string;
    region: string;
    city: string;
  };
  subscription: {
    type: 'base' | 'seo' | 'whatsapp' | 'social' | 'vip';
    expiresAt: Date;
  };
  vipPromo?: {
    title: string;
    items: (Product | Service)[];
    discount?: number;
  };
  createdAt: Date;
}

export interface VendorRegistrationForm {
  // Step 1: Personal Info
  ownerName: string;
  email: string;
  phone: string;
  region: string;
  city: string;
  
  // Step 2: Shop Info
  shopName: string;
  shopCategory: string;
  shopDescription: string;
  shopLogo?: File;
  
  // Step 3: Products
  products: Omit<Product, 'id'>[];
  
  // Step 4: Services
  services: Omit<Service, 'id'>[];
  
  // Step 5: Contact
  contact: ContactInfo;
  
  // Step 6: Subscription
  subscriptionType: 'base' | 'seo' | 'whatsapp' | 'social' | 'vip';
}
