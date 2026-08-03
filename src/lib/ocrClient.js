import { requestMockOcr } from "./mockOcr.js"
import { parseReceiptText } from "./parseReceipt.js"

export function isApiProxyEnabled() {
  return Boolean(getOcrApiEndpoint())
}

export async function requestOcr(file, model = "gpt-5-mini") {
  const endpoint = getOcrApiEndpoint()

  if (!endpoint) {
    const mockResponse = await requestMockOcr(file)
    return {
      ...parseReceiptText(mockResponse.rawText),
      rawJson: mockResponse,
      provider: "mock",
    }
  }

  return requestProxyOcr(file, endpoint, model)
}

async function requestProxyOcr(file, endpoint, model) {
  const dataUrl = await fileToDataUrl(file)
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileName: file.name,
      mimeType: file.type,
      dataUrl,
      model,
    }),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`OCR request failed: ${message}`)
  }

  const json = await response.json()
  const outputText = json.outputText || ""
  const parsed = parseJsonOutput(outputText)
  const fallback = parseReceiptText(parsed.rawText || outputText)

  return {
    ...fallback,
    ...parsed,
    amount: Number(parsed.amount || fallback.amount || 0),
    rawText: parsed.rawText || fallback.rawText || outputText,
    rawJson: json.rawJson || json,
    provider: "api",
  }
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function parseJsonOutput(outputText) {
  try {
    return JSON.parse(outputText)
  } catch {
    const match = outputText.match(/\{[\s\S]*\}/)
    return match ? JSON.parse(match[0]) : { rawText: outputText }
  }
}

function getOcrApiEndpoint() {
  if (import.meta.env.VITE_OCR_API_ENDPOINT) {
    return import.meta.env.VITE_OCR_API_ENDPOINT
  }

  return import.meta.env.PROD ? "/api/ocr" : ""
}
