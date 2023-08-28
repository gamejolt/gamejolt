import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../_common/modal/modal.service';
import { GameCollectionModel } from '../../game/collection/collection.model';

export class GamePlaylistSaveModal {
	static async show(collection?: GameCollectionModel) {
		return await showModal<GameCollectionModel>({
			modalId: 'GamePlaylistSave',
			component: defineAsyncComponent(() => import('./save-modal.vue')),
			props: { collection },
			size: 'sm',
		});
	}
}
