import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../modal/modal.service';
import { UserModel } from '../../../user/user.model';
import { GameBuildModel } from '../../build/build.model';
import { GameModel } from '../../game.model';
import { GamePackageModel } from '../package.model';

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
		component: defineAsyncComponent(() => import('./AppGamePackagePurchaseModal.vue')),
		size: 'sm',
		props: options,
	});
}

export class GamePackagePurchaseModal {
	static async show(options: GamePackagePurchaseModalOptions) {
		return await showModal<void>({
			modalId: 'GamePackagePurchase',
			component: defineAsyncComponent(() => import('./AppGamePackagePurchaseModal.vue')),
			size: 'sm',
			props: options,
		});
	}
}
