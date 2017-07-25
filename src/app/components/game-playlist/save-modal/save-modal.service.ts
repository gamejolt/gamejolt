import { Modal } from '../../../../lib/gj-lib-client/components/modal/modal.service';
import { GameCollection } from '../../game/collection/collection.model';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';

export class GamePlaylistSaveModal {
	static async show(collection?: GameCollection) {
		return await Modal.show<GameCollection>({
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "GamePlaylistSaveModal" */ './save-modal')
				),
			props: { collection },
			size: 'sm',
		});
	}
}
