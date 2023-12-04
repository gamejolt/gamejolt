import { defineAsyncComponent } from 'vue';
import { GameModel } from '../../../../../_common/game/game.model';
import { showModal } from '../../../../../_common/modal/modal.service';

export async function showGameDevStageSelectorConfirmModal(game: GameModel, stage: number) {
	return await showModal<boolean>({
		modalId: 'GameDevStageSelectorConfirm-' + game.id,
		component: defineAsyncComponent(() => import('./confirm.vue')),
		props: { game, stage },
		size: 'sm',
	});
}
