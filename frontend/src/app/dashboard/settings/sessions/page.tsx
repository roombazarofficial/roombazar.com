"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function Page() {
  const [deviceInfo, setDeviceInfo] = useState("Current Browser");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent;
      let browser = "Web Browser";
      let os = "Desktop";

      if (ua.includes("Chrome")) browser = "Chrome";
      else if (ua.includes("Firefox")) browser = "Firefox";
      else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
      else if (ua.includes("Edg")) browser = "Edge";

      if (ua.includes("Windows")) os = "Windows";
      else if (ua.includes("Macintosh")) os = "macOS";
      else if (ua.includes("Android")) os = "Android";
      else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

      setDeviceInfo(`${browser} on ${os}`);
    }
  }, []);

  return (
    <div className="max-w-2xl">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Signed-in devices
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Manage your active login sessions across devices.
        </p>
      </header>

      <ul className="mt-6 divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
        <li className="flex items-center gap-4 p-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink flex items-center gap-2">
              <span>💻</span> {deviceInfo}
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                This device · Active now
              </span>
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              Current session
            </p>
          </div>
        </li>
      </ul>
    </div>
  );
}
