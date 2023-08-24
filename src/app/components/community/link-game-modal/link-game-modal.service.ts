import { defineAsyncComponent } from 'vue';
import { CommunityModel } from '../../../../_common/community/community.model';
import { GameModel } from '../../../../_common/game/game.model';
import { showModal } from '../../../../_common/modal/modal.service';

export class CommunityLinkGameModal {
	static async show(community: CommunityModel) {
		return await showModal<GameModel>({
			modalId: 'CommunityLinkGame',
			component: defineAsyncComponent(() => import('./link-game-modal.vue')),
			props: { community },
			size: 'sm',
		});
	}
}
