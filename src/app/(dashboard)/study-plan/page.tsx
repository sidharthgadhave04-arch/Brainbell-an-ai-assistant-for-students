"use client"

import { useState, useEffect, useCallback } from "react";
import StudyPlanForm from '@/components/StudyPlanForm';
import { StoredPlan } from "@/components/study-plan/StoredPlan";
import { Separator } from "@/components/ui/separator";
import type { StudyPlan } from "@/components/study-plan/StoredPlan";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { PaginationNav } from "@/components/ui/pagination-nav";
import { Sparkles, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ITEMS_PER_PAGE = 5;

interface RankedPlan {
  rank: number;
  subject: string;
  reason: string;
  urgency: "high" | "medium" | "low";
  bestTime: "Morning" | "Afternoon" | "Evening";
  stressLevel: "High" | "Medium" | "Low";
}

export default function StudyPlanPage() {
  const { data: session } = useSession();
  const [storedPlans, setStoredPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSorting, setIsSorting] = useState(false);
  const [rankedPlans, setRankedPlans] = useState<RankedPlan[] | null>(null);
  const { toast } = useToast();

  const fetchPlans = useCallback(async () => {
    if (!session?.user?.id) { setLoading(false); return; }
    try {
      setLoading(true);
      const data = await apiClient.getStudyPlan(session.user.id);
      if (data.error) { setStoredPlans([]); return; }
      if (data.plans && Array.isArray(data.plans)) {
        const sortedPlans = data.plans.sort((a: StudyPlan, b: StudyPlan) => b._id.localeCompare(a._id));
        setStoredPlans(sortedPlans);
      } else { setStoredPlans([]); }
    } catch { setStoredPlans([]); }
    finally { setLoading(false); }
  }, [session?.user?.id, toast]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const handleAISort = async () => {
    if (storedPlans.length === 0) {
      toast({ title: "No plans", description: "Create some study plans first!" });
      return;
    }
    setIsSorting(true);
    setRankedPlans(null);
    try {
      const response = await fetch('/api/ai-sort', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plans: storedPlans }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Sorting failed');
      setRankedPlans(data.ranked);
    } catch (err) {
      toast({
        variant: "error",
        title: "Sort Failed",
        description: err instanceof Error ? err.message : "Could not sort plans",
      });
    } finally {
      setIsSorting(false);
    }
  };

  const handlePlanDelete = async (planId: string) => {
    if (!planId || isDeleting === planId) return;
    setIsDeleting(planId);
    try {
      const response = await fetch(`/api/study-plan/${planId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete plan');
      if (data.success) {
        setStoredPlans(prev => prev.filter(p => p._id !== planId));
        setRankedPlans(null);
        const newTotalPages = Math.ceil((storedPlans.length - 1) / ITEMS_PER_PAGE);
        if (currentPage > newTotalPages && newTotalPages > 0) setCurrentPage(newTotalPages);
        toast({ title: "Deleted", description: "Study plan removed." });
      }
    } catch (error) {
      toast({ variant: "error", title: "Error", description: error instanceof Error ? error.message : "Failed to delete" });
      await fetchPlans();
    } finally { setIsDeleting(null); }
  };

  const urgencyColor = (urgency: string) => {
    if (urgency === "high") return "bg-red-100 border-red-300 text-red-800";
    if (urgency === "medium") return "bg-yellow-100 border-yellow-300 text-yellow-800";
    return "bg-green-100 border-green-300 text-green-800";
  };

  const totalPages = Math.ceil(storedPlans.length / ITEMS_PER_PAGE);
  const currentPlans = storedPlans.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-0">Study Plan Generator</h1>
        <span className="text-xs sm:text-sm text-gray-600">Create and manage your study plans</span>
      </div>

      {/* Form */}
      <div className="w-full max-w-full sm:max-w-10xl">
        <StudyPlanForm onPlanCreated={fetchPlans} />
      </div>

      {/* Stored Plans Section */}
      <div id="stored-plans" className="mt-8 sm:mt-12">
        <Separator className="my-6 sm:my-8" />

        {/* Section header with AI Sort button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <h2 className="text-xl sm:text-2xl font-bold">Your Study Plans</h2>
          {storedPlans.length > 1 && (
            <Button
              onClick={handleAISort}
              disabled={isSorting}
              className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-5 py-2 rounded-xl shadow"
            >
              {isSorting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" />AI Priority Sort</>
              )}
            </Button>
          )}
        </div>

        {/* AI Ranked Result Panel */}
        {rankedPlans && (
          <div className="mb-6 p-4 sm:p-6 rounded-2xl border-2 border-teal-200 bg-teal-50 relative">
            <button
              onClick={() => setRankedPlans(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-teal-600" />
              <h3 className="text-lg font-bold text-teal-800">AI Recommended Study Order</h3>
            </div>
            <div className="space-y-3">
              {rankedPlans.map((item) => (
                <div
                  key={item.rank}
                  className={`flex items-start gap-3 p-3 rounded-xl border ${urgencyColor(item.urgency)}`}
                >
                  <div className="text-2xl font-black min-w-[2rem] text-center">
                    #{item.rank}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-base">{item.subject}</span>
                      <Badge className={`text-xs capitalize ${
                        item.urgency === "high" ? "bg-red-500" :
                        item.urgency === "medium" ? "bg-yellow-500" : "bg-green-500"
                      } text-white`}>
                        {item.urgency} priority
                      </Badge>
                      <Badge className={`text-xs ${
                        item.stressLevel === "High" ? "bg-orange-500" :
                        item.stressLevel === "Medium" ? "bg-blue-400" : "bg-gray-400"
                      } text-white`}>
                        {item.stressLevel} stress
                      </Badge>
                      <Badge className="text-xs bg-indigo-400 text-white">
                        ⏰ {item.bestTime}
                      </Badge>
                    </div>
                    <p className="text-sm mt-1 opacity-80">{item.reason}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-teal-600 mt-3 opacity-70">
              ✨ Based on exam dates, stress score, subject difficulty & best study time
            </p>
          </div>
        )}

        {/* Plans List */}
        {loading ? (
          <div className="space-y-4 sm:space-y-6">
            <Skeleton className="h-[150px] sm:h-[200px] w-full" />
            <Skeleton className="h-[150px] sm:h-[200px] w-full" />
          </div>
        ) : storedPlans.length > 0 ? (
          <>
            <div className="space-y-4 sm:space-y-6">
              {currentPlans.map((plan) => (
                <StoredPlan
                  key={plan._id}
                  plan={plan}
                  onDelete={handlePlanDelete}
                  isDeleting={isDeleting === plan._id}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <PaginationNav
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>You haven&apos;t created any study plans yet.</p>
            <p className="mt-2">Use the form above to create your first study plan!</p>
          </div>
        )}
      </div>
    </div>
  );
}