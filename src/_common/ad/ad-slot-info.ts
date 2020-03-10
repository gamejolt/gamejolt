export type AdSlotSize = 'rectangle' | 'leaderboard' | 'footer' | 'video';
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
