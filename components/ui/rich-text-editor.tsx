'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Bold, Italic, List, Link as LinkIcon, Upload } from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onImageUpload?: () => void
}

export function RichTextEditor({ value, onChange, placeholder, onImageUpload }: RichTextEditorProps) {
  const [selectedFormat, setSelectedFormat] = useState('paragraph')
  const editorRef = useRef<HTMLTextAreaElement>(null)

  const insertTextAtCursor = useCallback((textToInsert: string, wrapSelection = false) => {
    const editor = editorRef.current
    if (!editor) return

    const start = editor.selectionStart
    const end = editor.selectionEnd
    const selectedText = value.substring(start, end)
    
    let newText: string
    let newCursorPos: number

    if (wrapSelection && selectedText) {
      // Wrap selected text
      newText = value.substring(0, start) + textToInsert + selectedText + textToInsert + value.substring(end)
      newCursorPos = start + textToInsert.length + selectedText.length + textToInsert.length
    } else {
      // Insert at cursor
      newText = value.substring(0, start) + textToInsert + value.substring(end)
      newCursorPos = start + textToInsert.length
    }

    onChange(newText)

    // Restore cursor position
    setTimeout(() => {
      editor.focus()
      editor.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }, [value, onChange])

  const formatBold = () => {
    const editor = editorRef.current
    if (!editor) return

    const start = editor.selectionStart
    const end = editor.selectionEnd
    const selectedText = value.substring(start, end)

    if (selectedText) {
      insertTextAtCursor('**', true)
    } else {
      insertTextAtCursor('**bold text**')
    }
  }

  const formatItalic = () => {
    const editor = editorRef.current
    if (!editor) return

    const start = editor.selectionStart
    const end = editor.selectionEnd
    const selectedText = value.substring(start, end)

    if (selectedText) {
      insertTextAtCursor('*', true)
    } else {
      insertTextAtCursor('*italic text*')
    }
  }

  const insertList = () => {
    insertTextAtCursor('\n- List item\n- List item\n- List item\n')
  }

  const insertLink = () => {
    const editor = editorRef.current
    if (!editor) return

    const start = editor.selectionStart
    const end = editor.selectionEnd
    const selectedText = value.substring(start, end)

    if (selectedText) {
      insertTextAtCursor(`[${selectedText}](https://example.com)`)
    } else {
      insertTextAtCursor('[link text](https://example.com)')
    }
  }

  const applyHeading = (level: string) => {
    const editor = editorRef.current
    if (!editor) return

    const start = editor.selectionStart
    const lines = value.substring(0, start).split('\n')
    const currentLineStart = value.lastIndexOf('\n', start - 1) + 1
    const currentLineEnd = value.indexOf('\n', start)
    const lineEnd = currentLineEnd === -1 ? value.length : currentLineEnd
    const currentLine = value.substring(currentLineStart, lineEnd)

    let newLine: string
    switch (level) {
      case 'h1':
        newLine = currentLine.replace(/^#+\s*/, '') // Remove existing headers
        newLine = `# ${newLine}`
        break
      case 'h2':
        newLine = currentLine.replace(/^#+\s*/, '')
        newLine = `## ${newLine}`
        break
      case 'h3':
        newLine = currentLine.replace(/^#+\s*/, '')
        newLine = `### ${newLine}`
        break
      default:
        newLine = currentLine.replace(/^#+\s*/, '') // Remove header formatting
        break
    }

    const newText = value.substring(0, currentLineStart) + newLine + value.substring(lineEnd)
    onChange(newText)

    setTimeout(() => {
      editor.focus()
      const newCursorPos = currentLineStart + newLine.length
      editor.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const handleFormatChange = (format: string) => {
    setSelectedFormat(format)
    applyHeading(format)
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="border-b p-2 bg-gray-50 flex items-center gap-1 flex-wrap">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onImageUpload}
          title="Upload Image"
        >
          <Upload className="w-4 h-4 mr-1" />
          Image
        </Button>
        
        <div className="h-6 w-px bg-gray-300 mx-1" />
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={formatBold}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={formatItalic}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </Button>
        
        <div className="h-6 w-px bg-gray-300 mx-1" />
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={insertList}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={insertLink}
          title="Insert Link"
        >
          <LinkIcon className="w-4 h-4" />
        </Button>
        
        <div className="h-6 w-px bg-gray-300 mx-1" />
        
        <Select value={selectedFormat} onValueChange={handleFormatChange}>
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

      {/* Editor */}
      <div className="relative">
        <textarea
          ref={editorRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-[400px] p-4 border-0 resize-none focus:ring-0 focus:outline-none"
          onKeyDown={(e) => {
            // Handle keyboard shortcuts
            if (e.ctrlKey || e.metaKey) {
              switch (e.key) {
                case 'b':
                  e.preventDefault()
                  formatBold()
                  break
                case 'i':
                  e.preventDefault()
                  formatItalic()
                  break
              }
            }
          }}
        />
      </div>
    </div>
  )
} 