import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { GamePackage } from 'game-jolt-frontend-lib/components/game/package/package.model';
import { Modal } from 'game-jolt-frontend-lib/components/modal/modal.service';
import { Sellable } from 'game-jolt-frontend-lib/components/sellable/sellable.model';
import { asyncComponentLoader } from 'game-jolt-frontend-lib/utils/utils';

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
