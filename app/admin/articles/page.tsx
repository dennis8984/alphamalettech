'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Plus, Search, Edit, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getAllArticles, deleteArticle, type Article } from '@/lib/articles-db'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

export default function ArticlesPage() {
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)

  // Load articles
  useEffect(() => {
    const loadArticles = async () => {
      console.log('📄 Loading articles...')
      
      const { data, error } = await getAllArticles()
      
      if (error) {
        console.error('❌ Failed to load articles:', error)
        alert(`Failed to load articles: ${error}`)
        return
      }
      
      if (data) {
        setArticles(data)
        console.log('✅ Articles loaded:', data.length)
      }
      
      setLoading(false)
    }

    loadArticles()
  }, [])

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.author.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle individual article selection
  const handleSelectArticle = (articleId: string) => {
    const newSelected = new Set(selectedArticles)
    if (newSelected.has(articleId)) {
      newSelected.delete(articleId)
    } else {
      newSelected.add(articleId)
    }
    setSelectedArticles(newSelected)
  }

  // Handle select all toggle
  const handleSelectAll = () => {
    if (selectedArticles.size === filteredArticles.length) {
      setSelectedArticles(new Set()) // Deselect all
    } else {
      setSelectedArticles(new Set(filteredArticles.map(a => a.id).filter((id): id is string => id !== undefined))) // Select all
    }
  }

  // Handle single article deletion
  const handleDeleteArticle = async (articleId: string) => {
    try {
      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setArticles(articles.filter(a => a.id && a.id !== articleId))
        setSelectedArticles(prev => {
          const newSet = new Set(prev)
          newSet.delete(articleId)
          return newSet
        })
        toast.success('Article deleted successfully')
      } else {
        toast.error('Failed to delete article')
      }
    } catch (error) {
      toast.error('Error deleting article')
      console.error('Error:', error)
    }
  }

  // Handle bulk deletion
  const handleBulkDelete = async () => {
    if (selectedArticles.size === 0) {
      toast.error('No articles selected')
      return
    }

    setIsDeleting(true)
    const selectedIds = Array.from(selectedArticles)
    let successCount = 0
    let failCount = 0

    try {
      // Delete articles in parallel for better performance
      const deletePromises = selectedIds.map(async (articleId) => {
        try {
          const response = await fetch(`/api/admin/articles/${articleId}`, {
            method: 'DELETE',
          })
          if (response.ok) {
            successCount++
            return articleId
          } else {
            failCount++
            return null
          }
        } catch (error) {
          failCount++
          return null
        }
      })

      const results = await Promise.all(deletePromises)
      const deletedIds = results.filter(id => id !== null) as string[]

      // Update local state
      setArticles(articles.filter(a => a.id && !deletedIds.includes(a.id)))
      setSelectedArticles(new Set())

      // Show results
      if (successCount > 0 && failCount === 0) {
        toast.success(`Successfully deleted ${successCount} article${successCount > 1 ? 's' : ''}`)
      } else if (successCount > 0 && failCount > 0) {
        toast.warning(`Deleted ${successCount} articles, ${failCount} failed`)
      } else {
        toast.error('Failed to delete selected articles')
      }
    } catch (error) {
      toast.error('Error during bulk deletion')
      console.error('Bulk delete error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusBadge = (article: Article) => {
    if (article.status === 'draft') {
      return <Badge variant="secondary">Draft</Badge>
    }
    if (article.status === 'published') {
      return <Badge variant="default">Published</Badge>
    }
    return <Badge variant="secondary">Unknown</Badge>
  }

  const handleViewArticle = (article: Article) => {
    // Open article in new tab
    window.open(`/articles/${article.slug}`, '_blank')
  }

  const handleEditArticle = (articleId: string) => {
    router.push(`/admin/articles/edit/${articleId}`)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading articles...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Manage Articles</h1>
          <p className="text-muted-foreground">
            Create, edit, and manage your articles with our rich text editor
          </p>
        </div>
      </div>

      {/* Actions Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Link href="/admin/articles/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Article
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Articles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Articles ({filteredArticles.length})</CardTitle>
          <CardDescription>
            Manage all your published and draft articles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedArticles.size > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-600">
                {selectedArticles.size} selected
              </span>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isDeleting ? 'Deleting...' : 'Delete Selected'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Selected Articles</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {selectedArticles.size} selected article{selectedArticles.size > 1 ? 's' : ''}? 
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleBulkDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete Articles
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedArticles.size === filteredArticles.length && filteredArticles.length > 0}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all articles"
                    />
                  </TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? 'No articles found matching your search' : 'No articles found. Create your first article!'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredArticles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedArticles.has(article.id)}
                          onCheckedChange={() => handleSelectArticle(article.id)}
                          aria-label={`Select ${article.title}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{article.title}</div>
                          <div className="text-sm text-muted-foreground">/{article.slug}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(article)}</TableCell>
                      <TableCell>{article.author}</TableCell>
                      <TableCell>
                        {article.created_at ? new Date(article.created_at).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {article.status === 'published' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewArticle(article)}
                              title="View article"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => article.id && handleEditArticle(article.id)}
                            title="Edit article"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Article</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{article.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => article.id && handleDeleteArticle(article.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete Article
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 