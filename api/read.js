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
                  "파일 전체를 OCR로 읽으세요.",
                  "특정 양식에 맞춰 요약하지 말고, 문서에 보이는 내용을 최대한 빠짐없이 읽으세요.",
                  "반환 형식은 JSON 객체 하나만 허용합니다.",
                  '{"rawText":"OCR 원문 전체","cleanedText":"오탈자, 띄어쓰기, 줄바꿈만 자연스럽게 다듬은 텍스트","corrections":[{"before":"수정 전","after":"수정 후","reason":"수정 이유"}]}',
                  "숫자, 날짜, 금액, 이름, 주소, 전화번호, 고유명사는 추측해서 바꾸지 마세요.",
                  "확실하지 않은 부분은 cleanedText에서도 원문을 유지하세요.",
                  "corrections에는 실제로 바꾼 부분만 넣으세요.",
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
