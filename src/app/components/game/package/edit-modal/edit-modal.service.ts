import { defineAsyncComponent } from 'vue';

import { GameDashRouteController } from '~app/views/dashboard/games/manage/manage.store';
import { GamePackageModel } from '~common/game/package/package.model';
import { showModal } from '~common/modal/modal.service';
import { SellableModel } from '~common/sellable/sellable.model';

export async function showGamePackageEditModal(
	routeController: GameDashRouteController,
	gamePackage?: GamePackageModel,
	sellable?: SellableModel
) {
	return await showModal<GamePackageModel>({
		modalId: 'GamePackageEdit',
		component: defineAsyncComponent(() => import('~app/components/game/package/edit-modal/AppGamePackageEditModal.vue')),
		noBackdropClose: true,
		noEscClose: true,
		size: 'sm',
		props: { routeController, gamePackage, sellable },
	});
}
