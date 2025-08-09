import { z } from 'zod'

export const createPostSchema = z.object({
  restaurantId: z.string().min(1, '店舗IDは必須です'),
  description: z.string().optional(),
  images: z
    .array(z.string())
    .max(3, '画像は最大3枚までです')
    .optional()
    .default([]),
})

export const updateUserSchema = z.object({
  displayName: z.string().min(1, '表示名は必須です').max(50, '表示名は50文字以内です'),
  avatarUrl: z.string().url('有効なURLを入力してください').optional(),
})

export const createRestaurantSchema = z.object({
  name: z.string().min(1, '店舗名は必須です'),
  address: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  mapboxPlaceId: z.string().optional(),
})

export type CreatePostInput = z.infer<typeof createPostSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>