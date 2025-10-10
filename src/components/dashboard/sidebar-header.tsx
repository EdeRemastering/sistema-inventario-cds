"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";

export function SidebarHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="h-4 w-px bg-sidebar-border" />
        {/* <div className="ml-2">
          <CDSLogo
            size="sm"
            showText={true}
            textClassName="font-semibold text-lg text-foreground"
          />
        </div> */}
      </div>
    </header>
  );
}
