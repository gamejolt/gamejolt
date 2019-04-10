import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { GameScreenshot } from 'game-jolt-frontend-lib/components/game/screenshot/screenshot.model';
import { GameSketchfab } from 'game-jolt-frontend-lib/components/game/sketchfab/sketchfab.model';
import { GameVideo } from 'game-jolt-frontend-lib/components/game/video/video.model';
import { Modal } from 'game-jolt-frontend-lib/components/modal/modal.service';
import { asyncComponentLoader } from 'game-jolt-frontend-lib/utils/utils';

export class GameMediaItemAddModal {
	static async show(game: Game) {
		return await Modal.show<(GameScreenshot | GameVideo | GameSketchfab)[]>({
			modalId: 'GameMediaItemAdd',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "GameMediaItemAddModal" */ './add-modal.vue')
				),
			props: {
				game,
			},
			size: 'sm',
		});
	}
}
