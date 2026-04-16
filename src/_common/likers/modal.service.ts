import { defineAsyncComponent } from 'vue';

import { CommentModel } from '~common/comment/comment-model';
import { FiresidePostModel } from '~common/fireside/post/post-model';
import { GameModel } from '~common/game/game.model';
import { showModal } from '~common/modal/modal.service';

export type LikersResource = CommentModel | FiresidePostModel | GameModel;

interface LikersModalOptions {
	count: number;
	resource?: LikersResource;
}

export async function showLikersModal(options: LikersModalOptions) {
	const { count, resource } = options;

	return await showModal<void>({
		modalId: 'Likers',
		component: defineAsyncComponent(() => import('~common/likers/AppLikesModal.vue')),
		props: {
			count,
			resource,
		},
		size: 'sm',
	});
}
