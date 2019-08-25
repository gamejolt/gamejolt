import { Game } from '../../../../../_common/game/game.model';
import { GamePackage } from '../../../../../_common/game/package/package.model';
import { Modal } from '../../../../../_common/modal/modal.service';
import { Sellable } from '../../../../../_common/sellable/sellable.model';
import { asyncComponentLoader } from '../../../../../utils/utils';

export class GamePackageEditModal {
	static async show(game: Game, gamePackage?: GamePackage, sellable?: Sellable) {
		return await Modal.show<GamePackage>({
			modalId: 'GamePackageEdit',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "GamePackageEditModal" */ './edit-modal.vue')
				),
			noBackdropClose: true,
			noEscClose: true,
			size: 'sm',
			props: { game, gamePackage, sellable },
		});
	}
}
