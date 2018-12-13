import { Modal } from '../../../../lib/gj-lib-client/components/modal/modal.service';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';
import { GameCollection } from '../../game/collection/collection.model';

export class GamePlaylistSaveModal {
	static async show(collection?: GameCollection) {
		return await Modal.show<GameCollection>({
			modalId: 'GamePlaylistSave',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "GamePlaylistSaveModal" */ './save-modal')
				),
			props: { collection },
			size: 'sm',
		});
	}
}
