import { defineAsyncComponent } from 'vue';

import { Media } from '~app/views/dashboard/games/manage/manage.store';
import { GameModel } from '~common/game/game.model';
import { showModal } from '~common/modal/modal.service';

export type GameMediaItemEditModalRemoveCallback = () => void;

export async function showGameMediaItemEditModal(
	game: GameModel,
	item: Media,
	onRemove: GameMediaItemEditModalRemoveCallback
) {
	return await showModal<Media>({
		modalId: 'GameMediaItemEdit',
		component: defineAsyncComponent(() => import('~app/components/game/media-item/edit-modal/AppGameMediaItemEditModal.vue')),
		props: {
			game,
			item,
			onRemove,
		},
		size: 'sm',
	});
}
