export interface SliderSlide {
	id: number;
	image: string;
	title?: string;
}

export function resolveSliderImageUrl(path?: string | null): string {
	if (!path || typeof path !== "string") return "";
	let trimmed = path.trim();
	if (!trimmed) return "";

	const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
	const cleanBackendBase = backendBase.replace(/\/$/, "");

	if (trimmed.includes("/storage/")) {
		const storageIndex = trimmed.indexOf("/storage/");
		const relativeStoragePath = trimmed.substring(storageIndex);
		return cleanBackendBase + relativeStoragePath;
	}

	if (trimmed.startsWith("/")) {
		return cleanBackendBase + trimmed;
	}

	return trimmed;
}

export async function getLoginSlider(): Promise<SliderSlide[]> {
	try {
		const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
		const apiKey = process.env.NEXT_PUBLIC_API_KEY || "630febe3-d23c-45j6-8a0e-f432518e35as21";

		const response = await fetch(backendUrl + "/api/slider", {
			method: "GET",
			headers: {
				Accept: "application/json",
				accesskey: apiKey,
			},
			next: { revalidate: 60 },
		});

		if (!response.ok) return [];

		const data = await response.json();
		const list = data?.slider || data?.data || [];
		if (!Array.isArray(list)) return [];

		const loginSlider = list.find(
			(s: any) =>
				s?.name?.toLowerCase() === "login-slider" ||
				s?.translations?.some((t: any) => t?.name?.toLowerCase() === "login-slider") ||
				s?.id === 6
		);

		if (!loginSlider || !Array.isArray(loginSlider.slides)) return [];

		return loginSlider.slides
			.filter((slide: any) => slide?.file?.path)
			.map((slide: any) => ({
				id: slide.id,
				image: resolveSliderImageUrl(slide.file.path),
				title: slide.caption_1 || slide.file.filename || "Gulmohar Collection",
			}));
	} catch (error) {
		console.error("Error fetching login slider in gulmohar-next:", error);
		return [];
	}
}
