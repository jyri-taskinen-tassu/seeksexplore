"use client";

import React from "react";
import Link from "next/link";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

// Mock products data (in a real app, this would come from a store)
const mockProducts = [
  {
    id: "prod-snowmobile-safari",
    title: "Snowmobile Safari – Sport & Touring",
    shortDescription: "Experience the thrill of snowmobiling through pristine winter landscapes.",
    category: "Outdoor / Snowmobile",
    priceFrom: 149,
    currency: "EUR",
    status: "published",
    publishedAt: "2025-01-01",
  },
  {
    id: "prod-hiking",
    title: "Guided Hiking Tour – Nuuksio National Park",
    shortDescription: "Explore the beautiful trails of Nuuksio National Park with an experienced guide.",
    category: "Outdoor / Hiking",
    priceFrom: 45,
    currency: "EUR",
    status: "published",
    publishedAt: "2025-01-02",
  },
  {
    id: "prod-ebike-tour",
    title: "E-bike Tour",
    shortDescription: "Discover the city on an electric bike with a local guide.",
    category: "Outdoor / Cycling",
    priceFrom: 65,
    currency: "EUR",
    status: "published",
    publishedAt: "2025-01-03",
  },
];

function formatCurrency(value: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ProviderProductsPage() {
  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white px-6 py-4 sticky top-0 z-10">
        <div className="flex w-full items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-neutral-900">Products</div>
            <div className="mt-1 text-sm text-neutral-500">
              Manage your product catalog
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/provider/products/new"
              className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Create Product
            </Link>
            <Link
              href="/provider/products/new-ai"
              className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Create with AI
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6">
        {/* Products List */}
        <section className="rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-6 py-4">
            <div className="text-base font-semibold text-neutral-900">Published Products</div>
            <div className="mt-1 text-sm text-neutral-500">
              {mockProducts.length} product{mockProducts.length !== 1 ? "s" : ""}
            </div>
          </div>
          <div className="divide-y divide-neutral-100">
            {mockProducts.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-sm text-neutral-500 mb-4">No products yet</div>
                <Link
                  href="/provider/products/new"
                  className="inline-block rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
                >
                  Create your first product
                </Link>
              </div>
            ) : (
              mockProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-6 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base font-semibold text-neutral-900">
                          {product.title}
                        </h3>
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                          {product.status}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600 mb-2">
                        {product.shortDescription}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-neutral-500">
                        <span>{product.category}</span>
                        <span>•</span>
                        <span>From {formatCurrency(product.priceFrom, product.currency)}</span>
                        <span>•</span>
                        <span>Published {product.publishedAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
