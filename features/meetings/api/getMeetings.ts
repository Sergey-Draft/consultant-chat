import type { Meeting } from "@/types/meeting";

export async function getMeetings(): Promise<Meeting[]> {
  const response = await fetch("/api/meetings");

  if (!response.ok) {
    throw new Error(
      `Failed to fetch meetings: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}