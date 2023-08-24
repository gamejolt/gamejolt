import { defineAsyncComponent } from 'vue';
import { GameModel } from '../../../../../_common/game/game.model';
import { showModal } from '../../../../../_common/modal/modal.service';

export class GameDevStageSelectorConfirmModal {
	static async show(game: GameModel, stage: number) {
		return await showModal<boolean>({
			modalId: 'GameDevStageSelectorConfirm-' + game.id,
			component: defineAsyncComponent(() => import('./confirm.vue')),
			props: { game, stage },
			size: 'sm',
		});
	}
}
