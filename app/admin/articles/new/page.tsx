'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, Eye, Upload, Bold, Italic, List, Link as LinkIcon, Image } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { createArticle } from '@/lib/articles-db'
// import { uploadImage } from '@/lib/supabase-storage'

const categories = [
  { value: 'fitness', label: 'Fitness' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'health', label: 'Health' },
  { value: 'style', label: 'Style' },
  { value: 'weight-loss', label: 'Weight Loss' },
  { value: 'entertainment', label: 'Entertainment' },
]

export default function NewArticlePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [article, setArticle] = useState({
    title: '',
    slug: '',
    category: '',
    status: 'draft' as 'draft' | 'published',
    content: '',
    excerpt: '',
    featured_image: '',
    tags: [] as string[],
    author: 'Current User'
  })

  const [newTag, setNewTag] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Auto-generate slug from title
  const handleTitleChange = (title: string) => {
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    
    setArticle(prev => ({ ...prev, title, slug }))
  }

  const addTag = () => {
    if (newTag.trim() && !article.tags.includes(newTag.trim())) {
      setArticle(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setArticle(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSave = async (status: 'draft' | 'published') => {
    setSaving(true)
    
    try {
      // Validate required fields
      if (!article.title.trim()) {
        alert('Please enter a title')
        return
      }
      
      if (!article.category) {
        alert('Please select a category')
        return
      }

      console.log('💾 Saving article...', { title: article.title, status })
      
      const { data, error } = await createArticle({
        ...article,
        status
      })

      if (error) {
        console.error('❌ Save failed:', error)
        alert(`Failed to save article: ${error}`)
        return
      }

      console.log('✅ Article saved successfully!')
      alert(`Article ${status === 'published' ? 'published' : 'saved as draft'} successfully!`)
      
      // Redirect to articles list
      router.push('/admin/articles')
      
    } catch (err) {
      console.error('💥 Unexpected save error:', err)
      alert('An unexpected error occurred while saving')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    setUploading(true)

    try {
      console.log('📸 Uploading image...', file.name)
      
      // For now, create a mock URL - replace with actual Supabase upload
      const mockUrl = URL.createObjectURL(file)
      
      // TODO: Replace with actual Supabase upload
      // const { url, error } = await uploadImage(file)
      // if (error) {
      //   alert(`Upload failed: ${error}`)
      //   return
      // }

      setArticle(prev => ({ ...prev, featured_image: mockUrl }))
      console.log('✅ Image uploaded successfully!')
      
      // Note: In production, this should be the Supabase public URL
      alert('Image uploaded successfully! (Using mock URL for demo)')

    } catch (err) {
      console.error('💥 Upload error:', err)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelected}
        accept="image/*"
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/articles">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Articles
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Create New Article</h1>
            <p className="text-muted-foreground">
              Write and publish a new article for your Men's Health website
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleSave('draft')}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button 
            onClick={() => handleSave('published')}
            disabled={saving}
          >
            <Eye className="w-4 h-4 mr-2" />
            {saving ? 'Publishing...' : 'Publish'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Article Details */}
          <Card>
            <CardHeader>
              <CardTitle>Article Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={article.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter article title..."
                  className="text-lg"
                />
              </div>
              
              <div>
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={article.slug}
                  onChange={(e) => setArticle(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="article-url-slug"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Preview: www.menshb.com/{article.slug || 'article-url-slug'}
                </p>
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={article.excerpt}
                  onChange={(e) => setArticle(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief description for SEO and social sharing..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* WYSIWYG Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Article Content</CardTitle>
              <CardDescription>
                Write your article content using the rich text editor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                value={article.content}
                onChange={(content) => setArticle(prev => ({ ...prev, content }))}
                placeholder="Start writing your article here... 

Use the toolbar above to format your text:
- **Bold text** and *italic text*
- # Headings and ## Subheadings  
- [Links](https://example.com)
- Bullet lists

This editor supports Markdown formatting and will be enhanced with Tiptap WYSIWYG editing soon."
                onImageUpload={handleImageUpload}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Publish Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={article.category} onValueChange={(value) => setArticle(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={article.status} onValueChange={(value: 'draft' | 'published') => setArticle(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={article.author}
                  onChange={(e) => setArticle(prev => ({ ...prev, author: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle>Featured Image</CardTitle>
            </CardHeader>
            <CardContent>
              {article.featured_image ? (
                <div className="space-y-2">
                  <img src={article.featured_image} alt="Featured" className="w-full rounded-lg" />
                  <Button variant="outline" size="sm" className="w-full" onClick={handleImageUpload}>
                    Change Image
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">No featured image</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleImageUpload}
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag..."
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button onClick={addTag} size="sm">Add</Button>
              </div>
              {article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SEO Preview */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-3 bg-gray-50">
                <div className="text-blue-600 text-sm mb-1">www.menshb.com/{article.slug}</div>
                <div className="text-purple-600 font-medium mb-1">{article.title || 'Article Title'}</div>
                <div className="text-gray-600 text-sm">{article.excerpt || 'Article excerpt will appear here...'}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 