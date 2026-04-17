import { defineAsyncComponent } from 'vue';

import { CommunityModel } from '~common/community/community.model';
import { GameModel } from '~common/game/game.model';
import { showModal } from '~common/modal/modal.service';

export async function showCommunityLinkGameModal(community: CommunityModel) {
	return await showModal<GameModel>({
		modalId: 'CommunityLinkGame',
		component: defineAsyncComponent(
			() => import('~app/components/community/link-game-modal/AppCommunityLinkGameModal.vue')
		),
		props: { community },
		size: 'sm',
	});
}
