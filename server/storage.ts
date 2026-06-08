import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다. Supabase 대시보드 → Project Settings → API에서 service_role 키를 확인한 뒤, 로컬 .env 또는 Vercel Environment Variables에 추가하고 재배포해 주세요.',
    )
  }

  return createClient(url, key)
}

export async function uploadImage(
  bucket: string,
  path: string,
  bytes: Buffer,
  contentType: string,
) {
  const supabase = getServiceClient()
  const { error } = await supabase.storage.from(bucket).upload(path, bytes, {
    contentType,
    upsert: true,
  })

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`)
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
