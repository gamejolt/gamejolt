import { defineAsyncComponent } from 'vue';

import { GameModel } from '~common/game/game.model';
import { GameScreenshotModel } from '~common/game/screenshot/screenshot.model';
import { GameSketchfabModel } from '~common/game/sketchfab/sketchfab.model';
import { GameVideoModel } from '~common/game/video/video.model';
import { showModal } from '~common/modal/modal.service';

export async function showGameMediaItemAddModal(game: GameModel) {
	return await showModal<(GameScreenshotModel | GameVideoModel | GameSketchfabModel)[]>({
		modalId: 'GameMediaItemAdd',
		component: defineAsyncComponent(() => import('~app/components/game/media-item/add-modal/AppGameMediaItemAddModal.vue')),
		props: {
			game,
		},
		size: 'sm',
	});
}
