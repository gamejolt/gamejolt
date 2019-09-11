import { Api } from '../../../../_common/api/api.service';
import { GamePlaylist } from '../../../../_common/game-playlist/game-playlist.model';
import { Jam } from '../../../../_common/jam/jam.model';
import { Model } from '../../../../_common/model/model.service';
import { User } from '../../../../_common/user/user.model';
import { appStore } from '../../../../_common/store/app-store';

export class GameCollection extends Model {
	static readonly TYPE_FOLLOWED = 'followed';
	static readonly TYPE_DEVELOPER = 'developer';
	static readonly TYPE_OWNED = 'owned';
	static readonly TYPE_RECOMMENDED = 'recommended';
	static readonly TYPE_PLAYLIST = 'playlist';
	static readonly TYPE_BUNDLE = 'bundle';
	static readonly TYPE_JAM = 'jam';

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
	jam?: Jam;

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

		if (data.jam) {
			this.jam = new Jam(data.jam);
		}
	}

	get routeLocation() {
		return {
			name: this.getSref(),
			params: this.getSrefParams(),
		};
	}

	get isOwner() {
		const user = appStore.state.user;
		return !!(user && this.owner && user.id === this.owner.id);
	}

	getTitle() {
		let title = this.name;
		if (this.from_subscription && this.owner) {
			title += ' - @' + this.owner.username;
		}
		return title;
	}

	getSref(includeParams?: boolean) {
		let sref = 'library.collection.' + this.type;

		if (includeParams) {
			sref += '(' + JSON.stringify(this.getSrefParams()) + ')';
		}

		return sref;
	}

	getSrefParams() {
		let id = '' + this.id;
		if (id[0] === '@') {
			id = id.substring(1);
		}

		return {
			slug: this.slug,
			id: id,
		};
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
