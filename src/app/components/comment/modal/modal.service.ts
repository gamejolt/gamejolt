import { defineAsyncComponent } from 'vue';
import { CommentSort, CommentableModel } from '../../../../_common/comment/comment-model';
import { showModal } from '../../../../_common/modal/modal.service';
import { Model } from '../../../../_common/model/model.service';

export type DisplayMode = 'comments' | 'shouts';

interface CommentModalOptions {
	displayMode?: DisplayMode;
	model: CommentableModel & Model;
	initialTab?: CommentSort;
}

export async function showCommentModal(options: CommentModalOptions) {
	const { displayMode, model, initialTab } = options;

	return await showModal<void>({
		modalId: 'Comment-' + [model.constructor.name, model.id].join('-'),
		component: defineAsyncComponent(() => import('./AppCommentModal.vue')),
		props: {
			displayMode,
			model,
			initialTab,
		},
		size: 'sm',
	});
}
