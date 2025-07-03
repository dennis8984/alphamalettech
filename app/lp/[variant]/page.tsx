import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, TrendingUp, Users, Award } from 'lucide-react'
import { AdSlot } from '@/components/ui/ad-slot'
import { PageTracker } from '@/components/ui/page-tracker'

// Landing page variants for A/B testing
const VARIANTS = {
  a: {
    headline: "Transform Your Body with Expert Fitness & Nutrition Guidance",
    subheadline: "Join thousands of men achieving their health goals with science-backed advice",
    cta: "Start Your Journey",
    benefits: [
      "Personalized workout plans",
      "Nutrition strategies that work",
      "Expert health advice",
      "Real results, guaranteed"
    ]
  },
  b: {
    headline: "Get Stronger, Leaner, and Healthier in 30 Days",
    subheadline: "Proven strategies from fitness experts and nutritionists",
    cta: "Get Started Now",
    benefits: [
      "Build muscle fast",
      "Lose stubborn fat",
      "Boost energy levels",
      "Feel confident again"
    ]
  },
  c: {
    headline: "The Ultimate Men's Health & Fitness Resource",
    subheadline: "Everything you need to build your best body",
    cta: "Explore Now",
    benefits: [
      "1000+ workout guides",
      "Meal plans & recipes",
      "Supplement reviews",
      "Success stories"
    ]
  }
}

interface PageProps {
  params: { variant: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const variant = VARIANTS[params.variant as keyof typeof VARIANTS] || VARIANTS.a
  const keyword = searchParams.q || searchParams.utm_term || 'fitness'
  
  return {
    title: `${keyword} - ${variant.headline} | Men's Hub`,
    description: variant.subheadline,
    openGraph: {
      title: variant.headline,
      description: variant.subheadline,
      type: 'website',
    },
  }
}

export default function LandingPage({ params, searchParams }: PageProps) {
  const variant = VARIANTS[params.variant as keyof typeof VARIANTS] || VARIANTS.a
  const keyword = (searchParams.q || searchParams.utm_term || '') as string
  
  // Determine primary category based on keyword
  let primaryCategory = 'fitness'
  let categoryDisplay = 'Fitness'
  
  if (keyword) {
    const lowerKeyword = keyword.toLowerCase()
    if (lowerKeyword.includes('nutrition') || lowerKeyword.includes('diet')) {
      primaryCategory = 'nutrition'
      categoryDisplay = 'Nutrition'
    } else if (lowerKeyword.includes('health') || lowerKeyword.includes('wellness')) {
      primaryCategory = 'health'
      categoryDisplay = 'Health'
    } else if (lowerKeyword.includes('weight') || lowerKeyword.includes('loss')) {
      primaryCategory = 'weight-loss'
      categoryDisplay = 'Weight Loss'
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <PageTracker />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold">
              <span className="bg-red-600 text-white px-2 py-1">MEN'S</span>
              <span className="text-black ml-1">HUB</span>
            </h1>
          </Link>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {variant.headline}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300">
              {variant.subheadline}
            </p>
            
            {keyword && (
              <p className="text-lg mb-8 text-red-400">
                Specially curated for: <span className="font-semibold">{keyword}</span>
              </p>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/articles/${primaryCategory}`}>
                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg">
                  {variant.cta}
                </Button>
              </Link>
              <Link href="/search">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-6 text-lg">
                  Search Articles
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Why Men's Hub?</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {variant.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <p className="text-lg text-gray-700">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Ad Slot */}
      <AdSlot placement="mid-article" className="container mx-auto px-4 my-8" />
      
      {/* Social Proof */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="flex justify-center mb-4">
                  <Users className="w-12 h-12 text-red-600" />
                </div>
                <div className="text-3xl font-bold mb-2">50,000+</div>
                <p className="text-gray-600">Active Readers</p>
              </div>
              <div>
                <div className="flex justify-center mb-4">
                  <TrendingUp className="w-12 h-12 text-red-600" />
                </div>
                <div className="text-3xl font-bold mb-2">1,000+</div>
                <p className="text-gray-600">Expert Articles</p>
              </div>
              <div>
                <div className="flex justify-center mb-4">
                  <Award className="w-12 h-12 text-red-600" />
                </div>
                <div className="text-3xl font-bold mb-2">95%</div>
                <p className="text-gray-600">Success Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Explore Our Categories</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className={primaryCategory === 'fitness' ? 'border-red-600 border-2' : ''}>
                <CardHeader>
                  <CardTitle>Fitness</CardTitle>
                  <CardDescription>
                    Workouts, training plans, and exercise guides
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/articles/fitness">
                    <Button className="w-full" variant={primaryCategory === 'fitness' ? 'default' : 'outline'}>
                      Explore Fitness
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              
              <Card className={primaryCategory === 'nutrition' ? 'border-red-600 border-2' : ''}>
                <CardHeader>
                  <CardTitle>Nutrition</CardTitle>
                  <CardDescription>
                    Diet plans, recipes, and supplement guides
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/articles/nutrition">
                    <Button className="w-full" variant={primaryCategory === 'nutrition' ? 'default' : 'outline'}>
                      Explore Nutrition
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              
              <Card className={primaryCategory === 'health' ? 'border-red-600 border-2' : ''}>
                <CardHeader>
                  <CardTitle>Health</CardTitle>
                  <CardDescription>
                    Wellness tips, medical advice, and lifestyle guides
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/articles/health">
                    <Button className="w-full" variant={primaryCategory === 'health' ? 'default' : 'outline'}>
                      Explore Health
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-red-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Life?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of men who are already seeing results with our expert guidance
          </p>
          <Link href={`/articles/${primaryCategory}`}>
            <Button size="lg" variant="secondary" className="px-8 py-6 text-lg">
              Start Today - It's Free
            </Button>
          </Link>
        </div>
      </section>
      
      {/* Footer Ad */}
      <AdSlot placement="footer" className="container mx-auto px-4 py-8" />
    </div>
  )
}