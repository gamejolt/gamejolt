export type AdSlotSize = 'rectangle' | 'leaderboard' | 'video' | 'skyscraper';

export type AdSlotPlacement = 'content' | 'side' | 'top';

export class AdSlot {
	constructor(public readonly size: AdSlotSize, public readonly placement: AdSlotPlacement) {}
}
