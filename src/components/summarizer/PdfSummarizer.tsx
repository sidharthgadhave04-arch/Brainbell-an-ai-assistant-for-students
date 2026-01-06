"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Loader2, Download, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PdfSummarizer() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string>("");
  const [fileInfo, setFileInfo] = useState<any>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast({
          title: "Invalid File",
          description: "Please select a PDF file",
          variant: "destructive"
        });
        return;
      }
      setFile(selectedFile);
      setSummary("");
      setFileInfo(null);
    }
  };

  const handleSummarize = async () => {
    if (!file) {
      toast({
        title: "No File",
        description: "Please select a PDF file first",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setSummary("");

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/summarize-pdf-groq', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to summarize PDF');
      }

      setSummary(data.summary);
      setFileInfo({
        fileName: data.fileName,
        fileSize: (data.fileSize / 1024).toFixed(2) + ' KB',
        textLength: data.textLength,
        wasTruncated: data.wasTruncated,
        pagesProcessed: data.pagesProcessed
      });

      toast({
        title: "Success",
        description: "PDF summarized successfully!"
      });

    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to summarize PDF",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!summary) return;

    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name.replace('.pdf', '')}_summary.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Alert className="border-2 border-blue-500/20 bg-blue-500/10">
        <Info className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-sm text-[color:var(--card-foreground)]">
          <strong>Note:</strong> PDFs with images or complex formatting may take longer to process (30-60 seconds). 
          Please be patient while the AI analyzes your document.
        </AlertDescription>
      </Alert>

      <Card className="border-2 border-[color:var(--border)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload PDF
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <label
                htmlFor="pdf-upload"
                className="flex-1 cursor-pointer"
              >
                <div className="border-2 border-dashed border-[color:var(--border)] rounded-lg p-8 text-center hover:bg-[color:var(--muted)] transition-colors">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-[color:var(--muted-foreground)]" />
                  <p className="text-sm text-[color:var(--muted-foreground)]">
                    {file ? file.name : "Click to select a PDF file"}
                  </p>
                  <p className="text-xs text-[color:var(--muted-foreground)] mt-1">
                    Maximum file size: 10MB
                  </p>
                </div>
                <input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <Button
              onClick={handleSummarize}
              disabled={!file || loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Summarizing... This may take up to a minute
                </>
              ) : (
                "Summarize PDF"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {summary && (
        <Card className="border-2 border-[color:var(--border)]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Summary
              </CardTitle>
              <Button
                onClick={handleDownload}
                variant="outline"
                size="sm"
                className="border-2 border-[color:var(--border)]"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
            {fileInfo && (
              <div className="text-sm text-[color:var(--muted-foreground)] mt-2">
                <p>File: {fileInfo.fileName} ({fileInfo.fileSize})</p>
                {fileInfo.pagesProcessed && (
                  <p>Pages processed: {fileInfo.pagesProcessed}</p>
                )}
                {fileInfo.wasTruncated && (
                  <p className="text-yellow-600">
                    ⚠️ Text was truncated due to length. Summary is based on the first part of the document.
                  </p>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-[color:var(--card-foreground)] bg-[color:var(--card)] p-4 rounded-lg border-2 border-[color:var(--border)]">
                {summary}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}