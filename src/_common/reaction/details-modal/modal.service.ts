import { defineAsyncComponent } from 'vue';

import { showModal } from '~common/modal/modal.service';
import { ReactionableModel, ReactionCount } from '~common/reaction/reaction-count';

interface ReactionDetailsModalOptions {
	model: ReactionableModel;
	initialReaction?: ReactionCount;
}

export async function showReactionDetailsModal(options: ReactionDetailsModalOptions) {
	const { model, initialReaction } = options;

	return await showModal<void>({
		modalId: 'ReactionDetails',
		component: defineAsyncComponent(
			() => import('~common/reaction/details-modal/AppReactionDetailsModal.vue')
		),
		props: {
			model,
			initialReaction,
		},
		size: 'sm',
	});
}
