import { defineAsyncComponent } from 'vue';
import { GameModel } from '../../../../../_common/game/game.model';
import { showModal } from '../../../../../_common/modal/modal.service';
import { Media } from '../../../../views/dashboard/games/manage/manage.store';

export type GameMediaItemEditModalRemoveCallback = () => void;

export async function showGameMediaItemEditModal(
	game: GameModel,
	item: Media,
	onRemove: GameMediaItemEditModalRemoveCallback
) {
	return await showModal<Media>({
		modalId: 'GameMediaItemEdit',
		component: defineAsyncComponent(() => import('./edit-modal.vue')),
		props: {
			game,
			item,
			onRemove,
		},
		size: 'sm',
	});
}
