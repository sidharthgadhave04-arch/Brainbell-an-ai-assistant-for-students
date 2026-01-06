import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "How can I stay updated with campus events?",
    answer: "Event Zone keeps you connected to your campus community! Discover upcoming workshops, seminars, competitions, and social gatherings all in one place. Register for events instantly, track your attendance, and never miss out on opportunities to learn and network. Event organizers can also create and manage events with admin approval."
  },
  {
    question: "I struggle with organizing my study time. Can Brainbell help?",
    answer: "Absolutely! Our intelligent Study Planner creates personalized schedules tailored to your goals and available time. It breaks down your subjects into manageable daily tasks, tracks your completion, and adapts to your learning pace. Say goodbye to overwhelm and hello to organized, efficient studying!"
  },
  {
    question: "How can I improve my focus during study sessions?",
    answer: "Try our Study Timer! This Pomodoro-style focus tool helps you maintain peak concentration with customizable study sessions and automatic break reminders. Build consistent study habits, prevent burnout, and watch your total study time grow as you develop better focus discipline."
  },
  {
    question: "What if I need help understanding a topic at 2 AM?",
    answer: "Meet Scriba, your 24/7 AI study companion! Whether it's late-night homework help, concept clarification, study tips, or exam preparation, Scriba is always ready to assist. Think of it as having a personal tutor in your pocket, available whenever inspiration (or confusion) strikes."
  },
  {
    question: "Can I see how much I'm actually studying?",
    answer: "Yes! Our comprehensive analytics dashboard shows your total study time, daily and weekly stats, study streaks, and subject-wise breakdowns. Visualize your progress through intuitive charts, celebrate your consistency, and identify where to focus your energy for maximum results."
  },
  {
    question: "Where can I find quality learning materials?",
    answer: "Our curated resource library has you covered! Access high-quality educational videos, articles, tutorials, and interactive materials organized by subject and difficulty level. Save your favorites for quick access and discover new resources recommended just for you."
  }
]

export function FaqSection() {
  return (
    <section className="py-12 sm:py-20 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Frequently Asked Questions</h2>
        <p className="text-muted-foreground">Find answers to common questions about Brainbell</p>
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left text-lg font-medium">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}