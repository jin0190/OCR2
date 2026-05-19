const TARGET_AMOUNT = 1000000

export function findBestCombination(receipts, targetAmount = TARGET_AMOUNT) {
  const validReceipts = receipts.filter((receipt) => Number(receipt.amount) > 0)
  const bestByTotal = new Map()

  bestByTotal.set(0, [])

  for (const receipt of validReceipts) {
    const amount = Number(receipt.amount)
    const currentEntries = Array.from(bestByTotal.entries())

    for (const [total, items] of currentEntries) {
      const nextTotal = total + amount
      if (nextTotal > targetAmount) continue

      if (!bestByTotal.has(nextTotal)) {
        bestByTotal.set(nextTotal, [...items, receipt])
      }
    }
  }

  if (bestByTotal.has(targetAmount)) {
    return {
      type: "exact",
      targetAmount,
      total: targetAmount,
      items: bestByTotal.get(targetAmount),
    }
  }

  const bestTotal = Math.max(...bestByTotal.keys())

  return {
    type: "under",
    targetAmount,
    total: bestTotal,
    items: bestByTotal.get(bestTotal) || [],
  }
}
