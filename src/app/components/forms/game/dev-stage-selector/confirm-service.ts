import { defineAsyncComponent } from 'vue';

import { GameModel } from '~common/game/game.model';
import { showModal } from '~common/modal/modal.service';

export async function showGameDevStageSelectorConfirmModal(game: GameModel, stage: number) {
	return await showModal<boolean>({
		modalId: 'GameDevStageSelectorConfirm-' + game.id,
		component: defineAsyncComponent(
			() =>
				import('~app/components/forms/game/dev-stage-selector/FormGameDevStageConfirm.vue')
		),
		props: { game, stage },
		size: 'sm',
	});
}
