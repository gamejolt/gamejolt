import { defineAsyncComponent } from 'vue';

import { GameCollectionModel } from '~app/components/game/collection/collection.model';
import { showModal } from '~common/modal/modal.service';

export async function showGamePlaylistSaveModal(collection?: GameCollectionModel) {
	return await showModal<GameCollectionModel>({
		modalId: 'GamePlaylistSave',
		component: defineAsyncComponent(() => import('~app/components/game-playlist/save-modal/AppGamePlaylistSaveModal.vue')),
		props: { collection },
		size: 'sm',
	});
}
