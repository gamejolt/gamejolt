import { defineAsyncComponent } from 'vue';

import { FiresidePostModel } from '~common/fireside/post/post-model';
import { GameModel } from '~common/game/game.model';
import { showModal } from '~common/modal/modal.service';

export type SupportersModel = FiresidePostModel | GameModel;

interface SupportersModalOptions {
	model: SupportersModel;
	count?: number;
}

export async function showSupportersModal(options: SupportersModalOptions) {
	const { count, model } = options;

	return await showModal<void>({
		modalId: 'Supporters',
		component: defineAsyncComponent(() => import('~common/supporters/AppSupportersModal.vue')),
		props: {
			count,
			model,
		},
		size: 'sm',
	});
}
