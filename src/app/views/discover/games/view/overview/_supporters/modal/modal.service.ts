import { User } from '../../../../../../../../lib/gj-lib-client/components/user/user.model';
import { Modal } from '../../../../../../../../lib/gj-lib-client/components/modal/modal.service';
import { asyncComponentLoader } from '../../../../../../../../lib/gj-lib-client/utils/utils';

interface SupportersModalOptions {
	supporters: User[];
	supporterCount: number;
}

export class SupportersModal {
	static async show(options: SupportersModalOptions) {
		const { supporters, supporterCount } = options;
		return await Modal.show<void>({
			component: () =>
				asyncComponentLoader(import(/* webpackChunkName: "SupportersModal" */ './modal')),
			props: {
				supporters,
				supporterCount,
			},
			size: 'sm',
		});
	}
}
