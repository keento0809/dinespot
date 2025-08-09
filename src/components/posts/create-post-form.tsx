'use client'

import { useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { useActionState } from 'react'
import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { create_post } from '@/app/actions/post-actions'
import { createPostSchema } from '@/lib/validations'
import { MapboxPlace } from '@/lib/mapbox'
import { X, Upload } from 'lucide-react'

interface CreatePostFormProps {
  selectedPlace: MapboxPlace | null
  onClose: () => void
}

export function CreatePostForm({ selectedPlace, onClose }: CreatePostFormProps) {
  const [lastResult, action] = useActionState(create_post, null)
  const [images, setImages] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: createPostSchema })
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  })

  const handle_image_upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || images.length >= 3) return

    setIsUploading(true)
    try {
      for (const file of Array.from(files)) {
        if (images.length >= 3) break
        
        // Temporary placeholder - in real app, upload to Supabase Storage
        const imageUrl = URL.createObjectURL(file)
        setImages(prev => [...prev, imageUrl])
      }
    } catch (error) {
      console.error('画像アップロードエラー:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const remove_image = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  if (!selectedPlace) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>新しい投稿</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form id={form.id} onSubmit={form.onSubmit} action={action}>
            <input
              type="hidden"
              name="restaurantId"
              value={selectedPlace.id}
            />
            
            <div className="mb-4">
              <div className="font-medium text-sm">{selectedPlace.place_name}</div>
              <div className="text-xs text-gray-500">
                {selectedPlace.properties?.address}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="images" className="block text-sm font-medium mb-2">
                  写真 (最大3枚)
                </label>
                <div className="flex gap-2 mb-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <div className="relative h-20 w-20 rounded overflow-hidden">
                        <Image
                          src={image}
                          alt={`アップロード画像 ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => remove_image(index)}
                        className="absolute -right-1 -top-1 rounded-full bg-red-500 p-1 text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {images.length < 3 && (
                    <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded border-2 border-dashed border-gray-300 hover:border-gray-400">
                      <Upload className="h-6 w-6 text-gray-400" />
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handle_image_upload}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                  )}
                </div>
                {images.map((image, index) => (
                  <input
                    key={index}
                    type="hidden"
                    name="images"
                    value={image}
                  />
                ))}
              </div>

              <div>
                <label htmlFor={fields.description.id} className="block text-sm font-medium mb-1">
                  説明
                </label>
                <Textarea
                  key={fields.description.key}
                  name={fields.description.name}
                  defaultValue={fields.description.initialValue}
                  placeholder="この食事についてシェアしてください..."
                  rows={3}
                />
                <div className="text-red-500 text-xs mt-1">
                  {fields.description.errors}
                </div>
              </div>

              <div className="text-red-500 text-xs">
                {form.errors}
              </div>

              <Button type="submit" className="w-full">
                投稿する
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}