import type {
  SettlementPayment,
  SettlementSuggestion,
  SplitBalance,
} from '../types';
import { api } from '../lib/api';
import type { ApiEnvelope } from '../lib/finance-api-utils';

export const settlementApi = {
  async getSplitBalances(splitGroupId: string) {
    const response = await api.get<ApiEnvelope<SplitBalance[]>>(
      `/split-groups/${splitGroupId}/balances`,
    );
    return response.data.data;
  },
  async getSettlementSuggestions(splitGroupId: string) {
    const response = await api.get<ApiEnvelope<SettlementSuggestion[]>>(
      `/split-groups/${splitGroupId}/settlement-suggestions`,
    );
    return response.data.data;
  },
  async getSettlementPayments(splitGroupId: string) {
    const response = await api.get<ApiEnvelope<SettlementPayment[]>>(
      `/split-groups/${splitGroupId}/payments`,
    );
    return response.data.data;
  },
  async createSettlementPayment(
    splitGroupId: string,
    payload: Pick<
      SettlementPayment,
      'paid_by' | 'paid_to' | 'payment_date' | 'method' | 'client_request_id'
    > & { amount: string | number; note?: string },
  ) {
    const response = await api.post<ApiEnvelope<SettlementPayment>>(
      `/split-groups/${splitGroupId}/payments`,
      payload,
    );
    return response.data.data;
  },
  async confirmSettlementPayment(splitGroupId: string, paymentId: string) {
    const response = await api.post<ApiEnvelope<SettlementPayment>>(
      `/split-groups/${splitGroupId}/payments/${paymentId}/confirm`,
    );
    return response.data.data;
  },
  async rejectSettlementPayment(splitGroupId: string, paymentId: string) {
    const response = await api.post<ApiEnvelope<SettlementPayment>>(
      `/split-groups/${splitGroupId}/payments/${paymentId}/reject`,
    );
    return response.data.data;
  },
};
