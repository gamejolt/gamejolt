import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../modal/modal.service';
import { User } from '../../../user/user.model';
import { GameBuild } from '../../build/build.model';
import { Game } from '../../game.model';
import { GamePackage } from '../package.model';

interface GamePackagePurchaseModalOptions {
	game: Game;
	package: GamePackage;
	build: GameBuild | null;
	fromExtraSection: boolean;

	partnerKey?: string;
	partner?: User;
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
