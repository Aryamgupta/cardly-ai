"use client";

import { useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { CustomToast } from "./ui/CustomToast";

function ToastListenerInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const hasFired = useRef(false);

  useEffect(() => {
    const toastParam = searchParams.get("toast");
    
    if (toastParam && !hasFired.current) {
      hasFired.current = true;
      
      if (toastParam === "contact-saved") {
        const name = searchParams.get("name") || "Contact";
        toast.custom((t) => (
          <CustomToast 
            id={t} 
            variant="success"
            title="Contact Saved" 
            description={`${name} has been added to your contacts.`} 
          />
        ), { duration: 4000 });
      }

      if (toastParam === "edit-success") {
        toast.custom((t) => (
          <CustomToast 
            id={t} 
            variant="success"
            title="Details Updated" 
            description="The contact information has been successfully updated." 
          />
        ), { duration: 4000 });
      }

      // Clean the URL without triggering a reload
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete("toast");
      newSearchParams.delete("name");
      
      const newUrl = pathname + (newSearchParams.toString() ? `?${newSearchParams.toString()}` : "");
      router.replace(newUrl, { scroll: false });
    }
  }, [searchParams, pathname, router]);

  return null;
}

export function ToastListener() {
  return (
    <Suspense fallback={null}>
      <ToastListenerInner />
    </Suspense>
  );
}
