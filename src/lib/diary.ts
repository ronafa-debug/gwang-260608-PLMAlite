import type { DiaryMaterial, DiaryStickerImage } from '@/types'

export function getDiaryStickerImages(data: Pick<DiaryMaterial, 'sticker_images' | 'image_url'>): DiaryStickerImage[] {
  if (data.sticker_images && data.sticker_images.length > 0) {
    return data.sticker_images
  }
  if (data.image_url) {
    return [{ label: '스티커', imageUrl: data.image_url }]
  }
  return []
}
