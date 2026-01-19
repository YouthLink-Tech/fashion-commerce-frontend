"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import * as fbq from "@/app/lib/fpixel";

export default function FacebookPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    fbq.pageview();
  }, [pathname, searchParams]);

  return null;
}
