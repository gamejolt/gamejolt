import { defineAsyncComponent } from 'vue';
import { Modal } from '../../../../_common/modal/modal.service';
import { GameCollection } from '../../game/collection/collection.model';

export class GamePlaylistSaveModal {
	static async show(collection?: GameCollection) {
		return await Modal.show<GameCollection>({
			modalId: 'GamePlaylistSave',
			component: defineAsyncComponent(
				() => import(/* webpackChunkName: "GamePlaylistSaveModal" */ './save-modal.vue')
			),
			props: { collection },
			size: 'sm',
		});
	}
}
