import { defineAsyncComponent } from 'vue';
import { Comment } from '../comment/comment-model';
import { FiresidePost } from '../fireside/post/post-model';
import { Game } from '../game/game.model';
import { showModal } from '../modal/modal.service';

export type LikersResource = Comment | FiresidePost | Game;

interface LikersModalOptions {
	count: number;
	resource?: LikersResource;
}

export async function showLikersModal(options: LikersModalOptions) {
	const { count, resource } = options;

	return await showModal<void>({
		modalId: 'Likers',
		component: defineAsyncComponent(() => import('./AppLikesModal.vue')),
		props: {
			count,
			resource,
		},
		size: 'sm',
	});
}
