import { Button } from "@headlessui/react";
import "./RetryState.css";

interface RetryStateProps {
  handleRetry: () => void;
}

export default function RetryState({ handleRetry }: RetryStateProps) {
  return (
    <div className="retry-state">
      <p className="retry-state__message" role="alert">
        We couldn't load your dashboard.
      </p>
      <Button
        className="retry-state__button"
        onClick={handleRetry}
      >
        Retry
      </Button>
    </div>
  );
}
