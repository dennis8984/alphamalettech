# Fix Article Formatting Script

This script fixes the markdown formatting issues in articles that were imported to the database and updates images to use the original URLs from the CSV file.

## What it does

1. **Fixes Markdown Headers**: Converts markdown syntax (####, ###, ##) to proper HTML headers with styling
2. **Updates Images**: Uses original images from the CSV file where available
3. **Improves Lists**: Properly formats bullet points and lists
4. **Cleans HTML**: Removes any double-processed HTML tags
5. **Adds Styling**: Applies consistent Tailwind CSS classes for a professional look

## How to run

1. Make sure you're in the project directory:
   ```bash
   cd /Volumes/G-raid\ Thunderbolt/menshealth/alphamalettech
   ```

2. Run the formatting fix script:
   ```bash
   npm run tsx scripts/fix-article-formatting.ts
   ```

3. The script will:
   - Read all articles from the database
   - Extract original images from `articles-import.csv`
   - Fix the formatting of each article
   - Update the featured images
   - Report progress and results

## What to expect

- The script will process all articles in the database
- Each article will be reformatted with proper HTML structure
- Images will be updated to use the original URLs from the CSV
- You'll see progress messages for each article
- A summary will show how many articles were successfully updated

## After running

1. Visit your website to see the updated articles
2. Check that headers are properly formatted (not showing #### symbols)
3. Verify that images are loading correctly
4. Review the article layout and styling

## Troubleshooting

If you encounter errors:

1. Make sure your Supabase environment variables are set correctly
2. Ensure the `articles-import.csv` file exists in the project root
3. Check that you have the necessary dependencies installed (`npm install`)
4. Verify database connectivity

## Future imports

The `import-articles-from-markdown.ts` script has also been updated to use the improved markdown conversion, so future imports will automatically have correct formatting.