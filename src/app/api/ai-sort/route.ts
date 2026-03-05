import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { plans } = await req.json();

  if (!plans || plans.length === 0)
    return NextResponse.json({ error: "No plans provided" }, { status: 400 });

  const planSummaries = plans.map((p: any) => {
    const totalTasks = p.weeklyPlans?.reduce((acc: number, w: any) => acc + (w.dailyTasks?.length || 0), 0) || 0;
    const totalWeeks = p.weeklyPlans?.length || 1;
    const stressScore = +(totalTasks / totalWeeks).toFixed(2);

    return {
      subject: p.overview?.subject,
      examDate: p.overview?.examDate,
      duration: p.overview?.duration,
      totalTasks,
      totalWeeks,
      stressScore,
    };
  });

  const prompt = `You are an expert student advisor and cognitive performance coach.

A student has ${plans.length} subjects to study. Rank them in the optimal order to maximize performance.

Use ALL of the following criteria:

1. **Deadline proximity** — Sooner exam = higher priority
2. **Stress score** — (total tasks divided by weeks available). Higher score = more intense workload = needs earlier start
3. **Subject difficulty** — Infer difficulty from subject name. STEM subjects (Maths, Physics, Chemistry, Engineering, CS) are harder than humanities (English, History, Arts). Harder = higher priority
4. **Time of day suitability** — Harder/technical subjects should be studied in the morning when focus is highest. Easier subjects are fine for afternoon/evening. Add a recommended study time for each.
5. **Logical dependency** — If one subject builds on another (e.g. Physics needs Maths), foundational subject comes first

For each subject return:
- rank (1 = highest priority)
- subject name
- reason (2 short sentences max explaining the rank)
- urgency: "high", "medium", or "low"
- bestTime: "Morning", "Afternoon", or "Evening"
- stressLevel: "High", "Medium", or "Low" based on stress score

Return ONLY a valid JSON array, no markdown, no explanation:
[
  {
    "rank": 1,
    "subject": "Maths",
    "reason": "Exam in 3 days and high stress score of 4.5 tasks/week. Technical subject best tackled with full morning focus.",
    "urgency": "high",
    "bestTime": "Morning",
    "stressLevel": "High"
  }
]

Student's subjects:
${JSON.stringify(planSummaries, null, 2)}`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const raw = completion.choices[0].message.content || "[]";
    const clean = raw.replace(/```json|```/g, "").trim();
    const ranked = JSON.parse(clean);
    return NextResponse.json({ ranked });
  } catch (err) {
    console.error("AI sort error:", err);
    return NextResponse.json({ error: "AI sorting failed" }, { status: 500 });
  }
}