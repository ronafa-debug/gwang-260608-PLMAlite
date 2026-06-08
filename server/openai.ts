function requireOpenAIKey() {
  const key = process.env.OPENAI_API_KEY
  if (!key) {
    throw new Error(
      'OPENAI_API_KEY가 설정되지 않았습니다. 로컬에서는 .env에, Vercel에서는 Project Settings → Environment Variables에 추가한 뒤 재배포해 주세요.',
    )
  }
  return key
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
  const apiKey = requireOpenAIKey()
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
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
    throw new Error(`OpenAI API error: ${errorText}`)
  }

  const data = (await response.json()) as {
    output_text?: string
    output?: Array<{
      type?: string
      content?: Array<{ type?: string; text?: string }>
    }>
  }

  const outputText = extractOutputText(data)
  if (!outputText) {
    throw new Error('OpenAI response did not include text output.')
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
  const apiKey = requireOpenAIKey()
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
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

  const data = (await response.json()) as {
    data?: Array<{ b64_json?: string; url?: string }>
  }
  const image = data.data?.[0]

  if (!image) {
    throw new Error('Image generation returned an empty result.')
  }

  if (image.b64_json) {
    return {
      bytes: Buffer.from(image.b64_json, 'base64'),
      contentType: 'image/png',
    }
  }

  if (image.url) {
    const imageResponse = await fetch(image.url)
    if (!imageResponse.ok) {
      throw new Error('Failed to download generated image.')
    }
    const bytes = Buffer.from(await imageResponse.arrayBuffer())
    return {
      bytes,
      contentType: imageResponse.headers.get('content-type') ?? 'image/png',
    }
  }

  throw new Error('Unsupported image response format.')
}
