import DashboardSkeleton from "./components/DashboardSkeleton/DashboardSkeleton";
import Header from "./components/Header/Header";
import RetryState from "./components/RetryState/RetryState";
import TransactionList from "./components/TransactionList/TransactionList";
import useCustomerDataQuery from "./hooks/useCustomerDataQuery";

export default function App() {
  const customerData = useCustomerDataQuery();

  return (
    <div className="starter">
      <Header customer={customerData.data?.customer} />
      <main className="starter-main">
        {customerData.isLoading ? (
          <DashboardSkeleton />
        ) : customerData.isError ? (
          <RetryState handleRetry={customerData.retry} />
        ) : (
          <>
            {customerData.data?.customer && (
              <h1>Good evening, {customerData.data?.customer.firstName}</h1>
            )}
            {customerData.data?.transactions && (
              <TransactionList transactions={customerData.data.transactions} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
