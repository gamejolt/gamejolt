import { defineAsyncComponent } from 'vue';
import { CommentModel } from '../comment/comment-model';
import { FiresidePostModel } from '../fireside/post/post-model';
import { GameModel } from '../game/game.model';
import { showModal } from '../modal/modal.service';

export type LikersResource = CommentModel | FiresidePostModel | GameModel;

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
