"use client";

import { ProductDraftProvider } from "@/lib/productStore";
import { ResourceInventoryProvider } from "@/lib/resourceStore";
import { ProviderNav } from "@/app/components/provider/ProviderNav";

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProductDraftProvider>
      <ResourceInventoryProvider>
        <div className="flex min-h-screen">
          <ProviderNav />
          <div className="flex-1 ml-64">
            {children}
          </div>
        </div>
      </ResourceInventoryProvider>
    </ProductDraftProvider>
  );
}
