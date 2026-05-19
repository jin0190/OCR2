import * as XLSX from "xlsx"

export function exportReceiptsToExcel(receipts, fileName = "receipts.xlsx") {
  const rows = receipts.map((receipt) => ({
    날짜: receipt.date || "",
    시간: receipt.time || "",
    상호명: receipt.storeName || "",
    금액: Number(receipt.amount || 0),
    파일명: receipt.fileName || "",
    "전체 OCR 텍스트": receipt.rawText || "",
  }))

  exportRows(rows, "영수증", fileName)
}

export function exportCombinationToExcel(result, fileName = "combination.xlsx") {
  if (!result || result.items.length === 0) return

  const rows = result.items.map((receipt) => ({
    날짜: receipt.date || "",
    시간: receipt.time || "",
    상호명: receipt.storeName || "",
    금액: Number(receipt.amount || 0),
    파일명: receipt.fileName || "",
  }))

  rows.push({
    날짜: "",
    시간: "",
    상호명: result.type === "exact" ? "정확히 1,000,000원" : "1,000,000원 미만 최대",
    금액: result.total,
    파일명: "",
  })

  exportRows(rows, "조합 결과", fileName)
}

function exportRows(rows, sheetName, fileName) {
  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, fileName)
}
