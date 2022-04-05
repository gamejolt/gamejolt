export class QuestReward {
	constructor(data: { amount: number; name: string; img_url?: string }) {
		Object.assign(this, data);
	}

	declare amount: number;
	declare name: string;
	declare img_url?: string;
}
