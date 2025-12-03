export interface PartnerCoverage {
  region: string;
  departments: string[];
  arrondissements: string[];
  intercommunautaire: boolean;
}

export interface RecruitmentGoals {
  perDay: number;
  perWeek: number;
  perMonth: number;
  perYear: number;
}

export interface CommissionEstimate {
  perShop: number;
  perWeek: number;
  perMonth: number;
  perYear: number;
}

export interface BonusLevel {
  threshold: number;
  bonusPercentage: number;
  label: string;
}

export const BONUS_LEVELS: BonusLevel[] = [
  { threshold: 10, bonusPercentage: 5, label: "Bronze" },
  { threshold: 30, bonusPercentage: 10, label: "Silver" },
  { threshold: 50, bonusPercentage: 15, label: "VIP Gold" }
];

export const COMMISSION_RATE = 0.15; // 15%
export const BASE_SUBSCRIPTION_PRICE = 5000; // FCFA

export interface Partner {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo?: string;
  coverage: PartnerCoverage;
  recruitmentGoals: RecruitmentGoals;
  commissionEstimate: CommissionEstimate;
  currentBonus: BonusLevel | null;
  createdAt: Date;
}

export interface PartnerRegistrationForm {
  name: string;
  email: string;
  phone: string;
  photo?: File;
  coverage: PartnerCoverage;
  dailyRecruitment: number;
}
