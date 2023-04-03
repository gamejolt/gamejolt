import { Api } from '../../../../_common/api/api.service';
import { GamePlaylist } from '../../../../_common/game-playlist/game-playlist.model';
import { Model } from '../../../../_common/model/model.service';
import { commonStore } from '../../../../_common/store/common-store';
import { User } from '../../../../_common/user/user.model';

export class GameCollection extends Model {
	static readonly TYPE_FOLLOWED = 'followed';
	static readonly TYPE_DEVELOPER = 'developer';
	static readonly TYPE_OWNED = 'owned';
	static readonly TYPE_RECOMMENDED = 'recommended';
	static readonly TYPE_PLAYLIST = 'playlist';
	static readonly TYPE_BUNDLE = 'bundle';

	static readonly USER_TYPES = [
		GameCollection.TYPE_FOLLOWED,
		GameCollection.TYPE_DEVELOPER,
		GameCollection.TYPE_OWNED,
		GameCollection.TYPE_RECOMMENDED,
	];

	_id?: string;
	type!: string;
	name!: string;
	slug!: string;
	img_thumbnail!: string;
	from_subscription!: boolean;
	owner?: User;
	playlist?: GamePlaylist;

	constructor(data: any = {}) {
		super(data);

		// This is a fake ID that can be used in track by's and what not.
		if (data.id && data.type) {
			this._id = data.type + '-' + data.id;
		}

		if (data.owner) {
			this.owner = new User(data.owner);
		}

		if (data.playlist) {
			this.playlist = new GamePlaylist(data.playlist);
		}
	}

	get routeLocation() {
		let id = '' + this.id;
		if (id[0] === '@') {
			id = id.substring(1);
		}

		return {
			name: 'library.collection.' + this.type,
			params: {
				slug: this.slug,
				id,
			},
		};
	}

	get isOwner() {
		const { user } = commonStore;
		return !!(user.value && this.owner && user.value.id === this.owner.id);
	}

	getTitle() {
		let title = this.name;
		if (this.from_subscription && this.owner) {
			title += ' - @' + this.owner.username;
		}
		return title;
	}

	$follow() {
		return Api.sendRequest('/web/library/follow/' + this.type, {
			id: this.id,
			timestamp: Date.now(),
		});
	}

	$unfollow() {
		return Api.sendRequest('/web/library/unfollow/' + this.type, {
			id: this.id,
			timestamp: Date.now(),
		});
	}
}

Model.create(GameCollection);
