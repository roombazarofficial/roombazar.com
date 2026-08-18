"use client";

import { useEffect } from "react";
import { useAuthUi } from "@/store/authuistore";

/*
  Opens the sign-in dialog when middleware has redirected a signed-out visitor
  here from a protected route.

  Reads the query from window rather than useSearchParams: this is mounted in
  the root layout, and the hook would opt every route in the app out of static
  rendering for what is a purely client-side concern.
*/
export function SignInLauncher() {
  const openSignIn = useAuthUi((state) => state.openSignIn);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("signin") !== "1") return;

    const next = params.get("next") ?? "/";

    const url = new URL(window.location.href);
    url.searchParams.delete("signin");
    url.searchParams.delete("next");
    window.history.replaceState({}, "", url.pathname + url.search);

    openSignIn({ next });
  }, [openSignIn]);

  return null;
}
