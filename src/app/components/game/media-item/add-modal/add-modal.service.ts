import { Game } from '../../../../../_common/game/game.model';
import { GameScreenshot } from '../../../../../_common/game/screenshot/screenshot.model';
import { GameSketchfab } from '../../../../../_common/game/sketchfab/sketchfab.model';
import { GameVideo } from '../../../../../_common/game/video/video.model';
import { Modal } from '../../../../../_common/modal/modal.service';
import { asyncComponentLoader } from '../../../../../utils/utils';

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
