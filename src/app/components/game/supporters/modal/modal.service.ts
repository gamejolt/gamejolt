import { defineAsyncComponent } from 'vue';
import { Game } from '../../../../../_common/game/game.model';
import { Modal } from '../../../../../_common/modal/modal.service';
import { User } from '../../../../../_common/user/user.model';

interface GameSupportersModalOptions {
	game: Game;
	supporters: User[];
	supporterCount: number;
}

export class GameSupportersModal {
	static async show(options: GameSupportersModalOptions) {
		const { game, supporters, supporterCount } = options;
		return await Modal.show<void>({
			modalId: 'GameSupporters',
			component: defineAsyncComponent(
				() => import(/* webpackChunkName: "GameSupportersModal" */ './modal.vue')
			),
			props: {
				game,
				supporters,
				supporterCount,
			},
			size: 'sm',
		});
	}
}
