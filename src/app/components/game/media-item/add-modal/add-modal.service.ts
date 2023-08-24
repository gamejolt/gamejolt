import { defineAsyncComponent } from 'vue';
import { GameModel } from '../../../../../_common/game/game.model';
import { GameScreenshotModel } from '../../../../../_common/game/screenshot/screenshot.model';
import { GameSketchfabModel } from '../../../../../_common/game/sketchfab/sketchfab.model';
import { GameVideoModel } from '../../../../../_common/game/video/video.model';
import { showModal } from '../../../../../_common/modal/modal.service';

export class GameMediaItemAddModal {
	static async show(game: GameModel) {
		return await showModal<(GameScreenshotModel | GameVideoModel | GameSketchfabModel)[]>({
			modalId: 'GameMediaItemAdd',
			component: defineAsyncComponent(() => import('./add-modal.vue')),
			props: {
				game,
			},
			size: 'sm',
		});
	}
}
