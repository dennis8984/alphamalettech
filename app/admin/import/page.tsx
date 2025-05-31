'use client'

import { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Upload, FileText, AlertCircle, CheckCircle, Download, Edit, Eye, X, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface ParsedArticle {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  image: string
  category: string
  author: string
  date: string
  featured: boolean
  trending: boolean
  filename: string
  status: 'ready' | 'warning' | 'error'
  warnings: string[]
  wordCount: number
  size: string
}

interface ImportStats {
  totalCount: number
  readyCount: number
  warningCount: number
  errorCount: number
}

export default function ImportPage() {
  const [importStep, setImportStep] = useState<'upload' | 'mapping' | 'preview' | 'processing' | 'complete'>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importProgress, setImportProgress] = useState(0)
  const [parsedArticles, setParsedArticles] = useState<ParsedArticle[]>([])
  const [importStats, setImportStats] = useState<ImportStats | null>(null)
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set())
  const [isUploading, setIsUploading] = useState(false)
  const [editingArticle, setEditingArticle] = useState<string | null>(null)
  const [previewArticle, setPreviewArticle] = useState<string | null>(null)
  const [importResults, setImportResults] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // New states for field mapping
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({})

  const categories = ['fitness', 'nutrition', 'health', 'style', 'weight-loss', 'entertainment']

  const articleFields = [
    { key: 'title', label: 'Title', required: true, description: 'Article headline' },
    { key: 'content', label: 'Content', required: true, description: 'Main article text' },
    { key: 'excerpt', label: 'Excerpt', required: false, description: 'Short summary (optional)' },
    { key: 'category', label: 'Category', required: false, description: 'Article category' },
    { key: 'author', label: 'Author', required: false, description: 'Author name' },
    { key: 'image', label: 'Image URL', required: false, description: 'Featured image' },
    { key: 'date', label: 'Date', required: false, description: 'Publish date' }
  ]

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const allowedTypes = ['.zip', '.csv', '.xml', '.html', '.htm']
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase()
      
      if (allowedTypes.includes(fileExt)) {
        setSelectedFile(file)
      } else {
        alert('Please select a ZIP, CSV, XML, or HTML file.')
      }
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      const allowedTypes = ['.zip', '.csv', '.xml', '.html', '.htm']
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase()
      
      if (allowedTypes.includes(fileExt)) {
        setSelectedFile(file)
      } else {
        alert('Please select a ZIP, CSV, XML, or HTML file.')
      }
    }
  }, [])

  const processUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      
      // Add field mappings if we have them (for second pass)
      if (Object.keys(fieldMappings).length > 0) {
        formData.append('fieldMappings', JSON.stringify(fieldMappings))
      }

      const response = await fetch('/api/admin/import/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Upload error details:', result)
        throw new Error(result.error || 'Upload failed')
      }

      // Check if we need field mapping
      if (result.needsMapping) {
        setCsvHeaders(result.headers)
        // Auto-detect common mappings
        const autoMappings: Record<string, string> = {}
        result.headers.forEach((header: string) => {
          const lowerHeader = header.toLowerCase()
          if (lowerHeader.includes('title') || lowerHeader.includes('headline')) {
            autoMappings.title = header
          } else if (lowerHeader.includes('content') || lowerHeader.includes('body') || lowerHeader.includes('description')) {
            autoMappings.content = header
          } else if (lowerHeader.includes('excerpt') || lowerHeader.includes('summary')) {
            autoMappings.excerpt = header
          } else if (lowerHeader.includes('category') || lowerHeader.includes('tag')) {
            autoMappings.category = header
          } else if (lowerHeader.includes('author') || lowerHeader.includes('writer')) {
            autoMappings.author = header
          } else if (lowerHeader.includes('image') || lowerHeader.includes('thumbnail')) {
            autoMappings.image = header
          } else if (lowerHeader.includes('date') || lowerHeader.includes('publish')) {
            autoMappings.date = header
          }
        })
        setFieldMappings(autoMappings)
        setImportStep('mapping')
        setIsUploading(false)
        return
      }

      setParsedArticles(result.articles)
      setImportStats({
        totalCount: result.totalCount,
        readyCount: result.readyCount,
        warningCount: result.warningCount,
        errorCount: result.errorCount
      })

      // Select all ready articles by default
      const readyArticleIds = result.articles
        .filter((article: ParsedArticle) => article.status === 'ready')
        .map((article: ParsedArticle) => article.id)
      setSelectedArticles(new Set(readyArticleIds))

      setImportStep('preview')
    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to process file'
      alert(`${errorMessage}. Please check the format and try again.`)
    } finally {
      setIsUploading(false)
    }
  }

  const startImport = async () => {
    const selectedArticlesList = parsedArticles.filter(article => 
      selectedArticles.has(article.id)
    )

    if (selectedArticlesList.length === 0) {
      alert('Please select at least one article to import.')
      return
    }

    setImportStep('processing')
    setImportProgress(0)

    try {
      const response = await fetch('/api/admin/import/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          articles: selectedArticlesList
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Import failed')
      }

      setImportResults(result.results)
      setImportProgress(100)
      setImportStep('complete')
    } catch (error) {
      console.error('Import error:', error)
      alert('Import failed. Please try again.')
      setImportStep('preview')
    }
  }

  const toggleArticleSelection = (articleId: string) => {
    const newSelected = new Set(selectedArticles)
    if (newSelected.has(articleId)) {
      newSelected.delete(articleId)
    } else {
      newSelected.add(articleId)
    }
    setSelectedArticles(newSelected)
  }

  const selectAllReady = () => {
    const readyArticles = parsedArticles
      .filter(article => article.status === 'ready')
      .map(article => article.id)
    setSelectedArticles(new Set(readyArticles))
  }

  const clearSelection = () => {
    setSelectedArticles(new Set())
  }

  const updateArticle = (articleId: string, updates: Partial<ParsedArticle>) => {
    setParsedArticles(prev => 
      prev.map(article => 
        article.id === articleId ? { ...article, ...updates } : article
      )
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <FileText className="w-4 h-4 text-gray-500" />
    }
  }

  const resetImport = () => {
    setImportStep('upload')
    setSelectedFile(null)
    setParsedArticles([])
    setImportStats(null)
    setSelectedArticles(new Set())
    setImportProgress(0)
    setImportResults(null)
    setCsvHeaders([])
    setFieldMappings({})
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Bulk Import</h1>
          <p className="text-muted-foreground">
            Import up to 1000 articles from CSV, XML, HTML, or ZIP files
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {[
              { step: 'upload', label: 'Upload', number: 1 },
              { step: 'mapping', label: 'Map Fields', number: 2 },
              { step: 'preview', label: 'Preview', number: 3 },
              { step: 'processing', label: 'Import', number: 4 },
              { step: 'complete', label: 'Complete', number: 5 }
            ].map(({ step, label, number }) => {
              const isActive = importStep === step
              const stepOrder = ['upload', 'mapping', 'preview', 'processing', 'complete']
              const isCompleted = stepOrder.indexOf(importStep) > stepOrder.indexOf(step)
              
              return (
                <div key={step} className={`flex items-center gap-2 ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isActive ? 'bg-blue-100 text-blue-600' : 
                    isCompleted ? 'bg-green-100 text-green-600' : 
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {number}
                  </div>
                  <span className="font-medium hidden sm:inline">{label}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Field Mapping Step */}
      {importStep === 'mapping' && (
        <Card>
          <CardHeader>
            <CardTitle>Map CSV Fields</CardTitle>
            <CardDescription>
              Match your CSV columns to the article fields. We've auto-detected some mappings based on column names.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Required fields are marked with *. If a field is not mapped, default values will be used.
              </p>
            </div>

            <div className="space-y-4">
              {articleFields.map((field) => (
                <div key={field.key} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div>
                    <Label className={field.required ? 'font-semibold' : ''}>
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </Label>
                    <p className="text-sm text-gray-600">{field.description}</p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <Select
                      value={fieldMappings[field.key] || ''}
                      onValueChange={(value) => {
                        if (value === 'none') {
                          const newMappings = { ...fieldMappings }
                          delete newMappings[field.key]
                          setFieldMappings(newMappings)
                        } else {
                          setFieldMappings({ ...fieldMappings, [field.key]: value })
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a column..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- No mapping --</SelectItem>
                        {csvHeaders.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold mb-2">CSV Preview</h4>
                <div className="text-sm text-gray-600">
                  <strong>Detected columns:</strong> {csvHeaders.join(', ')}
                </div>
              </div>

              <div className="flex gap-4 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setImportStep('upload')
                    setCsvHeaders([])
                    setFieldMappings({})
                  }}
                >
                  Back to Upload
                </Button>
                <Button 
                  onClick={processUpload}
                  disabled={!fieldMappings.title || !fieldMappings.content || isUploading}
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Continue to Preview'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Step */}
      {importStep === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
            <CardDescription>
              Select a file containing articles to import. Supports ZIP, CSV, XML, and HTML formats.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload Area */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Drag and drop your file here</h3>
              <p className="text-gray-600 mb-4">or click to browse files</p>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".zip,.csv,.xml,.html,.htm"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button variant="outline">
                Browse Files
              </Button>
            </div>

            {selectedFile && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Selected File:</h4>
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <div className="flex-1">
                    <div className="font-medium">{selectedFile.name}</div>
                    <div className="text-sm text-gray-600">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                  <Button
                    onClick={processUpload}
                    disabled={isUploading}
                    className="min-w-32"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Process Upload'
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Supported Formats */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">📋 Supported Formats</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800 mb-3">
                <div>
                  <strong>CSV Files:</strong> Headers: title, content, excerpt, category, author, image, date
                </div>
                <div>
                  <strong>XML Files:</strong> Standard RSS/XML format with article/item elements
                </div>
                <div>
                  <strong>HTML Files:</strong> Structured HTML with title, headings, and content
                </div>
                <div>
                  <strong>ZIP Files:</strong> Contains multiple HTML, Markdown, or CSV files
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-blue-600" />
                <a 
                  href="/sample-import.csv" 
                  download="sample-import.csv"
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm underline"
                >
                  Download Sample CSV Template
                </a>
                <span className="text-gray-400 mx-2">|</span>
                <a 
                  href="/sample-import-simple.csv" 
                  download="sample-import-simple.csv"
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm underline"
                >
                  Simple Version
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Step */}
      {importStep === 'preview' && (
        <div className="space-y-6">
          {/* Stats */}
          {importStats && (
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{importStats.totalCount}</div>
                    <div className="text-sm text-gray-600">Total Articles</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{importStats.readyCount}</div>
                    <div className="text-sm text-gray-600">Ready to Import</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{importStats.warningCount}</div>
                    <div className="text-sm text-gray-600">Warnings</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{importStats.errorCount}</div>
                    <div className="text-sm text-gray-600">Errors</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Selection Controls */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {selectedArticles.size} of {parsedArticles.length} articles selected
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllReady}>
                    Select All Ready
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearSelection}>
                    Clear Selection
                  </Button>
                  <Button 
                    onClick={startImport} 
                    disabled={selectedArticles.size === 0}
                    className="min-w-32"
                  >
                    Import Selected ({selectedArticles.size})
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Articles List */}
          <Card>
            <CardHeader>
              <CardTitle>Article Preview</CardTitle>
              <CardDescription>
                Review and edit articles before importing. Click the checkbox to include in import.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {parsedArticles.map((article) => (
                  <div key={article.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedArticles.has(article.id)}
                        onCheckedChange={() => toggleArticleSelection(article.id)}
                        disabled={article.status === 'error'}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(article.status)}
                          <h3 className="font-medium truncate">{article.title}</h3>
                          <Badge variant={article.status === 'ready' ? 'default' : article.status === 'warning' ? 'secondary' : 'destructive'}>
                            {article.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 mb-2">
                          <div>Category: {article.category}</div>
                          <div>Author: {article.author}</div>
                          <div>Words: {article.wordCount}</div>
                          <div>Size: {article.size}</div>
                        </div>
                        
                        <p className="text-sm text-gray-700 truncate">{article.excerpt}</p>
                        
                        {article.warnings.length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs text-yellow-600">
                              Warnings: {article.warnings.join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingArticle(article.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPreviewArticle(article.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Processing Step */}
      {importStep === 'processing' && (
        <Card>
          <CardHeader>
            <CardTitle>Importing Articles</CardTitle>
            <CardDescription>
              Please wait while we import your articles...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl mb-4">📚</div>
              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
              <p className="text-lg font-medium">{importProgress}% Complete</p>
              <p className="text-sm text-gray-600">
                Importing {selectedArticles.size} articles...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Complete Step */}
      {importStep === 'complete' && importResults && (
        <Card>
          <CardHeader>
            <CardTitle>Import Complete!</CardTitle>
            <CardDescription>
              Your articles have been successfully imported.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">{importResults.imported}</div>
                  <div className="text-sm text-green-700">Successfully Imported</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-600">{importResults.total}</div>
                  <div className="text-sm text-gray-700">Total Processed</div>
                </div>
                {importResults.failed > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-2xl font-bold text-red-600">{importResults.failed}</div>
                    <div className="text-sm text-red-700">Failed</div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-4 justify-center">
                <Link href="/admin/articles">
                  <Button>View Articles</Button>
                </Link>
                <Button variant="outline" onClick={resetImport}>
                  Import More
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 