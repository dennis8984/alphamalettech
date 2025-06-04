import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with demo content...')

  try {
    // Create demo user/author
    const authorEmail = 'admin@menshealth.com'
    let author = await prisma.user.findUnique({
      where: { email: authorEmail }
    })

    if (!author) {
      author = await prisma.user.create({
        data: {
          email: authorEmail,
          name: 'Admin User',
          role: 'admin'
        }
      })
      console.log('✅ Created admin user')
    }

    // Create categories
    const categories = [
      { name: 'Fitness', slug: 'fitness' },
      { name: 'Nutrition', slug: 'nutrition' },
      { name: 'Health', slug: 'health' },
      { name: 'Weight Loss', slug: 'weight-loss' },
      { name: 'Supplements', slug: 'supplements' },
      { name: 'Style', slug: 'style' }
    ]

    for (const cat of categories) {
      await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat
      })
    }
    console.log('✅ Created categories')

    // Create tags
    const tags = [
      'workout', 'nutrition', 'muscle-building', 'cardio', 'strength-training',
      'weight-loss', 'protein', 'supplements', 'testosterone', 'recovery',
      'motivation', 'health-tips', 'diet', 'fitness-goals', 'exercise'
    ]

    for (const tagName of tags) {
      await prisma.tag.upsert({
        where: { slug: tagName },
        update: {},
        create: {
          name: tagName.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          slug: tagName
        }
      })
    }
    console.log('✅ Created tags')

    // Get fitness category for articles
    const fitnessCategory = await prisma.category.findUnique({
      where: { slug: 'fitness' }
    })

    // Create demo articles
    const articles = [
      {
        title: 'The Ultimate Guide to Building Muscle Mass',
        slug: 'ultimate-guide-building-muscle-mass',
        excerpt: 'Discover the science-backed strategies that will help you build lean muscle faster than ever before.',
        content: `
<div class="bg-red-50 border-l-4 border-red-600 p-6 mb-8 rounded-r-lg">
  <h3 class="text-lg font-bold text-red-900 mb-4">Quick Takeaways</h3>
  <ul class="space-y-3 text-red-800">
    <li class="flex items-start"><span class="text-red-600 font-bold mr-3">•</span><span class="leading-relaxed">Progressive overload is the key to continuous muscle growth</span></li>
    <li class="flex items-start"><span class="text-red-600 font-bold mr-3">•</span><span class="leading-relaxed">Protein timing matters more than you think</span></li>
    <li class="flex items-start"><span class="text-red-600 font-bold mr-3">•</span><span class="leading-relaxed">Recovery is when the magic happens</span></li>
  </ul>
</div>

<h2 class="text-2xl font-bold text-gray-900 mt-12 mb-6 leading-tight">Why Progressive Overload Changes Everything</h2>

<p class="mb-6 text-gray-700 leading-relaxed">Your muscles adapt quickly to the same stimulus. If you're lifting the same weights week after week, you're essentially telling your body it doesn't need to grow anymore. Progressive overload breaks this plateau by consistently challenging your muscles with increased demands.</p>

<p class="mb-6 text-gray-700 leading-relaxed">The key is systematic progression. Increase weight by 2.5-5% each week, add an extra rep to each set, or decrease rest time between sets. Your muscles respond to stress, and progressive overload ensures you're always providing the right amount of stress for growth.</p>

<h2 class="text-2xl font-bold text-gray-900 mt-12 mb-6 leading-tight">The Protein Power Strategy</h2>

<p class="mb-6 text-gray-700 leading-relaxed">Timing your protein intake can accelerate muscle growth significantly. Research shows that consuming 20-30 grams of high-quality protein within 30 minutes post-workout maximizes muscle protein synthesis.</p>

<figure class="my-8">
  <img src="{IMAGE_URL}" alt="Professional workout showing proper form and technique" class="w-full rounded-lg shadow-lg">
  <figcaption class="text-center text-gray-600 text-sm mt-3 italic">Proper form is essential for maximizing results and preventing injury.</figcaption>
</figure>

<blockquote class="border-l-4 border-red-600 pl-6 my-8 bg-gray-50 py-6 rounded-r-lg">
  <p class="text-lg italic text-gray-700 mb-3 leading-relaxed">"The biggest mistake I see is people neglecting the recovery phase. Your muscles don't grow during the workout—they grow during recovery."</p>
  <footer class="text-gray-600 font-medium">— <strong>Dr. Michael Chen</strong>, Certified Strength and Conditioning Specialist</footer>
</blockquote>

<h2 class="text-2xl font-bold text-gray-900 mt-12 mb-6 leading-tight">Recovery: The Missing Piece</h2>

<p class="mb-6 text-gray-700 leading-relaxed">Sleep is when your body releases the majority of growth hormone. Aim for 7-9 hours of quality sleep per night. Poor sleep can reduce muscle protein synthesis by up to 18%.</p>

<div class="bg-gray-100 p-6 rounded-lg my-8">
  <h3 class="text-lg font-bold text-gray-900 mb-4">Muscle Building Action Steps:</h3>
  <ol class="space-y-3 text-gray-700">
    <li class="flex items-start"><span class="font-bold text-red-600 mr-3 text-lg">1.</span><span class="leading-relaxed">Track your lifts and increase weight by 2.5% each week</span></li>
    <li class="flex items-start"><span class="font-bold text-red-600 mr-3 text-lg">2.</span><span class="leading-relaxed">Consume 1g protein per pound of body weight daily</span></li>
    <li class="flex items-start"><span class="font-bold text-red-600 mr-3 text-lg">3.</span><span class="leading-relaxed">Prioritize compound movements like squats and deadlifts</span></li>
    <li class="flex items-start"><span class="font-bold text-red-600 mr-3 text-lg">4.</span><span class="leading-relaxed">Get 7-9 hours of quality sleep every night</span></li>
    <li class="flex items-start"><span class="font-bold text-red-600 mr-3 text-lg">5.</span><span class="leading-relaxed">Allow 48-72 hours rest between training the same muscle groups</span></li>
  </ol>
</div>
        `,
        published: true,
        featured: true,
        trending: true,
        tags: ['workout', 'muscle-building', 'strength-training']
      },
      {
        title: '10 Foods That Naturally Boost Testosterone',
        slug: '10-foods-naturally-boost-testosterone',
        excerpt: 'Discover the power foods that can help optimize your testosterone levels naturally and safely.',
        content: `
<p class="lead text-xl text-gray-700 mb-8 leading-relaxed font-medium">YOUR TESTOSTERONE LEVELS DETERMINE MORE THAN YOU THINK. From energy and muscle growth to confidence and drive, this hormone affects every aspect of male health.</p>

<div class="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8 rounded-r-lg">
  <h3 class="text-lg font-bold text-blue-900 mb-4">Quick Takeaways</h3>
  <ul class="space-y-3 text-blue-800">
    <li class="flex items-start"><span class="text-blue-600 font-bold mr-3">•</span><span class="leading-relaxed">Natural foods can boost testosterone by 15-30%</span></li>
    <li class="flex items-start"><span class="text-blue-600 font-bold mr-3">•</span><span class="leading-relaxed">Zinc and vitamin D are crucial for testosterone production</span></li>
    <li class="flex items-start"><span class="text-blue-600 font-bold mr-3">•</span><span class="leading-relaxed">Consistency matters more than individual superfoods</span></li>
  </ul>
</div>

<h2 class="text-2xl font-bold text-gray-900 mt-12 mb-6 leading-tight">The Science of Testosterone Nutrition</h2>

<p class="mb-6 text-gray-700 leading-relaxed">Your diet directly impacts hormone production. Research shows that men who follow specific nutritional protocols can increase testosterone levels by 15-30% within 12 weeks. The key is targeting the nutrients your body needs most for hormone synthesis.</p>

<h2 class="text-2xl font-bold text-gray-900 mt-12 mb-6 leading-tight">Top 10 Testosterone-Boosting Foods</h2>

<div class="bg-green-50 p-6 rounded-lg my-8">
  <h3 class="text-lg font-bold text-green-900 mb-4">Essential Testosterone Foods:</h3>
  <ul class="space-y-3 text-green-800">
    <li class="flex items-start"><span class="text-green-600 font-bold mr-3">•</span><span class="leading-relaxed">Grass-fed beef - Rich in zinc and saturated fats</span></li>
    <li class="flex items-start"><span class="text-green-600 font-bold mr-3">•</span><span class="leading-relaxed">Oysters - Highest zinc content of any food</span></li>
    <li class="flex items-start"><span class="text-green-600 font-bold mr-3">•</span><span class="leading-relaxed">Eggs - Complete protein plus vitamin D</span></li>
    <li class="flex items-start"><span class="text-green-600 font-bold mr-3">•</span><span class="leading-relaxed">Avocados - Healthy monounsaturated fats</span></li>
    <li class="flex items-start"><span class="text-green-600 font-bold mr-3">•</span><span class="leading-relaxed">Brazil nuts - Selenium for hormone regulation</span></li>
  </ul>
</div>

<figure class="my-8">
  <img src="{IMAGE_URL}" alt="Testosterone boosting foods arranged on a table" class="w-full rounded-lg shadow-lg">
  <figcaption class="text-center text-gray-600 text-sm mt-3 italic">Natural foods provide the building blocks for optimal hormone production.</figcaption>
</figure>
        `,
        published: true,
        featured: false,
        trending: true,
        tags: ['nutrition', 'testosterone', 'health-tips']
      },
      {
        title: '7-Day Fat Loss Workout Plan for Busy Men',
        slug: '7-day-fat-loss-workout-plan-busy-men',
        excerpt: 'A time-efficient workout plan designed for men who want maximum fat loss results with minimal time investment.',
        content: `
<p class="lead text-xl text-gray-700 mb-8 leading-relaxed font-medium">TIME IS YOUR BIGGEST CHALLENGE. But losing fat doesn't require hours in the gym when you have the right strategy.</p>

<h2 class="text-2xl font-bold text-gray-900 mt-12 mb-6 leading-tight">Why This Plan Works for Busy Schedules</h2>

<p class="mb-6 text-gray-700 leading-relaxed">This plan maximizes calorie burn in minimal time through high-intensity compound movements. Each workout takes 25-30 minutes but delivers the fat-burning impact of much longer sessions.</p>

<div class="bg-red-600 text-white p-6 rounded-lg my-8">
  <h3 class="text-lg font-bold mb-3">Game Changer</h3>
  <p class="leading-relaxed">This single adjustment has helped thousands of men transform their results in just weeks.</p>
</div>

<h2 class="text-2xl font-bold text-gray-900 mt-12 mb-6 leading-tight">The 7-Day Schedule</h2>

<p class="mb-6 text-gray-700 leading-relaxed">Monday: Full-body strength circuit, Tuesday: HIIT cardio, Wednesday: Upper body focus, Thursday: Active recovery, Friday: Lower body blast, Saturday: Metabolic conditioning, Sunday: Complete rest.</p>
        `,
        published: true,
        featured: false,
        trending: false,
        tags: ['workout', 'weight-loss', 'fitness-goals']
      }
    ]

    for (const articleData of articles) {
      const { tags: tagNames, ...articleFields } = articleData
      
      const article = await prisma.article.upsert({
        where: { slug: articleFields.slug },
        update: {},
        create: {
          ...articleFields,
          categoryId: fitnessCategory!.id,
          authorId: author.id,
          publishedAt: new Date()
        }
      })

      // Connect tags
      for (const tagName of tagNames) {
        const tag = await prisma.tag.findUnique({ where: { slug: tagName } })
        if (tag) {
          await prisma.articleTag.upsert({
            where: {
              articleId_tagId: {
                articleId: article.id,
                tagId: tag.id
              }
            },
            update: {},
            create: {
              articleId: article.id,
              tagId: tag.id
            }
          })
        }
      }
    }
    console.log('✅ Created demo articles')

    // Create demo ads
    const ads = [
      {
        name: 'Protein Powder Banner',
        image: 'https://images.unsplash.com/photo-1544991875-5dc1b05f607d?w=728&h=90&fit=crop',
        targetUrl: 'https://affiliate.example.com/protein-powder?ref=menshub',
        sizes: ['728x90', '970x250'],
        placement: 'HEADER',
        weight: 100
      },
      {
        name: 'Workout Equipment Sidebar',
        image: 'https://images.unsplash.com/photo-1571019613540-996a5c9b6c6e?w=300&h=250&fit=crop',
        targetUrl: 'https://amazon.com/workout-gear?tag=menshub-20',
        sizes: ['300x250'],
        placement: 'SIDEBAR',
        weight: 90
      },
      {
        name: 'Testosterone Booster Inline',
        image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=728&h=90&fit=crop',
        targetUrl: 'https://affiliate.example.com/test-boost?ref=menshub',
        sizes: ['728x90'],
        placement: 'INLINE',
        weight: 85
      },
      {
        name: 'Meal Prep Footer',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=970&h=250&fit=crop',
        targetUrl: 'https://amazon.com/meal-prep?tag=menshub-20',
        sizes: ['970x250', '728x90'],
        placement: 'FOOTER',
        weight: 80
      }
    ]

    for (const ad of ads) {
      await prisma.ad.upsert({
        where: { name: ad.name },
        update: {},
        create: ad
      })
    }
    console.log('✅ Created demo ads')

    // Create keyword links
    const keywords = [
      {
        keyword: 'protein powder',
        affiliateUrl: 'https://affiliate.example.com/protein-powder?ref=menshub',
        maxHitsPerPage: 3
      },
      {
        keyword: 'workout equipment',
        affiliateUrl: 'https://amazon.com/workout-gear?tag=menshub-20',
        maxHitsPerPage: 2
      },
      {
        keyword: 'testosterone booster',
        affiliateUrl: 'https://affiliate.example.com/test-boost?ref=menshub',
        maxHitsPerPage: 1
      },
      {
        keyword: 'meal prep containers',
        affiliateUrl: 'https://amazon.com/meal-prep?tag=menshub-20',
        maxHitsPerPage: 2
      },
      {
        keyword: 'pre workout',
        affiliateUrl: 'https://affiliate.example.com/pre-workout?ref=menshub',
        maxHitsPerPage: 2
      },
      {
        keyword: 'whey protein',
        affiliateUrl: 'https://affiliate.example.com/whey-protein?ref=menshub',
        maxHitsPerPage: 3
      }
    ]

    for (const keyword of keywords) {
      await prisma.keywordLink.upsert({
        where: { keyword: keyword.keyword },
        update: {},
        create: keyword
      })
    }
    console.log('✅ Created keyword links')

    console.log('🎉 Database seeding completed successfully!')
    console.log('')
    console.log('Demo content created:')
    console.log('- Admin user: admin@menshealth.com')
    console.log('- 6 categories: Fitness, Nutrition, Health, etc.')
    console.log('- 15 tags for article organization')
    console.log('- 3 demo articles with Men\'s Health styling')
    console.log('- 4 demo ads for different placements')
    console.log('- 6 affiliate keyword links')
    console.log('')
    console.log('You can now:')
    console.log('1. Visit /admin to manage content')
    console.log('2. View articles at /')
    console.log('3. Test keyword linking in articles')
    console.log('4. Check ad placements throughout the site')

  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  }) 