import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';

export class LocalDbGame
{
	id: number;

	title: string;
	slug: string;
	img_thumbnail: string;
	// header_media_item?: MediaItem;
	compatibility: any;
	modified_on: number;

	developer: {
		id: number;
		username: string;
		name: string;
		display_name: string;
		slug: string;
		img_avatar: string;
	};

	static fromGame( game: Game )
	{
		const localGame = new LocalDbGame();

		localGame.id = game.id;
		localGame.title = game.title;
		localGame.slug = game.slug;
		localGame.img_thumbnail = game.img_thumbnail;
		localGame.compatibility = game.compatibility;
		localGame.modified_on = game.modified_on;

		const dev = game.developer;
		localGame.developer = {
			id: dev.id,
			username: dev.username,
			name: dev.name,
			display_name: dev.display_name,
			slug: dev.slug,
			img_avatar: dev.img_avatar,
		};

		return localGame;
	}
}
