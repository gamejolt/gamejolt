export type AdSlotSize = 'rectangle' | 'leaderboard' | 'footer' | 'video';

export interface AdSlotMeta {
	staticSize?: boolean;
}

export class AdSlot {
	constructor(public readonly size: AdSlotSize, public readonly meta: AdSlotMeta) {}
}
