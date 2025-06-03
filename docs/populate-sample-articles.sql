-- Add sample articles to populate the Men's Hub site
-- Run this in Supabase SQL Editor AFTER creating the articles table

INSERT INTO articles (title, slug, content, excerpt, category, status, featured_image, tags, author, published_at) 
VALUES 
    (
        'The 30-Day Workout Plan to Build Total-Body Strength',
        'workout-plan-total-body-strength',
        '<h1>The 30-Day Workout Plan to Build Total-Body Strength</h1>
        <p>This four-week program will help you build muscle and increase your overall strength with minimal equipment.</p>
        <h2>Week 1-2: Foundation Building</h2>
        <p>Focus on basic movements and proper form. Start with bodyweight exercises and light weights.</p>
        <ul>
        <li>Push-ups: 3 sets of 8-12 reps</li>
        <li>Squats: 3 sets of 10-15 reps</li>
        <li>Plank: 3 sets of 30-60 seconds</li>
        </ul>
        <h2>Week 3-4: Progressive Overload</h2>
        <p>Increase intensity and add more challenging variations.</p>
        <p>Remember to maintain proper form throughout all exercises and rest adequately between workouts.</p>',
        'This four-week program will help you build muscle and increase your overall strength with minimal equipment.',
        'fitness',
        'published',
        'https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        ARRAY['fitness', 'workout', 'strength training'],
        'Mike Johnson',
        NOW()
    ),
    (
        '10 High-Protein Breakfast Ideas to Start Your Day Right',
        'high-protein-breakfast-ideas',
        '<h1>10 High-Protein Breakfast Ideas to Start Your Day Right</h1>
        <p>Fuel your morning with these protein-packed recipes that will keep you full until lunch.</p>
        <h2>Quick and Easy Options</h2>
        <ol>
        <li><strong>Greek Yogurt Parfait</strong> - Layer Greek yogurt with berries and granola</li>
        <li><strong>Protein Smoothie</strong> - Blend protein powder, banana, and spinach</li>
        <li><strong>Egg Scramble</strong> - Scrambled eggs with vegetables and cheese</li>
        <li><strong>Overnight Oats</strong> - Oats with protein powder and chia seeds</li>
        <li><strong>Avocado Toast</strong> - Whole grain bread with avocado and egg</li>
        </ol>
        <p>Each of these options provides at least 20 grams of protein to start your day strong.</p>',
        'Fuel your morning with these protein-packed recipes that will keep you full until lunch.',
        'nutrition',
        'published',
        'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        ARRAY['nutrition', 'protein', 'breakfast'],
        'Sarah Mitchell',
        NOW()
    ),
    (
        'How to Lower Your Blood Pressure Naturally',
        'lower-blood-pressure-naturally',
        '<h1>How to Lower Your Blood Pressure Naturally</h1>
        <p>These lifestyle changes and dietary habits can help reduce hypertension without medication.</p>
        <h2>Dietary Changes</h2>
        <ul>
        <li>Reduce sodium intake to less than 2,300mg per day</li>
        <li>Increase potassium-rich foods like bananas and spinach</li>
        <li>Follow the DASH diet pattern</li>
        </ul>
        <h2>Lifestyle Modifications</h2>
        <ul>
        <li>Exercise regularly - aim for 150 minutes per week</li>
        <li>Maintain a healthy weight</li>
        <li>Limit alcohol consumption</li>
        <li>Manage stress through meditation or yoga</li>
        </ul>
        <p>Always consult with your healthcare provider before making significant changes to your health routine.</p>',
        'These lifestyle changes and dietary habits can help reduce hypertension without medication.',
        'health',
        'published',
        'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        ARRAY['health', 'blood pressure', 'cardiovascular'],
        'Dr. James Wilson',
        NOW()
    ),
    (
        'The Ultimate Guide to Intermittent Fasting',
        'ultimate-guide-intermittent-fasting',
        '<h1>The Ultimate Guide to Intermittent Fasting</h1>
        <p>Everything you need to know about intermittent fasting methods, benefits, and how to get started.</p>
        <h2>Popular IF Methods</h2>
        <ul>
        <li><strong>16:8 Method</strong> - Fast for 16 hours, eat in 8-hour window</li>
        <li><strong>5:2 Diet</strong> - Eat normally 5 days, restrict calories 2 days</li>
        <li><strong>24-hour Fast</strong> - Fast for full 24 hours once or twice per week</li>
        </ul>
        <h2>Benefits</h2>
        <p>Research shows intermittent fasting may help with weight loss, improved insulin sensitivity, and cellular repair.</p>
        <h2>Getting Started</h2>
        <p>Start slowly with the 16:8 method and gradually increase fasting periods as your body adapts.</p>',
        'Everything you need to know about intermittent fasting methods, benefits, and how to get started.',
        'weight-loss',
        'published',
        'https://images.pexels.com/photos/5589029/pexels-photo-5589029.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        ARRAY['weight loss', 'intermittent fasting', 'diet'],
        'Emily Davidson',
        NOW()
    ),
    (
        'The Best Running Shoes for Every Type of Runner',
        'best-running-shoes',
        '<h1>The Best Running Shoes for Every Type of Runner</h1>
        <p>Find the perfect pair of running shoes based on your gait, terrain preference, and training goals.</p>
        <h2>Road Running Shoes</h2>
        <p>Designed for pavement and smooth surfaces with lightweight construction and responsive cushioning.</p>
        <h2>Trail Running Shoes</h2>
        <p>Built for off-road adventures with aggressive tread patterns and protective features.</p>
        <h2>Cross-Training Shoes</h2>
        <p>Versatile options for gym workouts and multi-directional movements.</p>
        <h2>Finding Your Fit</h2>
        <ul>
        <li>Get your feet measured at a specialty running store</li>
        <li>Consider your running gait and foot strike pattern</li>
        <li>Think about your typical running surfaces</li>
        <li>Factor in your weekly mileage</li>
        </ul>',
        'Find the perfect pair of running shoes based on your gait, terrain preference, and training goals.',
        'style',
        'published',
        'https://images.pexels.com/photos/1472947/pexels-photo-1472947.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        ARRAY['style', 'running', 'footwear'],
        'Tom Rodriguez',
        NOW()
    ),
    (
        'The 15 Best Abs Exercises for a Stronger Core',
        'best-abs-exercises',
        '<h1>The 15 Best Abs Exercises for a Stronger Core</h1>
        <p>Build a stronger, more defined midsection with these effective core strengthening moves.</p>
        <h2>Basic Exercises</h2>
        <ol>
        <li>Plank</li>
        <li>Crunches</li>
        <li>Bicycle Crunches</li>
        <li>Russian Twists</li>
        <li>Mountain Climbers</li>
        </ol>
        <h2>Intermediate Exercises</h2>
        <ol start="6">
        <li>Dead Bug</li>
        <li>Bird Dog</li>
        <li>Side Plank</li>
        <li>Hanging Knee Raises</li>
        <li>Ab Wheel Rollouts</li>
        </ol>
        <h2>Advanced Exercises</h2>
        <ol start="11">
        <li>Dragon Flag</li>
        <li>Human Flag</li>
        <li>L-Sit</li>
        <li>Pistol Squats</li>
        <li>Turkish Get-Ups</li>
        </ol>
        <p>Remember to focus on quality over quantity and maintain proper form throughout all exercises.</p>',
        'Build a stronger, more defined midsection with these effective core strengthening moves.',
        'fitness',
        'published',
        'https://images.pexels.com/photos/4498151/pexels-photo-4498151.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        ARRAY['fitness', 'abs', 'core training'],
        'Chris Torres',
        NOW()
    ),
    (
        'Top 10 Movies and Shows to Stream This Month',
        'top-streaming-entertainment',
        '<h1>Top 10 Movies and Shows to Stream This Month</h1>
        <p>Don''t miss these must-watch new releases and classics coming to streaming platforms.</p>
        <h2>New Releases</h2>
        <ul>
        <li><strong>Action Thriller</strong> - High-octane adventure with stunning cinematography</li>
        <li><strong>Comedy Series</strong> - Hilarious workplace comedy that will keep you laughing</li>
        <li><strong>Documentary</strong> - Eye-opening exploration of modern society</li>
        </ul>
        <h2>Classic Picks</h2>
        <ul>
        <li><strong>Cult Classic Film</strong> - Rediscover this beloved 90s masterpiece</li>
        <li><strong>Drama Series</strong> - Binge-worthy show with complex characters</li>
        </ul>
        <p>Whether you''re looking for action, comedy, or drama, this month''s streaming lineup has something for everyone.</p>',
        'Don''t miss these must-watch new releases and classics coming to streaming platforms.',
        'entertainment',
        'published',
        'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        ARRAY['entertainment', 'streaming', 'movies'],
        'Ryan Cooper',
        NOW()
    ),
    (
        'How Much Protein Do You Really Need to Build Muscle?',
        'protein-needs-muscle-building',
        '<h1>How Much Protein Do You Really Need to Build Muscle?</h1>
        <p>The science-backed answer to one of the most common questions in fitness and nutrition.</p>
        <h2>The Research</h2>
        <p>Current research suggests that active individuals looking to build muscle should consume 1.6-2.2 grams of protein per kilogram of body weight daily.</p>
        <h2>Timing Matters</h2>
        <ul>
        <li>Consume 20-30g of protein within 2 hours post-workout</li>
        <li>Spread protein intake throughout the day</li>
        <li>Include casein protein before bed for overnight recovery</li>
        </ul>
        <h2>Quality Sources</h2>
        <ul>
        <li>Lean meats (chicken, turkey, beef)</li>
        <li>Fish and seafood</li>
        <li>Eggs and dairy products</li>
        <li>Plant-based options (beans, quinoa, tofu)</li>
        </ul>
        <p>Remember that individual needs may vary based on training intensity, age, and overall health status.</p>',
        'The science-backed answer to one of the most common questions in fitness and nutrition.',
        'nutrition',
        'published',
        'https://images.pexels.com/photos/1547248/pexels-photo-1547248.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        ARRAY['nutrition', 'protein', 'muscle building'],
        'Mark Stevens',
        NOW()
    )
ON CONFLICT (slug) DO NOTHING; 