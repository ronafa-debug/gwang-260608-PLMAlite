const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

if (!OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY is not set')
}

interface JsonSchema {
  name: string
  schema: Record<string, unknown>
}

export async function createStructuredResponse<T>(
  instructions: string,
  input: string,
  jsonSchema: JsonSchema,
): Promise<T> {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      instructions,
      input,
      text: {
        format: {
          type: 'json_schema',
          name: jsonSchema.name,
          schema: jsonSchema.schema,
          strict: true,
        },
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenAI Responses API error: ${errorText}`)
  }

  const data = await response.json()
  const outputText = extractOutputText(data)

  if (!outputText) {
    throw new Error('OpenAI 응답에서 텍스트를 찾을 수 없습니다.')
  }

  return JSON.parse(outputText) as T
}

function extractOutputText(data: {
  output_text?: string
  output?: Array<{
    type?: string
    content?: Array<{ type?: string; text?: string }>
  }>
}) {
  if (data.output_text) return data.output_text

  for (const item of data.output ?? []) {
    if (item.type !== 'message') continue
    for (const content of item.content ?? []) {
      if (content.type === 'output_text' && content.text) {
        return content.text
      }
    }
  }

  return null
}

export async function generateImage(prompt: string, size = '1024x1024') {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt,
      size,
      quality: 'medium',
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenAI Image API error: ${errorText}`)
  }

  const data = await response.json()
  const image = data.data?.[0]

  if (!image) {
    throw new Error('이미지 생성 결과가 비어 있습니다.')
  }

  if (image.b64_json) {
    return {
      bytes: Uint8Array.from(atob(image.b64_json), (char) => char.charCodeAt(0)),
      contentType: 'image/png',
    }
  }

  if (image.url) {
    const imageResponse = await fetch(image.url)
    if (!imageResponse.ok) {
      throw new Error('생성된 이미지를 다운로드하지 못했습니다.')
    }
    const bytes = new Uint8Array(await imageResponse.arrayBuffer())
    return {
      bytes,
      contentType: imageResponse.headers.get('content-type') ?? 'image/png',
    }
  }

  throw new Error('이미지 응답 형식을 처리할 수 없습니다.')
}
