'use server'

import { createPostSchema } from '@/lib/validations'

export async function create_post(
  _prevState: unknown,
  formData: FormData
): Promise<{
  status: 'success' | 'error'
  errors?: Record<string, string[]>
} | null> {
  // TODO: Implement post creation when backend is ready
  try {
    const result = createPostSchema.safeParse({
      content: formData.get('content'),
      restaurant_name: formData.get('restaurant_name'),
      restaurant_address: formData.get('restaurant_address'),
      latitude: formData.get('latitude'),
      longitude: formData.get('longitude'),
      images: formData.getAll('images'),
    })

    if (!result.success) {
      return {
        status: 'error',
        errors: result.error.flatten().fieldErrors,
      }
    }

    // Placeholder: would create post in database
    console.log('Create post data:', result.data)
    
    return { status: 'success' }
  } catch (error) {
    console.error('Create post error:', error)
    return {
      status: 'error',
      errors: { _root: ['投稿の作成に失敗しました。'] },
    }
  }
}

export async function toggle_post_like(
  postId: string
): Promise<{
  success?: boolean
  error?: string
  isLiked?: boolean
  likesCount?: number
}> {
  // TODO: Implement like toggle when backend is ready
  try {
    console.log('Toggle like for post:', postId)
    
    // Placeholder: would update like status in database
    return {
      success: true,
      isLiked: Math.random() > 0.5, // Random for demo
      likesCount: Math.floor(Math.random() * 100),
    }
  } catch (error) {
    console.error('Toggle like error:', error)
    return {
      error: 'いいねの切り替えに失敗しました。',
    }
  }
}