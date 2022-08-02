export interface StickerCount {
	stickerId: number;
	imgUrl: string;
	count: number;
	chargedCount: number;
}

export function constructStickerCounts(data: any): StickerCount[] {
	// If sticker count data was passed in from a model, it'll already be an
	// array of sticker counts.
	if (Array.isArray(data)) {
		return [...data];
	}

	const stickerCounts = JSON.parse(data) as Record<string, any>;

	const items: StickerCount[] = Object.entries(stickerCounts).map(
		([key, { img, num, cnum }]) => ({
			stickerId: parseInt(key),
			imgUrl: img,
			count: num,
			// TODO(charged-stickers) make sure this is correct.
			chargedCount: typeof cnum === 'number' ? cnum : 0,
		})
	);

	return items;
}

// TODO(charged-stickers) remove
export function isStickerCountCharged(sticker: StickerCount) {
	// if (import.meta.env.DEV) {
	// 	return sticker.stickerId % 4 === 0;
	// }
	return sticker.chargedCount > 0;
}
