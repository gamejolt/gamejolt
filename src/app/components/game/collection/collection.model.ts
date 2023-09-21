import { Api } from '../../../../_common/api/api.service';
import { GamePlaylistModel } from '../../../../_common/game-playlist/game-playlist.model';
import { Model } from '../../../../_common/model/model.service';
import { commonStore } from '../../../../_common/store/common-store';
import { UserModel } from '../../../../_common/user/user.model';

export const enum GameCollectionType {
	Followed = 'followed',
	Developer = 'developer',
	Owned = 'owned',
	Recommended = 'recommended',
	Playlist = 'playlist',
	Bundle = 'bundle',
}

export const GameCollectionUserTypes = [
	GameCollectionType.Followed,
	GameCollectionType.Developer,
	GameCollectionType.Owned,
	GameCollectionType.Recommended,
];

export class GameCollectionModel extends Model {
	declare _id?: string;
	declare type: GameCollectionType;
	declare name: string;
	declare slug: string;
	declare img_thumbnail: string;
	declare from_subscription: boolean;
	declare owner?: UserModel;
	declare playlist?: GamePlaylistModel;

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
}

export function $followGameCollection(model: GameCollectionModel) {
	return Api.sendRequest('/web/library/follow/' + model.type, {
		id: model.id,
		timestamp: Date.now(),
	});
}

export function $unfollowGameCollection(model: GameCollectionModel) {
	return Api.sendRequest('/web/library/unfollow/' + model.type, {
		id: model.id,
		timestamp: Date.now(),
	});
}
