import { defineAsyncComponent } from 'vue';

import { GameBuildModel } from '~common/game/build/build.model';
import { GameModel } from '~common/game/game.model';
import { GamePackageModel } from '~common/game/package/package.model';
import { showModal } from '~common/modal/modal.service';
import { UserModel } from '~common/user/user.model';

interface GamePackagePurchaseModalOptions {
	game: GameModel;
	package: GamePackageModel;
	build: GameBuildModel | null;
	fromExtraSection: boolean;

	partnerKey?: string;
	partner?: UserModel;
}

export async function showGamePackagePurchaseModal(options: GamePackagePurchaseModalOptions) {
	return await showModal<void>({
		modalId: 'GamePackagePurchase',
		component: defineAsyncComponent(
			() => import('~common/game/package/purchase-modal/AppGamePackagePurchaseModal.vue')
		),
		size: 'sm',
		props: options,
	});
}

export class GamePackagePurchaseModal {
	static async show(options: GamePackagePurchaseModalOptions) {
		return await showModal<void>({
			modalId: 'GamePackagePurchase',
			component: defineAsyncComponent(
				() => import('~common/game/package/purchase-modal/AppGamePackagePurchaseModal.vue')
			),
			size: 'sm',
			props: options,
		});
	}
}
