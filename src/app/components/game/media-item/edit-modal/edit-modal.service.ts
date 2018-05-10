import { Modal } from '../../../../../lib/gj-lib-client/components/modal/modal.service';
import { asyncComponentLoader } from '../../../../../lib/gj-lib-client/utils/utils';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { Media } from '../../../../views/dashboard/games/manage/manage.store';

export type GameMediaItemEditModalRemoveCallback = () => void;

export class GameMediaItemEditModal {
	static async show(game: Game, item: Media, onRemove: GameMediaItemEditModalRemoveCallback) {
		return await Modal.show<Media>({
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "GameMediaItemEditModal" */ './edit-modal')
				),
			props: {
				game,
				item,
				onRemove,
			},
		});
	}
}
