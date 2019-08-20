import { asyncComponentLoader } from '../../../../utils/utils';
import { Modal } from '../../../modal/modal.service';
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
		return await Modal.show<void>({
			modalId: 'GamePackagePurchase',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "GamePackagePurchaseModal" */ './purchase-modal.vue')
				),
			size: 'sm',
			props: options,
		});
	}
}
