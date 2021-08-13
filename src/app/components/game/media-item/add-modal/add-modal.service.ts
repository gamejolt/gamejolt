import { defineAsyncComponent } from 'vue';
import { Game } from '../../../../../_common/game/game.model';
import { GameScreenshot } from '../../../../../_common/game/screenshot/screenshot.model';
import { GameSketchfab } from '../../../../../_common/game/sketchfab/sketchfab.model';
import { GameVideo } from '../../../../../_common/game/video/video.model';
import { showModal } from '../../../../../_common/modal/modal.service';

export class GameMediaItemAddModal {
	static async show(game: Game) {
		return await showModal<(GameScreenshot | GameVideo | GameSketchfab)[]>({
			modalId: 'GameMediaItemAdd',
			component: defineAsyncComponent(
				() => import(/* webpackChunkName: "GameMediaItemAddModal" */ './add-modal.vue')
			),
			props: {
				game,
			},
			size: 'sm',
		});
	}
}
