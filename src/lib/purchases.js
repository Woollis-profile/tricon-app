let Purchases = null;
try {
  Purchases = require('react-native-purchases').default;
} catch (e) {
  console.warn('[RC] react-native-purchases not available:', e.message);
}

export async function initPurchases(userId) {
  if (!Purchases) return;
  await Purchases.configure({ apiKey: 'appl_UpscCSrGfMiWBJmWHnjnbMGxMnb', appUserID: userId });
}

export async function getIsUnlocked() {
  if (!Purchases) return false;
  try {
    const info = await Purchases.getCustomerInfo();
    return info.entitlements.active['pro'] !== undefined;
  } catch (e) {
    console.error('[RC] getIsUnlocked error:', e.message);
    return false;
  }
}

export async function purchaseUnlock() {
  if (!Purchases) throw new Error('[RC] Purchases SDK not available');
  const offerings = await Purchases.getOfferings();
  let pkg = offerings.current?.availablePackages[0];
  if (!pkg) {
    for (const o of Object.values(offerings.all || {})) {
      if (o.availablePackages?.length) { pkg = o.availablePackages[0]; break; }
    }
  }
  if (!pkg) throw new Error('Purchase options are not available right now. Please try again in a few minutes.');
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo.entitlements.active['pro'] !== undefined;
}

export async function restorePurchases() {
  if (!Purchases) throw new Error('[RC] Purchases SDK not available');
  const customerInfo = await Purchases.restorePurchases();
  return customerInfo.entitlements.active['pro'] !== undefined;
}
