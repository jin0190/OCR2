const mockFullReadResult = {
  rawText: `제품 설명서
본 제품은 실내에서 사용 하십시오.
전원 연결후 3초 뒤 시작 됩니다.`,
  cleanedText: `제품 설명서
본 제품은 실내에서 사용하십시오.
전원 연결 후 3초 뒤 시작됩니다.`,
  corrections: [
    {
      before: "사용 하십시오",
      after: "사용하십시오",
      reason: "띄어쓰기 보정",
    },
    {
      before: "연결후",
      after: "연결 후",
      reason: "띄어쓰기 보정",
    },
  ],
}

export function isFullReadApiEnabled() {
  return Boolean(getFullReadEndpoint())
}

export async function requestFullRead(file, model = "gpt-5-mini") {
  const endpoint = getFullReadEndpoint()

  if (!endpoint) {
    return new Promise((resolve) => {
      window.setTimeout(() => resolve(mockFullReadResult), 500)
    })
  }

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
    throw new Error(`Full read failed: ${message}`)
  }

  const json = await response.json()
  return parseJsonOutput(json.outputText || "")
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
    return normalizeResult(JSON.parse(outputText))
  } catch {
    const match = outputText.match(/\{[\s\S]*\}/)
    return match
      ? normalizeResult(JSON.parse(match[0]))
      : normalizeResult({ rawText: outputText })
  }
}

function normalizeResult(result) {
  return {
    rawText: result.rawText || "",
    cleanedText: result.cleanedText || result.rawText || "",
    corrections: Array.isArray(result.corrections) ? result.corrections : [],
  }
}

function getFullReadEndpoint() {
  if (import.meta.env.VITE_FULL_READ_API_ENDPOINT) {
    return import.meta.env.VITE_FULL_READ_API_ENDPOINT
  }

  return import.meta.env.PROD ? "/api/read" : ""
}
