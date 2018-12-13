import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { GameScreenshot } from '../../../../../lib/gj-lib-client/components/game/screenshot/screenshot.model';
import { GameSketchfab } from '../../../../../lib/gj-lib-client/components/game/sketchfab/sketchfab.model';
import { GameVideo } from '../../../../../lib/gj-lib-client/components/game/video/video.model';
import { Modal } from '../../../../../lib/gj-lib-client/components/modal/modal.service';
import { asyncComponentLoader } from '../../../../../lib/gj-lib-client/utils/utils';

export class GameMediaItemAddModal {
	static async show(game: Game) {
		return await Modal.show<(GameScreenshot | GameVideo | GameSketchfab)[]>({
			modalId: 'GameMediaItemAdd',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "GameMediaItemAddModal" */ './add-modal')
				),
			props: {
				game,
			},
			size: 'sm',
		});
	}
}
