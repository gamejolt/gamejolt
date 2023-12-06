export type AdSlotSize =
	| 'rectangle'
	| 'rectangle-fix'
	| 'leaderboard'
	| 'video'
	| 'skyscraper-1'
	| 'skyscraper-2';

export type AdSlotPlacement = 'content' | 'side' | 'top';

export class AdSlot {
	constructor(public readonly size: AdSlotSize, public readonly placement: AdSlotPlacement) {}
}
