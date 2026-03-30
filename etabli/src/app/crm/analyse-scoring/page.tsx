"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AnalyseScoringRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/crm/analyse-admissibilite");
  }, [router]);
  return (
    <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
      Redirection en cours...
    </div>
  );
}
