import Purchases, { LOG_LEVEL } from 'react-native-purchases';

const API_KEY_IOS = 'REVENUECAT_API_KEY_PLACEHOLDER';

export async function initPurchases(userId) {
  Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  await Purchases.configure({ apiKey: API_KEY_IOS, appUserID: userId });
}

export async function getIsUnlocked() {
  try {
    const { entitlements } = await Purchases.getCustomerInfo();
    return entitlements.active['pro'] !== undefined;
  } catch (e) {
    return false;
  }
}

export async function purchaseUnlock() {
  const offerings = await Purchases.getOfferings();
  const pkg = offerings.current?.availablePackages[0];
  if (!pkg) throw new Error('No package available');
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo.entitlements.active['pro'] !== undefined;
}

export async function restorePurchases() {
  const customerInfo = await Purchases.restorePurchases();
  return customerInfo.entitlements.active['pro'] !== undefined;
}
