import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { ReturnTypeSetGameFieldsAndSave } from '../../../../store/client-library';
import { store } from '../../../../store/index';

export type DbField = {
	id: 'id';
	title: 'title';
	slug: 'slug';
	img_thumbnail: 'img_thumbnail';
	compatibility: 'compatibility';
	modified_on: 'modified_on';
	developer: 'developer';
};

export const DbFieldMapping: DbField = {
	id: 'id',
	title: 'title',
	slug: 'slug',
	img_thumbnail: 'img_thumbnail',
	compatibility: 'compatibility',
	modified_on: 'modified_on',
	developer: 'developer',
};

export type DbFieldTypes = { [key in keyof DbField]: LocalDbGame[DbField[key]] };

export class LocalDbGame {
	id = 0;

	title = '';
	slug = '';
	img_thumbnail = '';
	// header_media_item?: MediaItem;
	compatibility: any = null;
	modified_on = 0;

	developer = {
		id: 0,
		username: '',
		name: '',
		display_name: '',
		slug: '',
		img_avatar: '',
	};

	_game: Game;

	static fromGame(game: Game) {
		const localGame = new LocalDbGame();
		localGame.setData(game);

		// TODO(rewrite) check if reactivity is fucked up when fields on _game are modified
		localGame._game = new Game(game);

		return localGame;
	}

	setData(data: DbFieldTypes) {
		const dev = data.developer;
		this.setGameFields({
			id: data.id,
			title: data.title,
			slug: data.slug,
			img_thumbnail: data.img_thumbnail,
			// header_media_item
			compatibility: data.compatibility,
			modified_on: data.modified_on,

			developer: {
				id: dev.id,
				username: dev.username,
				name: dev.name,
				display_name: dev.display_name,
				slug: dev.slug,
				img_avatar: dev.img_avatar,
			},
		});
	}

	setDataAndSave(data: DbFieldTypes) {
		const dev = data.developer;
		return this.setGameFieldsAndSave({
			id: data.id,
			title: data.title,
			slug: data.slug,
			img_thumbnail: data.img_thumbnail,
			// header_media_item
			compatibility: data.compatibility,
			modified_on: data.modified_on,

			developer: {
				id: dev.id,
				username: dev.username,
				name: dev.name,
				display_name: dev.display_name,
				slug: dev.slug,
				img_avatar: dev.img_avatar,
			},
		});
	}

	private setGameFieldsAndSave(fields: Partial<DbFieldTypes>): ReturnTypeSetGameFieldsAndSave {
		return store.dispatch('clientLibrary/setGameFieldsAndSave', [this, fields]) as any;
	}

	private setGameFields(fields: Partial<DbFieldTypes>) {
		store.commit('clientLibrary/setGameFields', [this, fields]);
	}
}
