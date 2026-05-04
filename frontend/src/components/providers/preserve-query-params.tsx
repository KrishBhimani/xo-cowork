"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PRESERVED_QUERY_PARAMS } from "@/lib/constants";

const STORAGE_PREFIX = "xo:preserve:";

function PreserveQueryParamsInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const next = new URLSearchParams(searchParams.toString());
    let changed = false;

    for (const key of PRESERVED_QUERY_PARAMS) {
      const urlValue = searchParams.get(key);
      const storageKey = STORAGE_PREFIX + key;

      if (urlValue) {
        sessionStorage.setItem(storageKey, urlValue);
        continue;
      }

      const stashed = sessionStorage.getItem(storageKey);
      if (stashed) {
        next.set(key, stashed);
        changed = true;
      }
    }

    if (changed) {
      const query = next.toString();
      const hash = window.location.hash;
      router.replace(`${pathname}${query ? `?${query}` : ""}${hash}`);
    }
  }, [pathname, searchParams, router]);

  return null;
}

// `useSearchParams` opts the calling tree out of static prerendering, which
// breaks `next build` for any prerenderable route. Scoping the consumer in a
// Suspense boundary contains the bailout to this component alone — every
// other page still prerenders. Fallback is `null` because the inner
// component renders `null` itself, so there is no UI gap on hydration.
export function PreserveQueryParams() {
  return (
    <Suspense fallback={null}>
      <PreserveQueryParamsInner />
    </Suspense>
  );
}
