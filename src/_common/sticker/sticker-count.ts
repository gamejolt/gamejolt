export interface StickerCount {
	stickerId: number;
	imgUrl: string;
	count: number;
}

export function constructStickerCounts(data: any): StickerCount[] {
	// If sticker count data was passed in from a model, it'll already be an
	// array of sticker counts.
	if (Array.isArray(data)) {
		return [...data];
	}

	const stickerCounts = JSON.parse(data) as Record<string, any>;

	const items: StickerCount[] = Object.entries(stickerCounts).map(([key, { img, num }]) => ({
		stickerId: parseInt(key),
		imgUrl: img,
		count: num,
	}));

	return items;
}
