import type { Address, SavedAddress, User } from '@/types';

export const EMPTY_ADDRESS: Address = { street: '', unit: '', building: '', area: '', city: '', postcode: '' };

/** Saved addresses, falling back to the legacy single `address` as "Home". */
export function getSavedAddresses(user: User | null | undefined): SavedAddress[] {
  if (!user) return [];
  if (Array.isArray(user.addresses) && user.addresses.length > 0) return user.addresses;
  if (user.address?.street) return [{ ...user.address, id: 'legacy', label: 'Home', isDefault: true }];
  return [];
}

export function getDefaultAddress(user: User | null | undefined): SavedAddress | null {
  const list = getSavedAddresses(user);
  return list.find(a => a.isDefault) ?? list[0] ?? null;
}

/** Strip SavedAddress metadata back to a plain Address. */
export function toPlainAddress(a: SavedAddress | Address): Address {
  const { street, unit, building, area, city, postcode } = a;
  return { street, unit: unit ?? '', building, area, city, postcode };
}

export function formatAddress(a: Partial<Address> | null | undefined): string {
  if (!a) return '';
  return [a.unit, a.building, a.street, a.area, [a.postcode, a.city].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(', ');
}
