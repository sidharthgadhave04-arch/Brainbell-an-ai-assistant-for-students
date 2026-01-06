import PdfSummarizer from "@/components/summarizer/PdfSummarizer";

export default function SummarizerPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          PDF Summarizer
        </h1>
        <p className="text-gray-600">
          Upload a PDF document and get an AI-powered summary
        </p>
      </div>

      <PdfSummarizer />
    </div>
  );
}