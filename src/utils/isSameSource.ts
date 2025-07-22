export function isSameSource(
  arr: string[],
  inventory: Record<string, Record<string, number>>
) {
  const inventoryKeys = Object.keys(inventory);
  let flag = '';
  return arr.every(item => {
    const matchingKey = inventoryKeys.find(ikey => item in inventory[ikey]);
    if (!matchingKey) return false;
    if (flag === '') flag = matchingKey;
    return flag === matchingKey;
  });
}
