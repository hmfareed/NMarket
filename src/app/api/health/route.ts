import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import mongoose from "mongoose";

export async function GET() {
  let dbStatus = "disconnected";
  let latencyMs = 0;

  try {
    const start = Date.now();
    await connectToDatabase();
    latencyMs = Date.now() - start;

    const state = mongoose.connection.readyState;
    // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
    if (state === 1) {
      dbStatus = "connected";
    } else if (state === 2) {
      dbStatus = "connecting";
    }
  } catch (error) {
    dbStatus = `error: ${(error as Error).message}`;
  }

  return NextResponse.json({
    status: "ok",
    appName: "NMarket",
    targetRegion: "Tamale, Northern Ghana",
    timestamp: new Date().toISOString(),
    database: {
      provider: "MongoDB",
      status: dbStatus,
      latencyMs: dbStatus === "connected" ? latencyMs : null,
    },
  });
}
