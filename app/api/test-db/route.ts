import { NextResponse } from "next/server"
import { MongoClient } from "mongodb"

export async function GET() {
  const uri = process.env.MONGODB_URI!

  const client = new MongoClient(uri)
  await client.connect()

  return NextResponse.json({ status: "MongoDB connected ✅" })
}
