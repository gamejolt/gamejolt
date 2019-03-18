import { Modal } from 'game-jolt-frontend-lib/components/modal/modal.service';
import { asyncComponentLoader } from 'game-jolt-frontend-lib/utils/utils';
import { GameCollection } from '../../game/collection/collection.model';

export class GamePlaylistSaveModal {
	static async show(collection?: GameCollection) {
		return await Modal.show<GameCollection>({
			modalId: 'GamePlaylistSave',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "GamePlaylistSaveModal" */ './save-modal.vue')
				),
			props: { collection },
			size: 'sm',
		});
	}
}
