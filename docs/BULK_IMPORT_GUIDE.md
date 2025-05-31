# Bulk Import Guide

## Overview

The bulk import system allows you to import up to 1000 articles at once from various file formats including CSV, XML, HTML, and ZIP files. The system now includes an intelligent field mapping feature for CSV files.

## Supported Formats

### CSV Files
- **Headers**: Flexible column naming with field mapping
- **Encoding**: UTF-8
- **Max rows**: 1000 articles

### XML Files  
- Standard RSS/XML format
- Supports `<item>` or `<article>` elements

### HTML Files
- Single article per file
- Extracts title, content, and metadata

### ZIP Files
- Can contain multiple HTML, Markdown, or CSV files
- Processes all files in the archive

## CSV Field Mapping

### How It Works

1. **Upload CSV**: When you upload a CSV file, the system detects all column headers
2. **Auto-Detection**: Common column names are automatically mapped:
   - `title`, `headline` → Title field
   - `content`, `body`, `description` → Content field
   - `excerpt`, `summary` → Excerpt field
   - `category`, `tag` → Category field
   - `author`, `writer` → Author field
   - `image`, `thumbnail` → Image URL field
   - `date`, `publishDate` → Date field

3. **Manual Mapping**: Review and adjust mappings as needed
4. **Required Fields**: Title and Content are required for import

### Sample CSV Format

Download the sample template from `/sample-import.csv`. Here's the structure:

```csv
title,content,excerpt,category,author,image,date
"Article Title","Full article content here...","Short summary","fitness","John Doe","https://example.com/image.jpg","2024-01-15"
```

### Custom Column Names

You can use any column names in your CSV. Examples:

- `headline` → map to Title
- `article_body` → map to Content  
- `writer_name` → map to Author
- `publication_date` → map to Date

## Import Process

### Step 1: Upload
1. Click "Browse Files" or drag and drop your file
2. Supported formats: .csv, .xml, .html, .htm, .zip
3. Max file size: 50MB

### Step 2: Field Mapping (CSV only)
1. Review detected columns
2. Map your columns to article fields
3. Required: Title and Content
4. Optional: Excerpt, Category, Author, Image, Date

### Step 3: Preview
1. Review parsed articles
2. Check for warnings or errors
3. Select articles to import
4. Edit individual articles if needed

### Step 4: Import
1. Click "Import Selected"
2. Monitor progress
3. Review import results

## Field Defaults

If fields are not mapped or empty:

- **Excerpt**: First 200 characters of content
- **Category**: Auto-detected from content or defaults to "health"
- **Author**: "Imported Author"
- **Image**: Default placeholder image
- **Date**: Current date

## Category Detection

The system automatically detects categories based on content keywords:

- **fitness**: workout, exercise, training, muscle
- **nutrition**: protein, diet, nutrition, food
- **weight-loss**: weight, fat, lose, slim
- **style**: style, fashion, clothing, shoes
- **entertainment**: movie, show, entertainment, streaming
- **health**: default category

## Validation Rules

- **Title**: Required, max 200 characters
- **Content**: Required, min 100 words for valid article
- **Slug**: Auto-generated from title, must be unique
- **Word Count**: 
  - < 100 words: Error status
  - 100-300 words: Warning status
  - > 300 words: Ready status

## Best Practices

1. **Clean Data**: Ensure your CSV has consistent formatting
2. **HTML Content**: The system accepts HTML in content fields
3. **Images**: Use absolute URLs for images
4. **Dates**: Use ISO format (YYYY-MM-DD) for best results
5. **Categories**: Use standard category names for proper classification

## Troubleshooting

### Common Issues

1. **"No mapping for required fields"**
   - Ensure Title and Content columns are mapped
   
2. **"Articles too short"**
   - Content should be at least 100 words
   
3. **"Invalid date format"**
   - Use YYYY-MM-DD format

4. **"Duplicate slugs"**
   - System auto-appends numbers to ensure uniqueness

### Performance Tips

- Import in batches of 100-500 for best performance
- Compress multiple HTML files into a ZIP
- Use CSV for bulk imports with consistent structure

## API Usage

For programmatic imports, POST to `/api/admin/import/upload`:

```javascript
const formData = new FormData()
formData.append('file', file)
formData.append('fieldMappings', JSON.stringify({
  title: 'headline',
  content: 'article_body',
  author: 'writer_name'
}))

const response = await fetch('/api/admin/import/upload', {
  method: 'POST',
  body: formData
})
```

## Support

For issues or questions:
- Check article warnings in preview
- Ensure proper file encoding (UTF-8)
- Validate against sample template
- Contact support with error messages 