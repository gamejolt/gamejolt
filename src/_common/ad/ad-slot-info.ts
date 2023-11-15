export type AdSlotSize = 'rectangle' | 'leaderboard' | 'video' | 'skyscraper-1' | 'skyscraper-2';
export type AdSlotPlacement = 'content' | 'side' | 'top';

export interface AdSlotMeta {
	staticSize?: boolean;
}

export class AdSlot {
	constructor(
		public readonly size: AdSlotSize,
		public readonly placement: AdSlotPlacement,
		public readonly meta: AdSlotMeta
	) {}
}
