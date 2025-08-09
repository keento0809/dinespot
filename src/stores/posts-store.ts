import { create } from 'zustand'
import { Post } from '@/types'

interface PostsState {
  posts: Post[]
  selectedRestaurantId: string | null
  isLoading: boolean
  setPosts: (posts: Post[]) => void
  addPost: (post: Post) => void
  updatePost: (id: string, updates: Partial<Post>) => void
  setSelectedRestaurant: (id: string | null) => void
  setLoading: (loading: boolean) => void
  toggleLike: (postId: string) => void
}

export const usePostsStore = create<PostsState>((set, get) => ({
  posts: [],
  selectedRestaurantId: null,
  isLoading: false,
  setPosts: (posts) => set({ posts }),
  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
  updatePost: (id, updates) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === id ? { ...post, ...updates } : post
      ),
    })),
  setSelectedRestaurant: (selectedRestaurantId) =>
    set({ selectedRestaurantId }),
  setLoading: (isLoading) => set({ isLoading }),
  toggleLike: (postId) => {
    const state = get()
    const post = state.posts.find((p) => p.id === postId)
    if (post) {
      const newLikesCount = post.isLiked
        ? post.likesCount - 1
        : post.likesCount + 1
      state.updatePost(postId, {
        isLiked: !post.isLiked,
        likesCount: newLikesCount,
      })
    }
  },
}))