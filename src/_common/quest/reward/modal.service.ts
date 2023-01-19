import { defineAsyncComponent } from 'vue';
import { showModal } from '../../modal/modal.service';
import { Quest } from '../quest-model';
import { QuestRewardData } from './AppQuestRewardModal.vue';

interface QuestRewardModalOptions {
	quest: Quest;
	rewards: QuestRewardData[];
	title?: string;
}

export class QuestRewardModal {
	static async show(options: QuestRewardModalOptions) {
		const { quest, title, rewards } = options;

		return await showModal({
			modalId: 'QuestRewards',
			component: defineAsyncComponent(() => import('./AppQuestRewardModal.vue')),
			props: {
				quest,
				rewards,
				title,
			},
			size: 'full',
		});
	}
}
