import { sendCustomSms } from "./sms";
import { sendOrderReceiptEmail } from "./email";
import { formatGHS } from "./utils";

export interface CustomerOrderNotificationParams {
  phone: string;
  email?: string;
  customerName: string;
  orderNumber: string;
  deliveryOtp: string;
  totalAmount: number;
  area: string;
  items: { name: string; quantity: number; totalPrice: number }[];
}

/**
 * Dispatches both SMS and Email receipt to the customer upon checkout
 */
export async function sendCustomerOrderNotification({
  phone,
  email,
  customerName,
  orderNumber,
  deliveryOtp,
  totalAmount,
  area,
  items,
}: CustomerOrderNotificationParams): Promise<void> {
  // 1. Transactional SMS with Delivery OTP Guard
  const smsMessage = `NMarket: Order ${orderNumber} confirmed! Total: ${formatGHS(totalAmount)}. Your Delivery OTP is ${deliveryOtp}. Hand this code to your rider at delivery.`;
  await sendCustomSms({ phone, message: smsMessage });

  // 2. Branded Order Receipt via Resend (if email exists)
  if (email) {
    await sendOrderReceiptEmail({
      to: email,
      customerName,
      orderNumber,
      deliveryOtp,
      totalAmount,
      area,
      items,
    });
  }
}

export interface MerchantOrderAlertParams {
  storeName: string;
  storePhone: string;
  orderNumber: string;
  itemCount: number;
  subtotal: number;
}

/**
 * Alerts merchant when a new order package is assigned to their store
 */
export async function sendMerchantNewOrderAlert({
  storeName,
  storePhone,
  orderNumber,
  itemCount,
  subtotal,
}: MerchantOrderAlertParams): Promise<void> {
  const message = `NMarket: New order ${orderNumber} for ${storeName}! ${itemCount} item(s), Subtotal: ${formatGHS(subtotal)}. Open /seller/orders to prepare for rider pickup.`;
  await sendCustomSms({ phone: storePhone, message });
}

export interface RiderDispatchAlertParams {
  riderPhone: string;
  orderNumber: string;
  pickupArea: string;
  deliveryFee: number;
}

/**
 * Notifies active riders in Tamale when an order is packed and ready for pickup
 */
export async function sendRiderDispatchAlert({
  riderPhone,
  orderNumber,
  pickupArea,
  deliveryFee,
}: RiderDispatchAlertParams): Promise<void> {
  const message = `NMarket Dispatch: Order ${orderNumber} is ready for pickup in ${pickupArea}! Payout: ${formatGHS(deliveryFee)}. Claim in /rider now.`;
  await sendCustomSms({ phone: riderPhone, message });
}

export interface CustomerDeliveredAlertParams {
  phone: string;
  orderNumber: string;
}

/**
 * Notifies customer that delivery has been confirmed via OTP handshake
 */
export async function sendCustomerDeliveredAlert({
  phone,
  orderNumber,
}: CustomerDeliveredAlertParams): Promise<void> {
  const message = `NMarket: Order ${orderNumber} has been delivered successfully! Thank you for shopping local in Tamale. Rate your order at /orders.`;
  await sendCustomSms({ phone, message });
}
