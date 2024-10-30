import { Timestamp } from 'react-native-reanimated/lib/typescript/reanimated2/commonTypes';
import { ImageSourcePropType } from 'react-native';

/**
 * Model User
 *
 */
export type User = {
  id: string;
  scans: number;
  email: string | null;
  name: string | null;
  photoUrl: string | null;
  username: string | null;
  preferredName: string | null;
  phoneNumber: string | null;
  country: string | null;
  total: number | null;
  currency: string | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * Model Setting
 *
 */
export type Setting = {
  id: number;
  userId: string;
  enableNotifications: boolean;
  enableEmail: boolean;
  createdAt: string;
  updatedAt: string;
  fcmTokens: string[];
};

/**
 * Model AppVersion
 *
 */
export type AppVersion = {
  id: number;
  versionNumber: string;
  requiredUpdate: boolean;
  platform: 'IOS' | 'ANDROID';
  versionName: string | null;
  createdAt: string;
  updatedAt: string;
};

export enum NotificationStatus {
  'NEW',
  'READ',
}

export enum NotificationType {
  'IOS',
  'ANDROID',
}

export type Notification = {
  id: number;
  title: string;
  logoURL: string;
  content: string;
  type: NotificationType;
  createdAt: string;
  updatedAt: string;
  meta: {
    sender?: string;
    receiptId?: string;
    folderId?: string;
  };
  userId: string;
  status: 'NEW' | 'READ';
};

/**
 * Model Receipt
 *
 */
export type Receipt = {
  id: number;
  name: string;
  photoUrl: string | null;
  address_block: string | null;
  invoice_receipt_date: string | null;
  invoice_receipt_id: string | null;
  tax_payer_id: string | null;
  vendor_phone: string | null;
  customer_number: string | null;
  due_date: string | null;
  po_number: string | null;
  payment_terms: string | null;
  total: string | null;
  amount_due: string | null;
  subtotal: string | null;
  tax: string | null;
  vendor_pan_number: string | null;
  zip_code: string | null;
  state: string | null;
  vendor_gst_number: string | null;
  country: string | null;
  order_date: string | null;
  vendor_abn_number: string | null;
  receiver_gst_number: string | null;
  vendor_vat_number: string | null;
  city: string | null;
  currency: string | null;
  shipping_handling_charge: string | null;
  account_number: string | null;
  vendor_url: string | null;
  receiver_phone: string | null;
  receiver_vat_number: string | null;
  receiver_pan_number: string | null;
  prior_balance: string | null;
  street: string | null;
  discount: string | null;
  delivery_date: string | null;
  amount_paid: string | null;
  receiver_abn_number: string | null;
  service_charge: string | null;
  gratuity: string | null;
  items: any;
  createdAt: string;
  updatedAt: string;
  ownerId: string | null;
  shared: boolean | null;
  favorite: boolean | null;
  urls: string[] | null;
};

/**
 * Model Contact
 *
 */
export type Contact = {
  id: number;
  userId: string;
  contactId: string;
};

/**
 * Model Folder
 *
 */
export type Folder = {
  id: number;
  name: string;
  description: string;
  shared?: boolean;
  color: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  receipts?: Receipt[];
  numberOfReceipts?: number;
  total: number;
  icon?: string;
};

/**
 * Model ReceiptFolder
 *
 */
export type ReceiptFolder = {
  receiptId: number;
  folderId: number;
};

/**
 * Model SharedReceipt
 *
 */
export type SharedReceipt = {
  receiptId: number;
  userId: string;
  contactId: number;
};

/**
 * Model SharedFolder
 *
 */
export type SharedFolder = {
  folderId: number;
  userId: string;
  contactId: number;
};

export type ReceiptWithUploadedAt = Receipt & { uploadedAt: Date | Timestamp };

export type OrganisationFolder = {
  id: string;
  name: string;
  createdAt: Timestamp;
  color: Color;
  updatedAt: Timestamp | null;
  description: string;
  organisationId: string;
  userId: string;
  members: string[];
  receipts: ReceiptWithUploadedAt[];
};

export const colors = [
  '#F26337',
  '#007ACC',
  '#72e105',
  '#F15087',
  '#7234e4',
] as const;

export type Color = (typeof colors)[number];

export type OnboardingData = {
  lottie: ImageSourcePropType;
  id: string;
  title: string;
  text: string;
};
