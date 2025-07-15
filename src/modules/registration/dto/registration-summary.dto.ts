export class RegistrantSummaryDto {
  registrationId: string;
  fullName: string;
  institution: string;
  committeePreference1: string;
  committeePreference2?: string;
  portfolioPreference1ForCommitteePreference1: string;
  portfolioPreference2ForCommitteePreference1?: string;
  portfolioPreference1ForCommitteePreference2: string;
  portfolioPreference2ForCommitteePreference2?: string;
  allotmentStatus: 'not_allotted' | 'allotted';
  allottedCommittee?: string; 
  allottedPortfolio?: string;
}