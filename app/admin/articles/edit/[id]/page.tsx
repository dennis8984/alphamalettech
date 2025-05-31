'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, Eye, Upload, Bold, Italic, List, Link as LinkIcon, Image, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const categories = [
  { value: 'fitness', label: 'Fitness' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'health', label: 'Health' },
  { value: 'style', label: 'Style' },
  { value: 'weight-loss', label: 'Weight Loss' },
  { value: 'entertainment', label: 'Entertainment' },
]

// Mock articles data for editing
const mockArticles = {
  '1': {
    id: '1',
    title: 'The Ultimate Guide to Building Muscle Mass',
    slug: 'ultimate-guide-building-muscle-mass',
    category: 'fitness',
    status: 'published',
    content: `# The Ultimate Guide to Building Muscle Mass

Building muscle mass is one of the most rewarding fitness goals you can pursue. Not only does it improve your physical appearance, but it also enhances your overall health, boosts your metabolism, and increases your functional strength.

## Understanding Muscle Growth

Muscle growth, or hypertrophy, occurs when you consistently challenge your muscles through resistance training while providing adequate nutrition and recovery time.

### Key Principles:

1. **Progressive Overload** - Gradually increase weight, reps, or intensity
2. **Adequate Protein** - Consume 1.6-2.2g of protein per kg of body weight
3. **Sufficient Rest** - Allow 48-72 hours between training the same muscle groups
4. **Consistency** - Stick to your routine for at least 8-12 weeks

## Essential Exercises for Muscle Building

Focus on compound movements that work multiple muscle groups:

- **Squats** - Target quads, glutes, and core
- **Deadlifts** - Work your entire posterior chain
- **Bench Press** - Build chest, shoulders, and triceps
- **Pull-ups** - Strengthen back and biceps

Remember to start with proper form before adding weight. Quality always beats quantity when it comes to muscle building.`,
    excerpt: 'Learn the essential principles and strategies for building muscle mass effectively, including proper training techniques, nutrition guidelines, and recovery protocols.',
    featuredImage: '',
    tags: ['muscle building', 'fitness', 'strength training', 'bodybuilding'],
    author: 'John Smith',
    publishedAt: '2024-01-15'
  },
  '2': {
    id: '2',
    title: 'Top 10 Protein-Rich Foods for Men',
    slug: 'top-10-protein-rich-foods-men',
    category: 'nutrition',
    status: 'published',
    content: 'Content for protein-rich foods article...',
    excerpt: 'Discover the best protein sources to fuel your workouts and support muscle growth.',
    featuredImage: '',
    tags: ['protein', 'nutrition', 'diet'],
    author: 'Mike Johnson',
    publishedAt: '2024-01-12'
  },
  '3': {
    id: '3',
    title: 'Mental Health Tips for Modern Men',
    slug: 'mental-health-tips-modern-men',
    category: 'health',
    status: 'draft',
    content: 'Content for mental health article...',
    excerpt: 'Essential mental health strategies for men in today\'s demanding world.',
    featuredImage: '',
    tags: ['mental health', 'wellness'],
    author: 'David Wilson',
    publishedAt: null
  }
}

export default function EditArticlePage() {
  const params = useParams()
  const articleId = params.id as string
  
  const [article, setArticle] = useState({
    title: '',
    slug: '',
    category: '',
    status: 'draft',
    content: '',
    excerpt: '',
    featuredImage: '',
    tags: [] as string[],
    author: ''
  })
  
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [newTag, setNewTag] = useState('')

  // Load article data
  useEffect(() => {
    const loadArticle = () => {
      const existingArticle = mockArticles[articleId as keyof typeof mockArticles]
      
      if (existingArticle) {
        setArticle({
          title: existingArticle.title,
          slug: existingArticle.slug,
          category: existingArticle.category,
          status: existingArticle.status,
          content: existingArticle.content,
          excerpt: existingArticle.excerpt,
          featuredImage: existingArticle.featuredImage,
          tags: existingArticle.tags,
          author: existingArticle.author
        })
      } else {
        setNotFound(true)
      }
      
      setLoading(false)
    }

    if (articleId) {
      loadArticle()
    }
  }, [articleId])

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

  const handleSave = (status: 'draft' | 'published') => {
    console.log('Updating article:', { ...article, status, id: articleId })
    // Here you would update in your database
    alert(`Article ${status === 'published' ? 'published' : 'saved as draft'} successfully!`)
  }

  const handleImageUpload = () => {
    alert('Image upload functionality will be implemented with cloud storage')
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading article...</p>
          </div>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="container mx-auto py-6 max-w-6xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/articles">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Articles
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Article Not Found</h2>
              <p className="text-gray-600 mb-4">The article you're looking for doesn't exist or has been deleted.</p>
              <Link href="/admin/articles">
                <Button>Return to Articles</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 max-w-6xl">
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
            <h1 className="text-3xl font-bold">Edit Article</h1>
            <p className="text-muted-foreground">
              Update your article content and settings
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave('draft')}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={() => handleSave('published')}>
            <Eye className="w-4 h-4 mr-2" />
            {article.status === 'published' ? 'Update' : 'Publish'}
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
                Edit your article content using the rich text editor
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Editor Toolbar */}
              <div className="border rounded-t-lg p-2 bg-gray-50 flex items-center gap-1 flex-wrap">
                <Button variant="ghost" size="sm" onClick={handleImageUpload}>
                  <Upload className="w-4 h-4 mr-1" />
                  Image
                </Button>
                <div className="h-6 w-px bg-gray-300 mx-1" />
                <Button variant="ghost" size="sm">
                  <Bold className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Italic className="w-4 h-4" />
                </Button>
                <div className="h-6 w-px bg-gray-300 mx-1" />
                <Button variant="ghost" size="sm">
                  <List className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <LinkIcon className="w-4 h-4" />
                </Button>
                <div className="h-6 w-px bg-gray-300 mx-1" />
                <Select defaultValue="paragraph">
                  <SelectTrigger className="w-32 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paragraph">Paragraph</SelectItem>
                    <SelectItem value="h1">Heading 1</SelectItem>
                    <SelectItem value="h2">Heading 2</SelectItem>
                    <SelectItem value="h3">Heading 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Editor Content Area */}
              <div className="border border-t-0 rounded-b-lg min-h-[400px] p-4 bg-white">
                <Textarea
                  value={article.content}
                  onChange={(e) => setArticle(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Edit your article content here..."
                  className="min-h-[350px] border-0 resize-none focus:ring-0 focus:outline-none"
                />
              </div>
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
                <Select value={article.status} onValueChange={(value) => setArticle(prev => ({ ...prev, status: value }))}>
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
              {article.featuredImage ? (
                <div className="space-y-2">
                  <img src={article.featuredImage} alt="Featured" className="w-full rounded-lg" />
                  <Button variant="outline" size="sm" className="w-full">
                    Change Image
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">No featured image</p>
                  <Button variant="outline" size="sm" onClick={handleImageUpload}>
                    Upload Image
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