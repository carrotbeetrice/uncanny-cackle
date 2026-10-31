import Header from "./components/Header/Header";
import useCustomerDataQuery from "./hooks/useCustomerDataQuery";

export default function App() {
  const customerData = useCustomerDataQuery();

  if (customerData.isLoading) {
    return <>Placeholder</>;
  }

  return (
    <div className="starter">
      <Header customer={customerData.data?.customer} />
      <main className="starter-main">
        <h1>Build the dashboard and transfer flow</h1>
        <p>Hello world!</p>
      </main>
    </div>
  );
}
