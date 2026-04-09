const transactionStatusMessage = (status: string) => `Transaction is ${status}`;

export const isTransactionStatusError = (
  message: string,
  statuses: string[]
) => {
  return statuses.some((status) =>
    message.includes(transactionStatusMessage(status))
  );
};

export const isDuplicateOrderCompletionError = (message: string) => {
  return isTransactionStatusError(message, ["completed", "processing"]);
};

export const isIgnorableWebhookPaymentError = (message: string) => {
  if (message.includes("Invalid transaction")) return true;
  if (message.includes("Subscription not found")) return true;

  return isTransactionStatusError(message, [
    "completed",
    "processing",
    "refunded",
    "cancelled",
    "expired",
  ]);
};
