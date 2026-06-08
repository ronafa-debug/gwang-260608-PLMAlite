import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

export function getServiceClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase service role 환경 변수가 설정되지 않았습니다.')
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

export async function uploadImage(
  bucket: string,
  path: string,
  bytes: Uint8Array,
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
