import { defineAsyncComponent } from 'vue';
import { GamePackage } from '../../../../../_common/game/package/package.model';
import { showModal } from '../../../../../_common/modal/modal.service';
import { Sellable } from '../../../../../_common/sellable/sellable.model';
import { GameDashRouteController } from '../../../../views/dashboard/games/manage/manage.store';

export class GamePackageEditModal {
	static async show(
		routeController: GameDashRouteController,
		gamePackage?: GamePackage,
		sellable?: Sellable
	) {
		return await showModal<GamePackage>({
			modalId: 'GamePackageEdit',
			component: defineAsyncComponent(() => import('./AppGamePackageEditModal.vue')),
			noBackdropClose: true,
			noEscClose: true,
			size: 'sm',
			props: { routeController, gamePackage, sellable },
		});
	}
}
