import { asyncComponentLoader } from '../../../../../../utils/utils';
import { Modal } from '../../../../../../_common/modal/modal.service';
import { Halloween2019MonsterBreakdown } from '../../../../../../_common/user/user.model';

export class ShellHalloweenMonsterModal {
	static async show(
		avatar: string,
		userBreakdown: Halloween2019MonsterBreakdown,
		globalBreakdown: Halloween2019MonsterBreakdown,
		pun: string,
		mood: string
	) {
		return await Modal.show<void>({
			modalId: 'HalloweenMonster',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "ShellHalloweenMonsterModal" */ './modal.vue')
				),
			size: 'lg',
			props: { avatar, userBreakdown, globalBreakdown, pun, mood },
		});
	}
}
