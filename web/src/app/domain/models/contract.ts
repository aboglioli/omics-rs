import { IPayment } from './payment';
import { IStatistics } from './statistics';
import { IPublication } from './publication';

export interface ISummary {
  statistics: IStatistics;
  total: number;
  amount: number;
  paid: boolean;
  from: string;
  to: string;
}

export interface IContractStatus {
  status: string;
  changed_at: string;
  changed_by: string;
}

export interface IContract {
  id: string;
  publication_id?: string;
  publication?: IPublication;
  summaries: ISummary[];
  payments: IPayment[];
  status: IContractStatus;
}
