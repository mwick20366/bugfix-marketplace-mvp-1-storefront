// lib/metadata.ts
import { Metadata } from "next"

export async function createPageMetadata(
  title: string, 
  searchParams: Promise<any>
): Promise<Metadata> {
  // Awaiting here solves the "soft-nav title doesn't update" bug
  await searchParams; 

  return {
    title: title,
    // Add other shared SEO logic here (canonical URLs, OpenGraph, etc.)
  }
}
