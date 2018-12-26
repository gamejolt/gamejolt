import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { GamePackage } from '../../../../../lib/gj-lib-client/components/game/package/package.model';
import { Modal } from '../../../../../lib/gj-lib-client/components/modal/modal.service';
import { Sellable } from '../../../../../lib/gj-lib-client/components/sellable/sellable.model';
import { asyncComponentLoader } from '../../../../../lib/gj-lib-client/utils/utils';

export class GamePackageEditModal {
	static async show(game: Game, gamePackage?: GamePackage, sellable?: Sellable) {
		return await Modal.show<GamePackage>({
			modalId: 'GamePackageEdit',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "GamePackageEditModal" */ './edit-modal')
				),
			noBackdropClose: true,
			noEscClose: true,
			size: 'sm',
			props: { game, gamePackage, sellable },
		});
	}
}
