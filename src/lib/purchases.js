let Purchases = null;
try {
  Purchases = require('react-native-purchases').default;
} catch (e) {
  console.warn('RevenueCat not available in this environment');
}

export async function initPurchases(userId) {
  if (!Purchases) return;
  await Purchases.configure({ apiKey: 'appl_test_INBnRpnMvclGSNNpEpVZnwlDuXo', appUserID: userId });
}

export async function getIsUnlocked() {
  if (!Purchases) return false;
  try {
    const { entitlements } = await Purchases.getCustomerInfo();
    return entitlements.active['pro'] !== undefined;
  } catch (e) {
    return false;
  }
}

export async function purchaseUnlock() {
  if (!Purchases) throw new Error('Purchases not available');
  const offerings = await Purchases.getOfferings();
  const pkg = offerings.current?.availablePackages[0];
  if (!pkg) throw new Error('No package available');
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo.entitlements.active['pro'] !== undefined;
}

export async function restorePurchases() {
  if (!Purchases) throw new Error('Purchases not available');
  const customerInfo = await Purchases.restorePurchases();
  return customerInfo.entitlements.active['pro'] !== undefined;
}
