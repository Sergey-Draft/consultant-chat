import { mockMeetings } from "@/mocks/meetings";
import { NextResponse } from "next/server";


export async function GET() {
    return NextResponse.json(mockMeetings)
  }