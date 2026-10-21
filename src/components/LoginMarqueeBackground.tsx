"use client";

import React, { useMemo, useState, useEffect } from "react";
import { SliderSlide } from "@/lib/slider";

// Fallback card when image is loading or fails
function FallbackCard({ index }: { index: number }) {
	const gradients = [
		"from-amber-600/20 to-red-600/25",
		"from-rose-600/20 to-orange-600/25",
		"from-yellow-600/20 to-amber-700/25",
		"from-red-600/20 to-rose-700/25",
		"from-amber-500/20 to-yellow-600/25",
	];
	const grad = gradients[index % gradients.length];

	return (
		<div className="relative flex-shrink-0 flex h-[365px] w-48 select-none flex-col overflow-hidden rounded-2xl shadow-lg border border-amber-900/10 bg-white dark:bg-zinc-900">
			<div className={`flex h-full w-full flex-col items-center justify-center bg-gradient-to-br ${grad} p-4 text-center`}>
				<div className="h-12 w-12 rounded-2xl bg-white/90 dark:bg-zinc-800/90 shadow-sm flex items-center justify-center mb-2 border border-amber-500/20">
					<span className="text-xl">🌺</span>
				</div>
				<span className="text-[12px] font-serif font-bold text-gray-900 dark:text-gray-100">
					Gulmohar
				</span>
				<span className="text-[9px] tracking-wider uppercase text-amber-700 dark:text-amber-400 mt-1">
					Footwear & Fashion
				</span>
			</div>
		</div>
	);
}

// Slide Card displaying full-bleed clean image
function SlideCard({ slide }: { slide: SliderSlide }) {
	const [hasError, setHasError] = useState(false);

	if (hasError) {
		return <FallbackCard index={slide.id} />;
	}

	return (
		<div className="relative flex-shrink-0 h-[365px] w-48 select-none overflow-hidden rounded-2xl shadow-lg border border-gray-200/50 dark:border-zinc-800 bg-gray-100 dark:bg-zinc-900">
			<img
				src={slide.image}
				alt={slide.title || "Gulmohar Style"}
				className="h-full w-full object-fill select-none pointer-events-none"
				loading="lazy"
				decoding="async"
				onError={() => setHasError(true)}
			/>
		</div>
	);
}

type RowItem =
	| { isFallback: true; id: number; index: number }
	| { isFallback: false; slide: SliderSlide };

interface LoginMarqueeBackgroundProps {
	slides?: SliderSlide[];
}

export default function LoginMarqueeBackground({ slides: initialSlides = [] }: LoginMarqueeBackgroundProps) {
	const [slides, setSlides] = useState<SliderSlide[]>(initialSlides);

	// Sync with parent props
	useEffect(() => {
		if (initialSlides && initialSlides.length > 0) {
			setSlides(initialSlides);
		}
	}, [initialSlides]);

	// Client-side fallback fetch
	useEffect(() => {
		if (slides.length > 0) return;

		let isMounted = true;
		fetch("/api/login-slider")
			.then((res) => res.json())
			.then((data) => {
				if (isMounted && data?.slides && Array.isArray(data.slides) && data.slides.length > 0) {
					setSlides(data.slides);
				}
			})
			.catch((err) => {
				console.error("Failed to load login slider on client in gulmohar-next:", err);
			});

		return () => {
			isMounted = false;
		};
	}, [slides.length]);

	// Group slides into ROWS with alternating left/right directions
	const ROWS = useMemo(() => {
		const totalRows = 5;
		const directions: ("left" | "right")[] = ["left", "right", "left", "right", "left"];

		if (!slides || slides.length === 0) {
			return directions.map((direction, rowIdx) => ({
				direction,
				items: Array.from({ length: 6 }, (_, itemIdx): RowItem => ({
					isFallback: true,
					id: rowIdx * 10 + itemIdx,
					index: itemIdx,
				})),
			}));
		}

		// Ensure each row has at least 5-6 slides for horizontal spanning
		const itemsPerRow = Math.max(5, Math.ceil(slides.length / totalRows));

		return directions.map((direction, rowIdx) => {
			const rowSlides: SliderSlide[] = [];
			for (let i = 0; i < itemsPerRow; i++) {
				const slideIndex = (rowIdx + i * totalRows) % slides.length;
				rowSlides.push(slides[slideIndex]);
			}
			return {
				direction,
				items: rowSlides.map((slide): RowItem => ({ isFallback: false, slide })),
			};
		});
	}, [slides]);

	return (
		<div
			className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-br from-amber-50/60 via-stone-100 to-rose-50/40 dark:from-zinc-950 dark:to-zinc-900"
			aria-hidden="true"
		>
			{/* Grid container tilted at -16deg and scaled to cover background */}
			<div className="pointer-events-none absolute left-1/2 top-1/2 flex h-[320vh] w-[340vw] -translate-x-1/2 -translate-y-1/2 -rotate-[16deg] scale-110 select-none flex-col justify-center gap-6">
				{ROWS.map((row, rowIdx) => {
					// Double items to make the horizontal marquee loop infinite and seamless
					const list = [...row.items, ...row.items];
					const animationClass =
						row.direction === "left"
							? "animate-marquee-left"
							: "animate-marquee-right";

					return (
						<div
							key={rowIdx}
							className="relative flex w-full flex-row overflow-visible"
						>
							<div className={`flex flex-row gap-6 shrink-0 ${animationClass}`}>
								{list.map((item, idx) => {
									if (item.isFallback) {
										return <FallbackCard key={idx} index={item.index} />;
									}
									return (
										<SlideCard
											key={`${item.slide.id}-${idx}`}
											slide={item.slide}
										/>
									);
								})}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
