import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { Modal } from 'game-jolt-frontend-lib/components/modal/modal.service';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import { asyncComponentLoader } from 'game-jolt-frontend-lib/utils/utils';

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
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "GameSupportersModal" */ './modal')
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
