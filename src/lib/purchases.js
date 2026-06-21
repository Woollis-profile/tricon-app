let Purchases = null;
try {
  Purchases = require('react-native-purchases').default;
} catch (e) {
  console.warn('[RC] react-native-purchases not available:', e.message);
}

export async function initPurchases(userId) {
  if (!Purchases) return;
  console.log('[RC] initPurchases — userId:', userId);
  await Purchases.configure({ apiKey: 'appl_UpscCSrGfMiWBJmWHnjnbMGxMnb', appUserID: userId });
  console.log('[RC] configured');
}

export async function getIsUnlocked() {
  if (!Purchases) { console.log('[RC] getIsUnlocked — SDK not available'); return false; }
  try {
    const info = await Purchases.getCustomerInfo();
    const active = info.entitlements.active;
    console.log('[RC] getIsUnlocked — active entitlements:', JSON.stringify(active));
    return active['pro'] !== undefined;
  } catch (e) {
    console.error('[RC] getIsUnlocked error:', e.message);
    return false;
  }
}

export async function purchaseUnlock() {
  if (!Purchases) throw new Error('[RC] Purchases SDK not available');
  console.log('[RC] purchaseUnlock — calling getOfferings()');
  const offerings = await Purchases.getOfferings();
  console.log('[RC] getOfferings result:', JSON.stringify({
    current: offerings.current
      ? { id: offerings.current.identifier, packages: offerings.current.availablePackages.map(p => ({ id: p.identifier, product: p.product?.productIdentifier, price: p.product?.priceString })) }
      : null,
    allKeys: Object.keys(offerings.all || {}),
  }));
  const pkg = offerings.current?.availablePackages[0];
  if (!pkg) throw new Error('[RC] No package available — offerings.current is null or empty');
  console.log('[RC] purchasing package:', pkg.identifier, pkg.product?.productIdentifier);
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  const unlocked = customerInfo.entitlements.active['pro'] !== undefined;
  console.log('[RC] purchasePackage done — unlocked:', unlocked);
  return unlocked;
}

export async function restorePurchases() {
  if (!Purchases) throw new Error('[RC] Purchases SDK not available');
  console.log('[RC] restorePurchases');
  const customerInfo = await Purchases.restorePurchases();
  const unlocked = customerInfo.entitlements.active['pro'] !== undefined;
  console.log('[RC] restorePurchases done — unlocked:', unlocked);
  return unlocked;
}
