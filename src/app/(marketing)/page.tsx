'use client'

import { BookOpen, Brain, Clock, Zap, Target, TrendingUp } from 'lucide-react'
import { HeroSection } from '@/components/sections/HeroSection'
import { FeaturesGrid } from '@/components/sections/FeatureGrid'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { FaqSection } from "@/components/sections/FaqSection"
import Image from 'next/image'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'

export default function Page() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push('/home')
    }
  }, [session, router])

  const features = [
    {
      icon: <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-[#7fb236]" />,
      title: "Personalized Study Plans", 
      description: "Get tailored study plans based on your goals and learning style."
    },
    {
      icon: <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-[#7fb236]" />,
      title: "AI-Curated Resources",
      description: "Access the best learning materials curated by our AI."
    },
    {
      icon: <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-[#7fb236]" />,
      title: "Time Management",
      description: "Manage your time effectively and stay on top of your studies."
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8 sm:py-16 bg-[#EFE9D5]">
      <HeroSection
        title="Welcome to"
        highlightedText="Brainbell"
        description="Your AI-powered study assistant for accelerated learning"
        ctaText={session ? "Go to Dashboard" : "Get Started"}
        ctaLink={session ? "/home" : "/register"}
      />
      
      <FeaturesGrid features={features} />

      <section className="py-12 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
            <Image 
              src="/building.jpg" 
              alt="Campus Building"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-20 bg-gradient-to-b from-[#EFE9D5] to-[#f5f1e8] rounded-2xl">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl sm:text-4xl font-bold text-center mb-4">
            Why Students Love Brainbell
          </h2>
          <p className="text-center text-gray-700 mb-12 max-w-2xl mx-auto">
            Transform your learning journey with our intelligent study companion designed to maximize your academic potential
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Card 1 */}
            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow border-2 border-[#c1ff72]">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-[#c1ff72] rounded-lg flex items-center justify-center">
                  <Zap className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-bold">Lightning Fast Results</h3>
              </div>
              <p className="text-gray-700">
                Generate comprehensive study plans in seconds. Our AI analyzes your goals and creates an optimized learning path tailored just for you.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow border-2 border-[#7fb236]">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-[#7fb236] rounded-lg flex items-center justify-center">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold">Stay on Target</h3>
              </div>
              <p className="text-gray-700">
                Track your progress with visual analytics and adjust your study schedule in real-time. Never miss a deadline again.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow border-2 border-[#c1ff72]">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-[#c1ff72] rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-bold">Boost Performance</h3>
              </div>
              <p className="text-gray-700">
                Curated learning resources matched to your skill level and learning style. Every resource is hand-picked by our AI for quality.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow border-2 border-[#7fb236]">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-[#7fb236] rounded-lg flex items-center justify-center">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold">Smart Learning</h3>
              </div>
              <p className="text-gray-700">
                Interactive PDF chat feature lets you ask questions about your course materials and get instant, contextual answers.
              </p>
            </div>
          </div>

          {/* Stats Section - NOW WITH ANIMATIONS! */}
          <div className="bg-black rounded-xl p-8 text-white">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <AnimatedCounter 
                  end={50} 
                  suffix="K+" 
                  duration={2500}
                  className="text-3xl sm:text-4xl font-bold text-[#c1ff72] mb-2"
                />
                <p className="text-gray-300">Students Empowered</p>
              </div>
              <div>
                <AnimatedCounter 
                  end={1} 
                  suffix="M+" 
                  duration={2500}
                  className="text-3xl sm:text-4xl font-bold text-[#c1ff72] mb-2"
                />
                <p className="text-gray-300">Study Plans Generated</p>
              </div>
              <div>
                <AnimatedCounter 
                  end={98} 
                  suffix="%" 
                  duration={2500}
                  className="text-3xl sm:text-4xl font-bold text-[#c1ff72] mb-2"
                />
                <p className="text-gray-300">User Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      <FaqSection />
    </div>
  )
}