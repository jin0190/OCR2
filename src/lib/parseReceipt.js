export function parseReceiptText(rawText) {
  const lines = rawText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

  const dateMatch = rawText.match(/\d{4}[-./]\d{1,2}[-./]\d{1,2}/)
  const timeMatch = rawText.match(/\d{1,2}:\d{2}/)
  const amountMatches = [...rawText.matchAll(/([\d,]+)\s*원?/g)]

  const amountNumbers = amountMatches
    .map((match) => Number(match[1].replaceAll(",", "")))
    .filter((value) => Number.isFinite(value))

  return {
    date: dateMatch ? normalizeDate(dateMatch[0]) : "",
    time: timeMatch ? timeMatch[0] : "",
    storeName: lines[0] || "",
    amount: amountNumbers.length > 0 ? Math.max(...amountNumbers) : "",
    rawText,
  }
}

function normalizeDate(value) {
  const parts = value.split(/[-./]/)
  const year = parts[0]
  const month = parts[1].padStart(2, "0")
  const day = parts[2].padStart(2, "0")

  return `${year}-${month}-${day}`
}
