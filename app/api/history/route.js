import { connectDB } from "@/lib/db";
import Generation from "@/models/Generation";

export async function GET() {
  try {
    await connectDB();

    const history = await Generation.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return Response.json({ data: history });
  } catch (error) {
    console.error("History error:", error);
    return Response.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    const { id } = await request.json();

    if (id === 'all') {
      await Generation.deleteMany({});
    } else {
      await Generation.findByIdAndDelete(id);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Delete history error:", error);
    return Response.json({ error: "Failed to delete history" }, { status: 500 });
  }
}
