export enum CloudPage {
  Welcome = 'welcome',
  AboutUser = 'about-user',
  SignInExperience = 'sign-in-experience',
  Congrats = 'congrats',
}

export enum Project {
  Personal = 'personal',
  Company = 'company',
}

export enum DeploymentType {
  Opensource = 'opensource',
  Cloud = 'cloud',
}

export enum Title {
  Developer = 'developer',
  TeamLead = 'team-lead',
  Ceo = 'ceo',
  Cto = 'cto',
  Product = 'product',
  Others = 'others',
}

export enum CompanySize {
  Scale1 = '1',
  Scale2 = '1-49',
  Scale3 = '50-199',
  Scale4 = '200-999',
  Scale5 = '1000+',
}

export enum Reason {
  Adoption = 'adoption',
  Replacement = 'replacement',
  Evaluation = 'evaluation',
  Experimentation = 'experimentation',
  Aesthetics = 'aesthetics',
  Others = 'others',
}

export type Questionnaire = {
  project: Project;
  deploymentType: DeploymentType;
  titles: string[];
  companyName: string;
  companySize: string;
  reasons: string[];
};
