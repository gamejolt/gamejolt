import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { Modal } from 'game-jolt-frontend-lib/components/modal/modal.service';
import { asyncComponentLoader } from 'game-jolt-frontend-lib/utils/utils';
import { Media } from '../../../../views/dashboard/games/manage/manage.store';

export type GameMediaItemEditModalRemoveCallback = () => void;

export class GameMediaItemEditModal {
	static async show(game: Game, item: Media, onRemove: GameMediaItemEditModalRemoveCallback) {
		return await Modal.show<Media>({
			modalId: 'GameMediaItemEdit',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "GameMediaItemEditModal" */ './edit-modal.vue')
				),
			props: {
				game,
				item,
				onRemove,
			},
			size: 'sm',
		});
	}
}
