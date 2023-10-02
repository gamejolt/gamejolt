import { defineAsyncComponent } from 'vue';
import { showModal } from '../../modal/modal.service';
import { ReactionableModel, ReactionCount } from '../reaction-count';

interface ReactionDetailsModalOptions {
	model: ReactionableModel;
	initialReaction?: ReactionCount;
}

export async function showReactionDetailsModal(options: ReactionDetailsModalOptions) {
	const { model, initialReaction } = options;

	return await showModal<void>({
		modalId: 'ReactionDetails',
		component: defineAsyncComponent(() => import('./AppReactionDetailsModal.vue')),
		props: {
			model,
			initialReaction,
		},
		size: 'sm',
	});
}
