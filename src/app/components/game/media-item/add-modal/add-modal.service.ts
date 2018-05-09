import { Modal } from '../../../../../lib/gj-lib-client/components/modal/modal.service';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { asyncComponentLoader } from '../../../../../lib/gj-lib-client/utils/utils';
import { GameScreenshot } from '../../../../../lib/gj-lib-client/components/game/screenshot/screenshot.model';
import { GameVideo } from '../../../../../lib/gj-lib-client/components/game/video/video.model';
import { GameSketchfab } from '../../../../../lib/gj-lib-client/components/game/sketchfab/sketchfab.model';

export class GameMediaItemAddModal {
	static async show(game: Game) {
		return await Modal.show<(GameScreenshot | GameVideo | GameSketchfab)[]>({
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
