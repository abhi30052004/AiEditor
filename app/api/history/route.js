import { connectDB } from "@/lib/db";
import Generation from "@/models/Generation";

export async function GET() {
  try {
    await connectDB();

    const history = await Generation.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    return Response.json({ data: history });
  } catch (error) {
    console.error("History error:", error);
    return Response.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
