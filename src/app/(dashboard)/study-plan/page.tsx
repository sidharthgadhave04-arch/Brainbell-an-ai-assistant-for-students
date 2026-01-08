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

const ITEMS_PER_PAGE = 5;

export default function StudyPlanPage() {
  const { data: session } = useSession();
  const [storedPlans, setStoredPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPlans = useCallback(async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('🔄 Fetching study plans for user:', session.user.id);
      
      const data = await apiClient.getStudyPlan(session.user.id);
      
      if (data.error) {
        console.error("API returned error:", data.error);
        toast({
          variant: "error",
          title: "Error",
          description: "Failed to fetch study plans. Please try again."
        });
        setStoredPlans([]);
        return;
      }
      
      if (data.plans && Array.isArray(data.plans)) {
        // Sort plans by _id as a fallback for creation time
        const sortedPlans = data.plans.sort((a: StudyPlan, b: StudyPlan) => 
          b._id.localeCompare(a._id)
        );
        console.log('✅ Successfully fetched plans:', sortedPlans.length);
        setStoredPlans(sortedPlans);
      } else {
        console.error("Invalid plans data structure:", data);
        setStoredPlans([]);
      }
    } catch (error) {
      console.error("Error fetching stored plans:", error);
      toast({
        variant: "error",
        title: "Error",
        description: "Failed to fetch study plans. Please try again."
      });
      setStoredPlans([]);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, toast]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handlePlanDelete = async (planId: string) => {
    if (!planId) {
      console.error('❌ No plan ID provided');
      return;
    }

    // Prevent multiple delete requests
    if (isDeleting === planId) {
      console.log('⏳ Delete already in progress for plan:', planId);
      return;
    }

    console.log('🗑️ Starting delete for plan:', planId);
    setIsDeleting(planId);

    try {
      // Call the API to delete the study plan
      const response = await fetch(`/api/study-plan/${planId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Delete response status:', response.status);

      // Parse the response
      let data;
      try {
        data = await response.json();
        console.log('📦 Delete response data:', data);
      } catch (parseError) {
        console.error('❌ Failed to parse response:', parseError);
        throw new Error('Invalid response from server');
      }

      // Check if the request was successful
      if (!response.ok) {
        console.error('❌ Delete request failed:', data);
        throw new Error(data.error || data.message || 'Failed to delete plan');
      }

      // Verify the deletion was successful
      if (data.success) {
        console.log('✅ Plan deleted successfully, updating UI');
        
        // Optimistically update the UI by removing the plan from state
        setStoredPlans(prevPlans => {
          const updatedPlans = prevPlans.filter(plan => plan._id !== planId);
          console.log('📊 Plans after deletion:', updatedPlans.length);
          return updatedPlans;
        });
        
        // Adjust current page if necessary
        const newTotalPages = Math.ceil((storedPlans.length - 1) / ITEMS_PER_PAGE);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
        
        toast({
          variant: "default",
          title: "Success",
          description: data.message || "Study plan deleted successfully."
        });
      } else {
        throw new Error(data.error || data.message || 'Failed to delete plan');
      }
    } catch (error: unknown) {
      console.error("❌ Error in handlePlanDelete:", error);
      
      // Type-safe error message extraction
      let errorMessage = "Failed to delete study plan. Please try again.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String(error.message);
      }
      
      toast({
        variant: "error",
        title: "Error",
        description: errorMessage
      });
      
      // Optionally refresh the plans list to ensure UI is in sync
      console.log('🔄 Refreshing plans after error');
      await fetchPlans();
    } finally {
      setIsDeleting(null);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(storedPlans.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPlans = storedPlans.slice(startIndex, endIndex);

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-0">Study Plan Generator</h1>
        <div className="flex items-center gap-4">
          <span className="text-xs sm:text-sm text-gray-600">Create and manage your study plans</span>
        </div>
      </div>
      
      <div className="w-full max-w-full sm:max-w-10xl">
        <StudyPlanForm onPlanCreated={fetchPlans} />
      </div>

      {/* Stored Plans Section */}
      <div id="stored-plans" className="mt-8 sm:mt-12">
        <Separator className="my-6 sm:my-8" />
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Your Study Plans</h2>
        
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