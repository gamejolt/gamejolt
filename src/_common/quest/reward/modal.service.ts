import { defineAsyncComponent } from 'vue';

import { showModal } from '~common/modal/modal.service';
import { QuestModel } from '~common/quest/quest-model';
import { QuestRewardData } from '~common/quest/reward/AppQuestRewardModal.vue';

interface QuestRewardModalOptions {
	quest: QuestModel;
	rewards: QuestRewardData[];
	title?: string;
}

export async function showQuestRewardModal(options: QuestRewardModalOptions) {
	const { quest, title, rewards } = options;

	return await showModal({
		modalId: 'QuestRewards',
		component: defineAsyncComponent(
			() => import('~common/quest/reward/AppQuestRewardModal.vue')
		),
		props: {
			quest,
			rewards,
			title,
		},
		size: 'full',
	});
}
