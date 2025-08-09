import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createRestaurantSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createRestaurantSchema.parse(body)

    const existingRestaurant = await prisma.restaurant.findFirst({
      where: {
        AND: [
          { latitude: validatedData.latitude },
          { longitude: validatedData.longitude },
        ],
      },
    })

    if (existingRestaurant) {
      return NextResponse.json(existingRestaurant)
    }

    const restaurant = await prisma.restaurant.create({
      data: validatedData,
    })

    return NextResponse.json(restaurant, { status: 201 })
  } catch (error) {
    console.error('レストラン作成エラー:', error)
    return NextResponse.json(
      { error: 'レストランの作成に失敗しました' },
      { status: 500 }
    )
  }
}