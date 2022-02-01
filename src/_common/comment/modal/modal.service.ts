import { defineAsyncComponent } from 'vue';
import { showModal } from '../../modal/modal.service';
import { Model } from '../../model/model.service';

export type DisplayMode = 'comments' | 'shouts';

interface CommentModalOptions {
	displayMode?: DisplayMode;
	model: Model;
	initialTab?: string;
}

export class CommentModal {
	static async show(options: CommentModalOptions) {
		const { displayMode, model, initialTab } = options;

		return await showModal<void>({
			modalId: 'Comment-' + [model.constructor.name, model.id].join('-'),
			component: defineAsyncComponent(() => import('./modal.vue')),
			props: {
				displayMode,
				model,
				initialTab,
			},
			size: 'sm',
		});
	}
}
