export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateCustomer(data: {
  name: string;
  contactEmail?: string;
}) {
  const errors: Record<string, string> = {};
  if (!data.name.trim()) errors.name = "Company name is required";
  if (data.contactEmail && !isValidEmail(data.contactEmail)) {
    errors.contactEmail = "Enter a valid email address";
  }
  return errors;
}

export function validateContact(data: { name: string; email: string; companyId: string }) {
  const errors: Record<string, string> = {};
  if (!data.name.trim()) errors.name = "Name is required";
  if (!data.companyId) errors.companyId = "Customer is required";
  if (!data.email.trim()) errors.email = "Email is required";
  else if (!isValidEmail(data.email)) errors.email = "Enter a valid email address";
  return errors;
}

export function validateDeal(data: {
  title: string;
  customerId: string;
  value: number;
  probability: number;
  expectedClose: string;
}) {
  const errors: Record<string, string> = {};
  if (!data.title.trim()) errors.title = "Deal title is required";
  if (!data.customerId) errors.customerId = "Customer is required";
  if (data.value < 0) errors.value = "Value must be 0 or greater";
  if (data.probability < 0 || data.probability > 100) {
    errors.probability = "Probability must be between 0 and 100";
  }
  if (!data.expectedClose) errors.expectedClose = "Expected close date is required";
  return errors;
}
