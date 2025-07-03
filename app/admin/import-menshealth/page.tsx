'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Download, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

// Men's Health category URLs from sitemap
const MENSHEALTH_CATEGORIES = {
  fitness: {
    name: 'Fitness',
    urls: [
      'https://www.menshealth.com/fitness/a64927434/incline-barbell-press-guide/',
      'https://www.menshealth.com/fitness/a64965159/ultimate-athleticism-workout-program/',
      'https://www.menshealth.com/fitness/a64937088/john-cena-workout-wwe/',
      'https://www.menshealth.com/fitness/a46780255/sumo-deadlift-benefits-how-to/',
      'https://www.menshealth.com/fitness/a64826090/beginner-gym-workout-plan/',
      'https://www.menshealth.com/fitness/a64800538/landmine-exercises/',
      'https://www.menshealth.com/fitness/a64900294/best-abs-exercises-ranked/',
      'https://www.menshealth.com/fitness/a64809087/chest-fly-guide/',
      'https://www.menshealth.com/fitness/a64884503/pull-up-benefits/',
      'https://www.menshealth.com/fitness/a64705624/abs-workouts/',
      'https://www.menshealth.com/fitness/a64743545/workout-in-jeans/',
      'https://www.menshealth.com/fitness/a64460865/strength-the-arnold-2025/',
      'https://www.menshealth.com/fitness/a64773165/rotational-power-exercises/',
      'https://www.menshealth.com/fitness/a64609038/working-out-after-becoming-a-dad/',
      'https://www.menshealth.com/fitness/a45749425/hip-mobility-exercises/',
      'https://www.menshealth.com/fitness/a19547847/10-best-dumbbell-exercises/',
      'https://www.menshealth.com/fitness/a25489022/best-leg-exercises/',
      'https://www.menshealth.com/fitness/a26011289/cable-machine-exercises/',
      'https://www.menshealth.com/fitness/a28459601/back-workouts-for-men/',
      'https://www.menshealth.com/fitness/a26782862/best-arm-exercises/'
    ]
  },
  nutrition: {
    name: 'Nutrition',
    urls: [
      'https://www.menshealth.com/nutrition/a64856036/is-soy-bad-for-men/',
      'https://www.menshealth.com/nutrition/a64965700/cottage-cheese-nutrition/',
      'https://www.menshealth.com/nutrition/a64900157/are-eggs-good-for-you/',
      'https://www.menshealth.com/nutrition/a60330532/protein-powder-weight-loss/',
      'https://www.menshealth.com/nutrition/a64758307/post-workout-meal/',
      'https://www.menshealth.com/nutrition/a64670274/healthiest-breads/',
      'https://www.menshealth.com/nutrition/a64705849/high-protein-breakfast-ideas/',
      'https://www.menshealth.com/nutrition/a19530290/foods-with-creatine/',
      'https://www.menshealth.com/nutrition/a19544094/is-peanut-butter-healthy/',
      'https://www.menshealth.com/nutrition/a19546897/high-protein-snacks/',
      'https://www.menshealth.com/nutrition/a26282018/foods-that-lower-cholesterol/',
      'https://www.menshealth.com/nutrition/a19545909/anti-inflammatory-foods/',
      'https://www.menshealth.com/nutrition/a20716562/best-protein-sources/',
      'https://www.menshealth.com/nutrition/a25257494/carnivore-diet/',
      'https://www.menshealth.com/nutrition/a22875172/keto-diet-foods/',
      'https://www.menshealth.com/nutrition/a25560106/intermittent-fasting-guide/',
      'https://www.menshealth.com/nutrition/a19539521/quinoa-health-benefits/',
      'https://www.menshealth.com/nutrition/a27422085/mediterranean-diet-benefits/',
      'https://www.menshealth.com/nutrition/a23590572/paleo-diet-guide/',
      'https://www.menshealth.com/nutrition/a28686587/plant-based-diet-benefits/'
    ]
  },
  health: {
    name: 'Health',
    urls: [
      'https://www.menshealth.com/health/a64947467/sleep-better-tonight/',
      'https://www.menshealth.com/health/a46900288/testosterone-levels-by-age/',
      'https://www.menshealth.com/health/a64812209/lower-back-pain-causes/',
      'https://www.menshealth.com/health/a64705988/stress-management-techniques/',
      'https://www.menshealth.com/health/a27420731/how-to-lower-blood-pressure/',
      'https://www.menshealth.com/health/a64670489/best-vitamins-for-men/',
      'https://www.menshealth.com/health/a19546889/boost-testosterone-naturally/',
      'https://www.menshealth.com/health/a20065737/how-to-sleep-better/',
      'https://www.menshealth.com/health/a19530009/back-pain-relief/',
      'https://www.menshealth.com/health/a26266865/anxiety-symptoms-men/',
      'https://www.menshealth.com/health/a29468809/depression-in-men/',
      'https://www.menshealth.com/health/a19547835/heart-disease-prevention/',
      'https://www.menshealth.com/health/a25899298/diabetes-symptoms/',
      'https://www.menshealth.com/health/a27556713/high-cholesterol-foods-to-avoid/',
      'https://www.menshealth.com/health/a19546347/prostate-health/',
      'https://www.menshealth.com/health/a26051325/mental-health-tips/',
      'https://www.menshealth.com/health/a19530409/muscle-recovery-tips/',
      'https://www.menshealth.com/health/a28459708/immune-system-boost/',
      'https://www.menshealth.com/health/a20065258/gut-health-guide/',
      'https://www.menshealth.com/health/a25252627/joint-pain-relief/'
    ]
  },
  style: {
    name: 'Style',
    urls: [
      'https://www.menshealth.com/style/a64947234/best-gym-clothes-men/',
      'https://www.menshealth.com/style/a60457298/best-running-shoes/',
      'https://www.menshealth.com/style/a26284025/best-workout-clothes/',
      'https://www.menshealth.com/style/a25616146/best-gym-bags/',
      'https://www.menshealth.com/style/a20717387/best-watches-for-men/',
      'https://www.menshealth.com/style/a26953521/best-beard-styles/',
      'https://www.menshealth.com/style/a19545982/how-to-dress-well/',
      'https://www.menshealth.com/style/a26322087/best-haircuts-for-men/',
      'https://www.menshealth.com/style/a19539647/cologne-guide/',
      'https://www.menshealth.com/style/a25250198/skincare-routine-men/',
      'https://www.menshealth.com/style/a19528847/business-casual-guide/',
      'https://www.menshealth.com/style/a26281037/best-jeans-for-men/',
      'https://www.menshealth.com/style/a19530287/shoe-guide-men/',
      'https://www.menshealth.com/style/a25899612/grooming-tips/',
      'https://www.menshealth.com/style/a19545120/suit-guide/',
      'https://www.menshealth.com/style/a27420856/best-sunglasses-men/',
      'https://www.menshealth.com/style/a19538294/workout-gear-essentials/',
      'https://www.menshealth.com/style/a26765432/athleisure-guide/',
      'https://www.menshealth.com/style/a19547281/accessories-for-men/',
      'https://www.menshealth.com/style/a28689214/wardrobe-essentials/'
    ]
  },
  'weight-loss': {
    name: 'Weight Loss',
    urls: [
      'https://www.menshealth.com/weight-loss/a19546872/how-to-lose-weight/',
      'https://www.menshealth.com/weight-loss/a27454875/lose-belly-fat/',
      'https://www.menshealth.com/weight-loss/a19530483/fat-burning-foods/',
      'https://www.menshealth.com/weight-loss/a26282936/intermittent-fasting-weight-loss/',
      'https://www.menshealth.com/weight-loss/a19545297/weight-loss-tips-men/',
      'https://www.menshealth.com/weight-loss/a25616891/cardio-vs-weights/',
      'https://www.menshealth.com/weight-loss/a19528956/metabolism-boost/',
      'https://www.menshealth.com/weight-loss/a26953874/calorie-deficit-guide/',
      'https://www.menshealth.com/weight-loss/a19539821/meal-prep-weight-loss/',
      'https://www.menshealth.com/weight-loss/a27556098/hiit-workouts-fat-loss/',
      'https://www.menshealth.com/weight-loss/a19546503/protein-weight-loss/',
      'https://www.menshealth.com/weight-loss/a25899763/weight-loss-mistakes/',
      'https://www.menshealth.com/weight-loss/a19530672/water-weight-loss/',
      'https://www.menshealth.com/weight-loss/a28459821/fat-burner-supplements/',
      'https://www.menshealth.com/weight-loss/a19545619/weight-loss-plateau/',
      'https://www.menshealth.com/weight-loss/a26281549/keto-weight-loss/',
      'https://www.menshealth.com/weight-loss/a19538475/strength-training-weight-loss/',
      'https://www.menshealth.com/weight-loss/a27420981/weight-loss-meal-plan/',
      'https://www.menshealth.com/weight-loss/a19547398/portion-control-guide/',
      'https://www.menshealth.com/weight-loss/a25250367/sustainable-weight-loss/'
    ]
  },
  entertainment: {
    name: 'Entertainment',
    urls: [
      'https://www.menshealth.com/entertainment/a28426892/chris-hemsworth-workout/',
      'https://www.menshealth.com/entertainment/a29795834/the-rock-diet-workout/',
      'https://www.menshealth.com/entertainment/a30212016/michael-b-jordan-workout/',
      'https://www.menshealth.com/entertainment/a25618821/chris-evans-workout/',
      'https://www.menshealth.com/entertainment/a19546091/celebrity-fitness-secrets/',
      'https://www.menshealth.com/entertainment/a27423561/jason-momoa-workout/',
      'https://www.menshealth.com/entertainment/a19531076/action-movie-workouts/',
      'https://www.menshealth.com/entertainment/a26954218/superhero-workouts/',
      'https://www.menshealth.com/entertainment/a19540182/tom-hardy-workout/',
      'https://www.menshealth.com/entertainment/a28690347/mark-wahlberg-routine/',
      'https://www.menshealth.com/entertainment/a19546814/henry-cavill-superman-workout/',
      'https://www.menshealth.com/entertainment/a25900156/brad-pitt-fight-club-workout/',
      'https://www.menshealth.com/entertainment/a19531398/movie-star-diets/',
      'https://www.menshealth.com/entertainment/a27557234/john-krasinski-workout/',
      'https://www.menshealth.com/entertainment/a19545923/ryan-reynolds-workout/',
      'https://www.menshealth.com/entertainment/a26282473/celebrity-transformation/',
      'https://www.menshealth.com/entertainment/a19539158/athlete-training-secrets/',
      'https://www.menshealth.com/entertainment/a25617042/nfl-player-workouts/',
      'https://www.menshealth.com/entertainment/a19547512/mma-fighter-training/',
      'https://www.menshealth.com/entertainment/a28460195/fitness-documentaries/'
    ]
  }
}

export default function ImportMensHealthPage() {
  const [importing, setImporting] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [progress, setProgress] = useState<{[key: string]: number}>({})
  const [loadingSitemap, setLoadingSitemap] = useState(false)
  const [dynamicCategories, setDynamicCategories] = useState<any>(null)

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  // Fetch fresh articles from sitemap
  const fetchLatestArticles = async () => {
    setLoadingSitemap(true)
    try {
      const response = await fetch('/api/admin/import/menshealth-sitemap')
      const data = await response.json()
      
      if (data.success) {
        setDynamicCategories(data.categories)
      }
    } catch (error) {
      console.error('Failed to fetch sitemap:', error)
    } finally {
      setLoadingSitemap(false)
    }
  }

  // Use dynamic categories if available, otherwise fallback to hardcoded
  const availableCategories = dynamicCategories || MENSHEALTH_CATEGORIES

  const handleImport = async () => {
    if (selectedCategories.length === 0) {
      alert('Please select at least one category to import')
      return
    }

    setImporting(true)
    setResults(null)
    setProgress({})

    const allResults: any[] = []

    try {
      // Process each selected category
      for (const categoryKey of selectedCategories) {
        const category = availableCategories[categoryKey as keyof typeof availableCategories]
        
        setProgress(prev => ({ ...prev, [categoryKey]: 0 }))

        const response = await fetch('/api/admin/import/menshealth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            urls: category.urls.slice(0, 20), // Limit to 20 articles
            category: categoryKey
          })
        })

        const data = await response.json()
        
        allResults.push({
          category: categoryKey,
          categoryName: category.name,
          ...data
        })

        setProgress(prev => ({ ...prev, [categoryKey]: 100 }))

        // Add delay between categories to avoid rate limits
        if (selectedCategories.indexOf(categoryKey) < selectedCategories.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 10000)) // 10 second delay
        }
      }

      setResults({
        success: true,
        categories: allResults,
        totalImported: allResults.reduce((sum, cat) => sum + (cat.successCount || 0), 0),
        totalFailed: allResults.reduce((sum, cat) => sum + (cat.errorCount || 0), 0)
      })

    } catch (error) {
      console.error('Import error:', error)
      setResults({
        success: false,
        error: 'Import failed. Check console for details.'
      })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Import from Men's Health</h1>
          <p className="text-muted-foreground">
            Import and enhance articles from Men's Health website by category
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Categories to Import</CardTitle>
          <CardDescription>
            Choose which categories to import. Each category will import up to 20 articles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Fetch Latest Articles Button */}
            {!dynamicCategories && (
              <div className="mb-4">
                <Button 
                  onClick={fetchLatestArticles}
                  disabled={loadingSitemap || importing}
                  variant="outline"
                  className="w-full"
                >
                  {loadingSitemap ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Fetching Latest Articles...
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Fetch Latest Articles from Men's Health
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Category Selection */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {Object.entries(availableCategories).map(([key, category]) => (
                <div
                  key={key}
                  onClick={() => !importing && toggleCategory(key)}
                  className={`
                    border rounded-lg p-4 cursor-pointer transition-all
                    ${selectedCategories.includes(key) 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                    ${importing ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.urls.length} articles</p>
                    </div>
                    {selectedCategories.includes(key) && (
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  {importing && progress[key] !== undefined && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${progress[key]}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Important:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Articles will be completely rewritten by Claude AI</li>
                <li>• Original images will be preserved and distributed throughout</li>
                <li>• Each article will include a conclusion and FAQ section</li>
                <li>• Process takes about 5-10 minutes per category</li>
                <li>• Selected categories: {selectedCategories.length}</li>
                <li>• Total articles to import: {selectedCategories.reduce((sum, cat) => 
                  sum + Math.min(20, availableCategories[cat as keyof typeof availableCategories]?.urls.length || 0), 0)}</li>
              </ul>
            </div>

            <Button 
              onClick={handleImport} 
              disabled={importing || selectedCategories.length === 0}
              className="w-full"
              size="lg"
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing Articles...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Import Selected Categories ({selectedCategories.length})
                </>
              )}
            </Button>

            {results && (
              <div className="mt-6 space-y-4">
                <div className={`p-4 rounded-lg ${results.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <h3 className={`font-semibold mb-2 ${results.success ? 'text-green-900' : 'text-red-900'}`}>
                    {results.success ? '✅ Import Complete' : '❌ Import Failed'}
                  </h3>
                  {results.success && (
                    <div className="text-sm text-green-700">
                      <p>Total Imported: {results.totalImported} articles</p>
                      <p>Failed: {results.totalFailed} articles</p>
                    </div>
                  )}
                  {results.error && (
                    <p className="text-sm text-red-700">{results.error}</p>
                  )}
                </div>

                {results.categories && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Import Results by Category:</h3>
                    {results.categories.map((catResult: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">{catResult.categoryName}</h4>
                        <div className="text-sm text-gray-600">
                          <p>Processed: {catResult.totalProcessed || 0}</p>
                          <p>Success: {catResult.successCount || 0}</p>
                          <p>Failed: {catResult.errorCount || 0}</p>
                        </div>
                        
                        {catResult.results && catResult.results.length > 0 && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-700">
                              View Details
                            </summary>
                            <div className="mt-2 space-y-1">
                              {catResult.results.map((result: any, idx: number) => (
                                <div 
                                  key={idx}
                                  className={`text-xs p-2 rounded ${
                                    result.status === 'success' 
                                      ? 'bg-green-50 text-green-700' 
                                      : 'bg-red-50 text-red-700'
                                  }`}
                                >
                                  <div className="flex items-center gap-1">
                                    {result.status === 'success' ? (
                                      <CheckCircle className="w-3 h-3" />
                                    ) : (
                                      <XCircle className="w-3 h-3" />
                                    )}
                                    <span className="font-medium truncate">{result.title || result.url}</span>
                                  </div>
                                  {result.error && (
                                    <p className="mt-1 pl-4">{result.error}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {results.success && results.totalImported > 0 && (
                  <div className="mt-4">
                    <Link href="/admin/articles">
                      <Button variant="outline" className="w-full">
                        View Imported Articles
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}