import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../_common/modal/modal.service';
import { GameCollection } from '../../game/collection/collection.model';

export class GamePlaylistSaveModal {
	static async show(collection?: GameCollection) {
		return await showModal<GameCollection>({
			modalId: 'GamePlaylistSave',
			component: defineAsyncComponent(
				() => import(/* webpackChunkName: "GamePlaylistSaveModal" */ './save-modal.vue')
			),
			props: { collection },
			size: 'sm',
		});
	}
}
