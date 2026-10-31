import { useQuery } from "@tanstack/react-query";
import type {
  Account,
  AccountsResponse,
  Customer,
  CustomerResponse,
  Transaction,
  TransactionsResponse,
} from "../api/types";
import { apiFetch } from "../api/client";

interface CustomerData {
  customer: Customer;
  accounts: Account[];
  transactions: Transaction[];
}

interface UseCustomerDataQueryResult {
  isError: boolean;
  isLoading: boolean;
  data: CustomerData | null;
  retry: () => void;
}

export default function useCustomerDataQuery(): UseCustomerDataQueryResult {
  const customerResponse = useQuery<CustomerResponse>({
    queryKey: ["customer"],
    queryFn: () => apiFetch<CustomerResponse>("/api/customer"),
  });
  const accountsResponse = useQuery<AccountsResponse>({
    queryKey: ["accounts"],
    queryFn: () => apiFetch<AccountsResponse>("/api/accounts"),
  });
  const transactionsResponse = useQuery<TransactionsResponse>({
    queryKey: ["transactions"],
    queryFn: () => apiFetch<TransactionsResponse>("/api/transactions"),
  });

  function retry() {
    Promise.all([
      customerResponse.refetch,
      accountsResponse.refetch,
      transactionsResponse.refetch,
    ]);
  }

  if (
    customerResponse.isError ||
    accountsResponse.isError ||
    transactionsResponse.isError
  ) {
    return { isError: true, isLoading: false, data: null, retry };
  }

  const customer = customerResponse.data?.customer;
  const accounts = accountsResponse.data?.accounts;
  const transactions = transactionsResponse.data?.transactions;

  if (!customer || !accounts || !transactions) {
    return { isError: false, isLoading: true, data: null, retry };
  }

  return {
    isError: false,
    isLoading: false,
    data: { customer, accounts, transactions },
    retry,
  };
}
