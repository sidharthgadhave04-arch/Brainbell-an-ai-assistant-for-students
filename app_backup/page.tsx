import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EFE9D5]">
      <div className="text-center px-4">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-[#27445D]">
          Welcome to Brainbell
        </h1>
        <p className="text-lg sm:text-xl mb-8 text-[#2D4D69]">
          Your all-in-one college companion for studying and productivity
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/login">
            <Button size="lg" className="bg-[#27445D] hover:bg-[#2D4D69] text-white">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-[#27445D] text-[#27445D] hover:bg-[#27445D] hover:text-white"
            >
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}