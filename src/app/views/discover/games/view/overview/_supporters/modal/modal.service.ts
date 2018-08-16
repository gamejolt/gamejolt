import { User } from '../../../../../../../../lib/gj-lib-client/components/user/user.model';
import { Modal } from '../../../../../../../../lib/gj-lib-client/components/modal/modal.service';
import { asyncComponentLoader } from '../../../../../../../../lib/gj-lib-client/utils/utils';

interface GameSupportersModalOptions {
	supporters: User[];
	supporterCount: number;
}

export class GameSupportersModal {
	static async show(options: GameSupportersModalOptions) {
		const { supporters, supporterCount } = options;
		return await Modal.show<void>({
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "GameSupportersModal" */ './modal')
				),
			props: {
				supporters,
				supporterCount,
			},
			size: 'sm',
		});
	}
}
