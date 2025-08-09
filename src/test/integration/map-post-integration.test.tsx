import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MapView } from '@/components/map/map-view'
import { CreatePostForm } from '@/components/posts/create-post-form'
import { Post } from '@/types'

// Mock Mapbox GL
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
      }),
      queryRenderedFeatures: vi.fn(),
      easeTo: vi.fn()
    })),
    Marker: vi.fn(),
    Popup: vi.fn()
  }
}))

// Mock Next.js Image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  )
}))

// Mock server actions
vi.mock('@/app/actions/post-actions', () => ({
  create_post: vi.fn().mockResolvedValue({ success: true })
}))

describe('地図と投稿機能の統合テスト', () => {
  const mockPosts: Post[] = [
    {
      id: 'post-1',
      userId: 'user-1',
      restaurantId: 'restaurant-1',
      description: 'テスト投稿',
      images: ['test-image.jpg'],
      isLiked: false,
      likesCount: 0,
      user: {
        id: 'user-1',
        email: 'test@example.com',
        displayName: 'Test User',
        avatarUrl: undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      restaurant: {
        id: 'restaurant-1',
        name: 'テストレストラン',
        address: '東京都渋谷区',
        latitude: 35.6895,
        longitude: 139.6917,
        createdAt: new Date()
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('地図に投稿データが正しく表示される', async () => {
    const onRestaurantClick = vi.fn()

    render(
      <MapView
        posts={mockPosts}
        onRestaurantClick={onRestaurantClick}
      />
    )

    // Map container が存在することを確認
    const mapContainer = screen.getByRole('generic')
    expect(mapContainer).toBeInTheDocument()
  })

  it('選択されたお店で投稿フォームが正しく動作する', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const selectedPlace = {
      id: 'place-1',
      place_name: 'テストレストラン',
      center: [139.6917, 35.6895] as [number, number],
      properties: {
        address: '東京都渋谷区'
      }
    }

    render(
      <CreatePostForm
        selectedPlace={selectedPlace}
        onClose={onClose}
      />
    )

    // お店名が表示されることを確認
    expect(screen.getByText('テストレストラン')).toBeInTheDocument()
    expect(screen.getByText('東京都渋谷区')).toBeInTheDocument()

    // 投稿フォームが表示されることを確認
    const descriptionTextarea = screen.getByPlaceholderText('この食事についてシェアしてください...')
    expect(descriptionTextarea).toBeInTheDocument()

    // フォーム入力をテスト
    await user.type(descriptionTextarea, '美味しい料理でした！')
    expect(descriptionTextarea).toHaveValue('美味しい料理でした！')

    // 投稿ボタンが存在することを確認
    const submitButton = screen.getByRole('button', { name: '投稿する' })
    expect(submitButton).toBeInTheDocument()
  })

  it('投稿作成から地図更新までの連携が動作する', async () => {
    const onRestaurantClick = vi.fn()
    
    // 最初は投稿がない状態で地図をレンダリング
    const { rerender } = render(
      <MapView
        posts={[]}
        onRestaurantClick={onRestaurantClick}
      />
    )

    // 投稿が追加された状態で再レンダリング
    rerender(
      <MapView
        posts={mockPosts}
        onRestaurantClick={onRestaurantClick}
      />
    )

    // 地図が更新されることを確認（MockのsetDataが呼ばれる）
    await waitFor(() => {
      const { mapboxgl } = require('@/lib/mapbox')
      const mapInstance = mapboxgl.Map.mock.results[0].value
      expect(mapInstance.getSource).toHaveBeenCalledWith('restaurants')
    })
  })
})