import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { Modal } from '../../../../../lib/gj-lib-client/components/modal/modal.service';
import { asyncComponentLoader } from '../../../../../lib/gj-lib-client/utils/utils';

export class GameDevStageSelectorConfirmModal {
	static async show(game: Game, stage: number) {
		return await Modal.show<boolean>({
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "GameDevStageSelectorConfirmModal" */ './confirm')
				),
			props: { game, stage },
			size: 'sm',
		});
	}
}
