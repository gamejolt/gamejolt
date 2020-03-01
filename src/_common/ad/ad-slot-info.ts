export type AdSlotSize = 'rectangle' | 'leaderboard' | 'footer' | 'video';

function generateSlotId() {
	return Math.random() + '';
}

export interface AdSlotMeta {
	staticSize?: boolean;
}

export class AdSlot {
	/**
	 * We change this as the route changes. This way we can tell any of the ad
	 * adapters when the slot needs to load a new ad in.
	 */
	id: string | null = null;

	constructor(public readonly size: AdSlotSize, public readonly meta: AdSlotMeta) {}

	regenerateId() {
		this.id = generateSlotId();
	}
}
