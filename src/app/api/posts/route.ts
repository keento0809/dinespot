import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: true,
        restaurant: true,
        _count: {
          select: { likes: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error('投稿取得エラー:', error)
    return NextResponse.json(
      { error: '投稿の取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const body = await request.json()
    const { restaurantId, description, images } = body

    const post = await prisma.post.create({
      data: {
        userId: user.id,
        restaurantId,
        description,
        images,
      },
      include: {
        user: true,
        restaurant: true,
        _count: {
          select: { likes: true },
        },
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('投稿作成エラー:', error)
    return NextResponse.json(
      { error: '投稿の作成に失敗しました' },
      { status: 500 }
    )
  }
}