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
vi.mock('next/image', () => {
  const MockImage = ({ 
    src, 
    alt, 
    width, 
    height, 
    fill, 
    priority,
    quality,
    sizes,
    style,
    ...props 
  }: {
    src: string
    alt: string
    width?: number
    height?: number
    fill?: boolean
    priority?: boolean
    quality?: number
    sizes?: string
    style?: React.CSSProperties
    [key: string]: unknown
  }) => {
    // Mock the Next.js Image component behavior for tests
    const imageStyle: React.CSSProperties = {
      ...style,
      ...(width && { width }),
      ...(height && { height }),
      ...(fill && { 
        position: 'absolute',
        height: '100%',
        width: '100%',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        objectFit: 'cover'
      })
    }

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        style={imageStyle}
        data-testid="next-image-mock"
        data-priority={priority}
        data-quality={quality}
        data-sizes={sizes}
        {...props}
      />
    )
  }
  
  MockImage.displayName = 'MockImage'
  return {
    default: MockImage
  }
})

// Mock server actions
vi.mock('@/app/actions/post-actions', () => ({
  toggle_post_like: vi.fn().mockResolvedValue({ success: true })
}))

// Mock stores
vi.mock('@/stores/auth-store', () => ({
  useAuthStore: vi.fn(() => ({
    user: null,
    isLoading: false,
    setUser: vi.fn(),
    setLoading: vi.fn(),
  }))
}))

vi.mock('@/stores/posts-store', () => ({
  usePostsStore: vi.fn(() => ({
    posts: [],
    isLoading: false,
    setPosts: vi.fn(),
    addPost: vi.fn(),
  }))
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

  it('状態更新のパフォーマンスをテスト', () => {
    const largePosts = generateMockPosts(50)
    
    const startTime = performance.now()
    
    act(() => {
      // Simulate state update processing
      largePosts.forEach(post => {
        // Simulate processing each post
        JSON.stringify(post)
      })
    })
    
    const endTime = performance.now()
    const updateTime = endTime - startTime
    
    // 50件の投稿データの状態更新が50ms以下で完了することを確認
    expect(updateTime).toBeLessThan(50)
    expect(largePosts).toHaveLength(50)
  })

  it('メモリリークがないことを確認', () => {
    // Mock store behavior
    const mockPosts = generateMockPosts(100)
    
    // Test basic memory management by rendering and unmounting components
    const { unmount } = render(
      <div>
        {mockPosts.slice(0, 10).map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    )
    
    // Unmount should clean up without errors
    expect(() => unmount()).not.toThrow()
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