import type { Meeting } from "@/types/meeting";


export async function getMeetingsServer(): Promise<Meeting[]> {
  const baseUrl = process.env.APP_URL;

  if (!baseUrl) {
    throw new Error("APP_URL is not defined");
  }
  const response = await fetch(`${baseUrl}/api/meetings`);
  if (!response.ok) {
    throw new Error(`Failed to fetch meetings: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}