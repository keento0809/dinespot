'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Heart, MessageCircle, Send, Bookmark } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Post } from '@/types'
import { toggle_post_like } from '@/app/actions/post-actions'
import { cn } from '@/lib/utils'

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(Boolean(post.isLiked))
  const [likesCount, setLikesCount] = useState(post.likesCount)
  const [isLiking, setIsLiking] = useState(false)

  const handle_like = async () => {
    if (isLiking) return

    setIsLiking(true)
    try {
      const result = await toggle_post_like(post.id)
      if (result.success && typeof result.isLiked === 'boolean') {
        setIsLiked(result.isLiked)
        if (typeof result.likesCount === 'number') {
          setLikesCount(result.likesCount)
        }
      }
    } catch (error) {
      console.error('いいね処理エラー:', error)
    } finally {
      setIsLiking(false)
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md overflow-hidden">
      <CardHeader className="flex-row items-center gap-3 space-y-0 p-4">
        <Avatar className="h-8 w-8">
          <AvatarImage src={post.user.avatarUrl} />
          <AvatarFallback>
            {post.user.displayName?.[0] || post.user.email[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="font-semibold text-sm">
            {post.user.displayName || post.user.email}
          </div>
          <div className="text-xs text-gray-500">{post.restaurant.name}</div>
        </div>
      </CardHeader>

      {post.images.length > 0 && (
        <div className="relative aspect-square">
          <Image
            src={post.images[0]}
            alt="投稿画像"
            fill
            className="object-cover"
          />
          {post.images.length > 1 && (
            <div className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
              1/{post.images.length}
            </div>
          )}
        </div>
      )}

      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handle_like}
              disabled={isLiking}
              className={cn(
                'h-8 w-8 p-0',
                isLiked && 'text-red-500 hover:text-red-600'
              )}
            >
              <Heart
                className={cn('h-6 w-6', isLiked && 'fill-current')}
              />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MessageCircle className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Send className="h-6 w-6" />
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Bookmark className="h-6 w-6" />
          </Button>
        </div>

        {likesCount > 0 && (
          <div className="mt-2 text-sm font-semibold">
            {likesCount}件のいいね
          </div>
        )}

        {post.description && (
          <div className="mt-2 text-sm">
            <span className="font-semibold mr-1">
              {post.user.displayName || post.user.email}
            </span>
            {post.description}
          </div>
        )}

        <div className="mt-2 text-xs text-gray-500">
          {new Date(post.createdAt).toLocaleDateString('ja-JP')}
        </div>
      </CardContent>
    </Card>
  )
}