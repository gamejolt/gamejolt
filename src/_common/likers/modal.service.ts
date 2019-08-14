import { asyncComponentLoader } from '../../utils/utils';
import { Comment } from '../comment/comment-model';
import { FiresidePost } from '../fireside/post/post-model';
import { Game } from '../game/game.model';
import { Modal } from '../modal/modal.service';

export type LikersResource = Comment | FiresidePost | Game;

interface LikersModalOptions {
	count: number;
	resource?: LikersResource;
}

export class LikersModal {
	static async show(options: LikersModalOptions) {
		const { count, resource } = options;

		return await Modal.show<void>({
			modalId: 'Likers',
			component: () =>
				asyncComponentLoader(import(/* webpackChunkName: "LikersModal" */ './modal.vue')),
			props: {
				count,
				resource,
			},
			size: 'sm',
		});
	}
}
