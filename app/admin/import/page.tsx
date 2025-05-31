'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Upload, FileText, AlertCircle, CheckCircle, Download } from 'lucide-react'
import Link from 'next/link'

// Mock import preview data
const mockImportPreview = [
  {
    id: '1',
    filename: 'ultimate-muscle-building-guide.html',
    title: 'Ultimate Muscle Building Guide',
    status: 'ready',
    size: '45KB',
    wordCount: 2340,
    images: 5,
    warnings: []
  },
  {
    id: '2',
    filename: 'protein-foods-men.md',
    title: 'Top 10 Protein-Rich Foods for Men',
    status: 'ready',
    size: '23KB',
    wordCount: 1580,
    images: 3,
    warnings: []
  },
  {
    id: '3',
    filename: 'mental-health-tips.html',
    title: 'Mental Health Tips for Modern Men',
    status: 'warning',
    size: '67KB',
    wordCount: 3240,
    images: 8,
    warnings: ['Large file size', 'Missing alt tags on 2 images']
  },
]

export default function ImportPage() {
  const [importStep, setImportStep] = useState<'upload' | 'preview' | 'processing' | 'complete'>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importProgress, setImportProgress] = useState(0)
  const [previewData, setPreviewData] = useState(mockImportPreview)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.name.endsWith('.zip')) {
      setSelectedFile(file)
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.zip')) {
      setSelectedFile(file)
    }
  }, [])

  const processUpload = () => {
    setImportStep('preview')
  }

  const startImport = () => {
    setImportStep('processing')
    // Simulate import progress
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setImportProgress(progress)
      if (progress >= 100) {
        clearInterval(interval)
        setImportStep('complete')
      }
    }, 200)
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

  return (
    <div className="container mx-auto py-6 max-w-4xl">
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
            Import multiple articles from ZIP files with HTML or Markdown content
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 ${importStep === 'upload' ? 'text-blue-600' : 'text-green-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${importStep === 'upload' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                1
              </div>
              <span className="font-medium">Upload</span>
            </div>
            <div className={`flex items-center gap-2 ${importStep === 'preview' ? 'text-blue-600' : importStep === 'processing' || importStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${importStep === 'preview' ? 'bg-blue-100 text-blue-600' : importStep === 'processing' || importStep === 'complete' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                2
              </div>
              <span className="font-medium">Preview</span>
            </div>
            <div className={`flex items-center gap-2 ${importStep === 'processing' ? 'text-blue-600' : importStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${importStep === 'processing' ? 'bg-blue-100 text-blue-600' : importStep === 'complete' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                3
              </div>
              <span className="font-medium">Import</span>
            </div>
            <div className={`flex items-center gap-2 ${importStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${importStep === 'complete' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                4
              </div>
              <span className="font-medium">Complete</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Step */}
      {importStep === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle>Upload ZIP File</CardTitle>
            <CardDescription>
              Select a ZIP file containing HTML or Markdown files to import as articles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload Area */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Drag and drop your ZIP file here</h3>
              <p className="text-gray-600 mb-4">or click to browse files</p>
              <Input
                type="file"
                accept=".zip"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <Label htmlFor="file-upload">
                <Button variant="outline" className="cursor-pointer">
                  Browse Files
                </Button>
              </Label>
            </div>

            {selectedFile && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Selected File:</h4>
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="font-medium">{selectedFile.name}</div>
                    <div className="text-sm text-gray-600">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Supported Formats</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• HTML files (.html, .htm)</li>
                <li>• Markdown files (.md, .markdown)</li>
                <li>• Images will be automatically processed and uploaded</li>
                <li>• File names will be used to generate article slugs</li>
              </ul>
            </div>

            <Button 
              onClick={processUpload} 
              disabled={!selectedFile}
              className="w-full"
            >
              Process Upload
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Preview Step */}
      {importStep === 'preview' && (
        <Card>
          <CardHeader>
            <CardTitle>Import Preview</CardTitle>
            <CardDescription>
              Review the articles that will be imported and fix any issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {previewData.map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(item.status)}
                      <div>
                        <h4 className="font-semibold">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.filename}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>{item.size}</span>
                          <span>{item.wordCount.toLocaleString()} words</span>
                          <span>{item.images} images</span>
                        </div>
                        {item.warnings.length > 0 && (
                          <div className="mt-2">
                            <div className="text-sm font-medium text-yellow-700">Warnings:</div>
                            <ul className="text-sm text-yellow-600 list-disc list-inside">
                              {item.warnings.map((warning, idx) => (
                                <li key={idx}>{warning}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setImportStep('upload')}>
                Back to Upload
              </Button>
              <Button onClick={startImport} className="flex-1">
                Import {previewData.length} Articles
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Step */}
      {importStep === 'processing' && (
        <Card>
          <CardHeader>
            <CardTitle>Importing Articles</CardTitle>
            <CardDescription>
              Please wait while we process and import your articles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">{importProgress}%</div>
              {/* Temporary Progress Bar Replacement */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${importProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Processing articles and uploading images...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Complete Step */}
      {importStep === 'complete' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              Import Complete
            </CardTitle>
            <CardDescription>
              All articles have been successfully imported
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">3</div>
                <div className="text-sm text-gray-600">Articles Imported</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">16</div>
                <div className="text-sm text-gray-600">Images Processed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">7,160</div>
                <div className="text-sm text-gray-600">Total Words</div>
              </div>
            </div>

            <div className="flex gap-3">
              <Link href="/admin/articles" className="flex-1">
                <Button className="w-full">
                  View Articles
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => {
                  setImportStep('upload')
                  setSelectedFile(null)
                  setImportProgress(0)
                }}
              >
                Import More
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 