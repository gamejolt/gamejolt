import { defineAsyncComponent } from 'vue';
import { FiresidePostModel } from '../fireside/post/post-model';
import { GameModel } from '../game/game.model';
import { showModal } from '../modal/modal.service';

export type SupportersModel = FiresidePostModel | GameModel;

interface SupportersModalOptions {
	model: SupportersModel;
	count?: number;
}

export class SupportersModal {
	static async show(options: SupportersModalOptions) {
		const { count, model } = options;

		return await showModal<void>({
			modalId: 'Supporters',
			component: defineAsyncComponent(() => import('./AppSupportersModal.vue')),
			props: {
				count,
				model,
			},
			size: 'sm',
		});
	}
}
