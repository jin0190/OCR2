const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses"
const DEFAULT_MODEL = "gpt-5-mini"
const ALLOWED_MODELS = new Set(["gpt-5-mini", "gpt-5.4-mini"])

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" })
    return
  }

  if (!process.env.OPENAI_API_KEY) {
    response.status(500).json({ error: "OPENAI_API_KEY is not configured" })
    return
  }

  try {
    const { fileName, mimeType, dataUrl, model } = request.body || {}

    if (!fileName || !mimeType || !dataUrl) {
      response
        .status(400)
        .json({ error: "fileName, mimeType, dataUrl are required" })
      return
    }

    if (model && !ALLOWED_MODELS.has(model)) {
      response.status(400).json({ error: "Unsupported model" })
      return
    }

    const openAiResponse = await fetch(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: model || process.env.OPENAI_MODEL || DEFAULT_MODEL,
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: [
                  "업로드된 파일에서 결제 내역을 읽어 JSON으로 정리하세요.",
                  "반환 형식은 JSON 객체 하나만 허용합니다.",
                  '{"date":"YYYY-MM-DD 또는 빈 문자열","time":"HH:mm 또는 빈 문자열","storeName":"상호명 또는 빈 문자열","amount":숫자,"rawText":"읽은 전체 텍스트"}',
                  "amount는 최종 결제금액 또는 합계로 보이는 값만 숫자로 넣으세요.",
                  "확실하지 않은 값은 빈 문자열 또는 0으로 두세요.",
                ].join("\n"),
              },
              createFileInput({ fileName, mimeType, dataUrl }),
            ],
          },
        ],
        text: {
          format: {
            type: "json_object",
          },
        },
      }),
    })

    const result = await openAiResponse.json()

    if (!openAiResponse.ok) {
      response.status(openAiResponse.status).json(result)
      return
    }

    response.status(200).json({
      outputText: getOutputText(result),
      rawJson: result,
    })
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
}

function createFileInput({ fileName, mimeType, dataUrl }) {
  if (mimeType === "application/pdf") {
    return {
      type: "input_file",
      filename: fileName,
      file_data: dataUrl,
    }
  }

  return {
    type: "input_image",
    image_url: dataUrl,
  }
}

function getOutputText(responseJson) {
  if (responseJson.output_text) return responseJson.output_text

  const output = responseJson.output || []
  for (const item of output) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) {
        return content.text
      }
    }
  }

  return ""
}
