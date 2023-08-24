import { defineAsyncComponent } from 'vue';
import { GamePackageModel } from '../../../../../_common/game/package/package.model';
import { showModal } from '../../../../../_common/modal/modal.service';
import { SellableModel } from '../../../../../_common/sellable/sellable.model';
import { GameDashRouteController } from '../../../../views/dashboard/games/manage/manage.store';

export class GamePackageEditModal {
	static async show(
		routeController: GameDashRouteController,
		gamePackage?: GamePackageModel,
		sellable?: SellableModel
	) {
		return await showModal<GamePackageModel>({
			modalId: 'GamePackageEdit',
			component: defineAsyncComponent(() => import('./AppGamePackageEditModal.vue')),
			noBackdropClose: true,
			noEscClose: true,
			size: 'sm',
			props: { routeController, gamePackage, sellable },
		});
	}
}
