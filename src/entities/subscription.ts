export type Subscription = {
  remainingTrialDays: number;
  activePlanId: string | null;
  active: boolean;
  onFreeTrial: boolean;
};
