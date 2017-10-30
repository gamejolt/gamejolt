import { Modal } from '../../../../../../lib/gj-lib-client/components/modal/modal.service';
import { asyncComponentLoader } from '../../../../../../lib/gj-lib-client/utils/utils';
import { Halloween2017MonsterBreakdown } from '../../../../../../lib/gj-lib-client/components/user/user.model';

export class ShellHalloweenMonsterModal {
	static async show(
		avatar: string,
		userBreakdown: Halloween2017MonsterBreakdown,
		globalBreakdown: Halloween2017MonsterBreakdown,
		pun: string,
		mood: string
	) {
		return await Modal.show<void>({
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "ShellHalloweenMonsterModal" */ './modal')
				),
			size: 'lg',
			props: { avatar, userBreakdown, globalBreakdown, pun, mood },
		});
	}
}
