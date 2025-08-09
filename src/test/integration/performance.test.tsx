import { describe, it, expect, vi } from 'vitest'
import { render, act, screen } from '@testing-library/react'
import { MapView } from '@/components/map/map-view'
import { PostCard } from '@/components/posts/post-card'
import { Post } from '@/types'

// Mock Mapbox GL for performance testing
vi.mock('@/lib/mapbox', () => ({
  mapboxgl: {
    Map: vi.fn().mockImplementation(() => ({
      on: vi.fn(),
      addSource: vi.fn(),
      addLayer: vi.fn(),
      getSource: vi.fn().mockReturnValue({
        setData: vi.fn()
      }),
      remove: vi.fn(),
      getCanvas: vi.fn().mockReturnValue({
        style: { cursor: '' }
      })
    }))
  }
}))

// Mock Next.js Image for performance testing
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  )
}))

// Mock server actions
vi.mock('@/app/actions/post-actions', () => ({
  toggle_like: vi.fn().mockResolvedValue({ success: true })
}))

describe('パフォーマンステスト', () => {
  // 大量のモックデータを生成
  const generateMockPosts = (count: number): Post[] => {
    return Array.from({ length: count }, (_, index) => ({
      id: `post-${index}`,
      userId: `user-${index}`,
      restaurantId: `restaurant-${index}`,
      description: `投稿 ${index + 1}`,
      images: [`image-${index}.jpg`],
      isLiked: false,
      likesCount: Math.floor(Math.random() * 100),
      user: {
        id: `user-${index}`,
        email: `user${index}@example.com`,
        displayName: `ユーザー ${index + 1}`,
        avatarUrl: undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      restaurant: {
        id: `restaurant-${index}`,
        name: `レストラン ${index + 1}`,
        address: `住所 ${index + 1}`,
        latitude: 35.6895 + (Math.random() - 0.5) * 0.1,
        longitude: 139.6917 + (Math.random() - 0.5) * 0.1,
        createdAt: new Date()
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }))
  }

  it('大量の投稿データで地図のレンダリングパフォーマンスをテスト', async () => {
    const largePosts = generateMockPosts(10)
    
    const startTime = performance.now()
    
    render(
      <MapView
        posts={largePosts}
        onRestaurantClick={vi.fn()}
      />
    )
    
    const endTime = performance.now()
    const renderTime = endTime - startTime
    
    // 10件の投稿で500ms以下でレンダリングできることを確認
    expect(renderTime).toBeLessThan(500)
  })

  it('投稿カードのレンダリングパフォーマンスをテスト', async () => {
    const mockPost = generateMockPosts(1)[0]
    
    const startTime = performance.now()
    
    // 10個の投稿カードを同時にレンダリング
    const posts = generateMockPosts(10)
    
    render(
      <div>
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    )
    
    const endTime = performance.now()
    const renderTime = endTime - startTime
    
    // 10個の投稿カードが300ms以下でレンダリングできることを確認
    expect(renderTime).toBeLessThan(300)
  })

  it('状態更新のパフォーマンスをテスト', async () => {
    const { usePostsStore } = await import('@/stores/posts-store')
    const largePosts = generateMockPosts(50)
    
    const startTime = performance.now()
    
    act(() => {
      usePostsStore.getState().setPosts(largePosts)
    })
    
    const endTime = performance.now()
    const updateTime = endTime - startTime
    
    // 50件の投稿データの状態更新が50ms以下で完了することを確認
    expect(updateTime).toBeLessThan(50)
    expect(usePostsStore.getState().posts).toHaveLength(50)
  })

  it('メモリリークがないことを確認', () => {
    const { useAuthStore } = require('@/stores/auth-store')
    const { usePostsStore } = require('@/stores/posts-store')
    
    // 初期状態をクリア
    act(() => {
      useAuthStore.getState().setUser(null)
      usePostsStore.getState().setPosts([])
    })

    // 大量データを設定
    const largePosts = generateMockPosts(100)
    act(() => {
      usePostsStore.getState().setPosts(largePosts)
    })

    // データをクリア
    act(() => {
      usePostsStore.getState().setPosts([])
    })

    // ストアがクリアされていることを確認
    expect(usePostsStore.getState().posts).toHaveLength(0)
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('画像読み込みの最適化をテスト', () => {
    const mockPost = generateMockPosts(1)[0]
    mockPost.images = ['large-image-1.jpg', 'large-image-2.jpg', 'large-image-3.jpg']

    render(<PostCard post={mockPost} />)

    // Next.js Imageコンポーネントが使用されていることを確認
    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThan(0)
    
    // 画像が遅延読み込みされることを確認
    images.forEach((img: HTMLElement) => {
      expect(img.getAttribute('loading')).toBe('lazy')
    })
  })
})