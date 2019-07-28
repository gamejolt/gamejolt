import { Modal } from 'game-jolt-frontend-lib/components/modal/modal.service';
import { UserBaseTrophy } from 'game-jolt-frontend-lib/components/user/trophy/user-base-trophy.model';
import { asyncComponentLoader } from 'game-jolt-frontend-lib/utils/utils';

export class TrophyModal {
	static async show(userTrophy: UserBaseTrophy) {
		return await Modal.show<void>({
			modalId: 'Trophy',
			component: () =>
				asyncComponentLoader(import(/* webpackChunkName: "TrophyModal" */ './modal.vue')),
			props: {
				userTrophy,
			},
			size: 'sm',
		});
	}
}
