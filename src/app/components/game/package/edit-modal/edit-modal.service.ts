import { defineAsyncComponent } from 'vue';
import { Game } from '../../../../../_common/game/game.model';
import { GamePackage } from '../../../../../_common/game/package/package.model';
import { showModal } from '../../../../../_common/modal/modal.service';
import { Sellable } from '../../../../../_common/sellable/sellable.model';

export class GamePackageEditModal {
	static async show(game: Game, gamePackage?: GamePackage, sellable?: Sellable) {
		return await showModal<GamePackage>({
			modalId: 'GamePackageEdit',
			component: defineAsyncComponent(
				() => import(/* webpackChunkName: "GamePackageEditModal" */ './edit-modal.vue')
			),
			noBackdropClose: true,
			noEscClose: true,
			size: 'sm',
			props: { game, gamePackage, sellable },
		});
	}
}
