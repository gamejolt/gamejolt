import { defineAsyncComponent } from 'vue';
import { Community } from '../../../../_common/community/community.model';
import { Game } from '../../../../_common/game/game.model';
import { Modal } from '../../../../_common/modal/modal.service';

export class CommunityLinkGameModal {
	static async show(community: Community) {
		return await Modal.show<Game>({
			modalId: 'CommunityLinkGame',
			component: defineAsyncComponent(
				() =>
					import(/* webpackChunkName: "CommunityLinkGameModal" */ './link-game-modal.vue')
			),
			props: { community },
			size: 'sm',
		});
	}
}
