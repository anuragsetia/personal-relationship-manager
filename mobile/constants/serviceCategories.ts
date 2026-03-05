export const SERVICE_CATEGORIES = [
  { value: 'account', label: 'Account', icon: 'account-circle' },
  { value: 'insurance', label: 'Insurance', icon: 'shield-check' },
  { value: 'subscription', label: 'Subscription', icon: 'repeat' },
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number]['value'];
