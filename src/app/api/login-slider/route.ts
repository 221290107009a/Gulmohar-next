import { NextResponse } from "next/server";
import { getLoginSlider } from "@/lib/slider";

export const dynamic = "force-dynamic";

export async function GET() {
	try {
		const slides = await getLoginSlider();
		return NextResponse.json({ success: true, slides });
	} catch (error) {
		console.error("Error in /api/login-slider route:", error);
		return NextResponse.json({ success: false, slides: [] }, { status: 500 });
	}
}
