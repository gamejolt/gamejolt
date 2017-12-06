import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { LocalDbModel } from '../model.service';
import { MediaItem } from '../../../../../lib/gj-lib-client/components/media-item/media-item-model';

export class LocalDbGame extends LocalDbModel<LocalDbGame> {
	private static readonly CachedGames = new WeakMap<LocalDbGame, Game>();

	id = 0;

	title = '';
	slug = '';
	modified_on = 0;

	// Shouldn't this have fields/types?
	compatibility: any = null;

	header_media_item: MediaItem | null = null;
	thumbnail_media_item: MediaItem | null = null;

	developer = {
		id: 0,
		username: '',
		name: '',
		display_name: '',
		slug: '',
		img_avatar: '',
	};

	get _game() {
		let game = LocalDbGame.CachedGames.get(this);
		if (!game) {
			game = new Game(this);
			LocalDbGame.CachedGames.set(this, game);
		}

		return game;
	}

	hydrate() {
		if (this.header_media_item) {
			this.header_media_item = new MediaItem(this.header_media_item);
		}

		if (this.thumbnail_media_item) {
			this.thumbnail_media_item = new MediaItem(this.thumbnail_media_item);
		}
	}

	set(data: Partial<LocalDbGame>) {
		const updateData = Object.assign({}, this, data);

		this.id = updateData.id;
		this.title = updateData.title;
		this.slug = updateData.slug;
		this.compatibility = updateData.compatibility;
		this.modified_on = updateData.modified_on;

		this.developer.id = updateData.developer.id;
		this.developer.username = updateData.developer.username;
		this.developer.name = updateData.developer.name;
		this.developer.display_name = updateData.developer.display_name;
		this.developer.slug = updateData.developer.slug;
		this.developer.img_avatar = updateData.developer.img_avatar;

		// Copy full data for these.
		this.header_media_item = updateData.header_media_item;
		this.thumbnail_media_item = updateData.thumbnail_media_item;

		if (this.header_media_item && !(this.header_media_item instanceof MediaItem)) {
			this.header_media_item = new MediaItem(updateData.header_media_item);
		}

		if (this.thumbnail_media_item && !(this.thumbnail_media_item instanceof MediaItem)) {
			this.thumbnail_media_item = new MediaItem(updateData.thumbnail_media_item);
		}
	}
}
