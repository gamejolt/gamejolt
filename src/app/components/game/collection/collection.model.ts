import { Api } from '../../../../_common/api/api.service';
import { GamePlaylistModel } from '../../../../_common/game-playlist/game-playlist.model';
import { Model } from '../../../../_common/model/model.service';
import { commonStore } from '../../../../_common/store/common-store';
import { UserModel } from '../../../../_common/user/user.model';

export class GameCollectionModel extends Model {
	static readonly TYPE_FOLLOWED = 'followed';
	static readonly TYPE_DEVELOPER = 'developer';
	static readonly TYPE_OWNED = 'owned';
	static readonly TYPE_RECOMMENDED = 'recommended';
	static readonly TYPE_PLAYLIST = 'playlist';
	static readonly TYPE_BUNDLE = 'bundle';

	static readonly USER_TYPES = [
		GameCollectionModel.TYPE_FOLLOWED,
		GameCollectionModel.TYPE_DEVELOPER,
		GameCollectionModel.TYPE_OWNED,
		GameCollectionModel.TYPE_RECOMMENDED,
	];

	_id?: string;
	type!: string;
	name!: string;
	slug!: string;
	img_thumbnail!: string;
	from_subscription!: boolean;
	owner?: UserModel;
	playlist?: GamePlaylistModel;

	constructor(data: any = {}) {
		super(data);

		// This is a fake ID that can be used in track by's and what not.
		if (data.id && data.type) {
			this._id = data.type + '-' + data.id;
		}

		if (data.owner) {
			this.owner = new UserModel(data.owner);
		}

		if (data.playlist) {
			this.playlist = new GamePlaylistModel(data.playlist);
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
