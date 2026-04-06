export type AlertTriggerType = 'NEW_LISTING' | 'YIELD_ABOVE' | 'LISTING_PRICE_BELOW';

export interface Alert {
  id: string;
  userId: string;
  propertyId: string;
  triggerType: AlertTriggerType;
  conditionValue: number | null;
  active: boolean;
  createdAt: Date;
}

export interface AlertWithProperty extends Alert {
  property: {
    title: string;
    annualYield: number;
  };
}
