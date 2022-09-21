import { RouteLocationDefinition } from '../../utils/router';
import { Api } from '../api/api.service';
import { MediaItem } from '../media-item/media-item-model';
import { Model } from '../model/model.service';

export class Realm extends Model {
	constructor(data: any = {}) {
		super(data);

		if (data.cover) {
			this.cover = new MediaItem(data.cover);
		}
	}

	declare name: string;
	declare path: string;
	declare added_on: number;

	declare cover: MediaItem;

	declare is_following: boolean;
	declare follower_count: number;

	get routeLocation(): RouteLocationDefinition {
		return {
			name: 'realms.view',
			params: {
				path: this.path,
			},
		};
	}
}

Model.create(Realm);

export async function followRealm(realm: Realm) {
	realm.is_following = true;
	++realm.follower_count;

	try {
		const response = await Api.sendRequest(
			`/web/realms/follow/${realm.path}`,
			{},
			{ detach: true }
		);

		if (!response.success) {
			throw new Error(`Couldn't follow.`);
		}
	} catch (e) {
		realm.is_following = false;
		--realm.follower_count;
		throw e;
	}
}

export async function unfollowRealm(realm: Realm) {
	realm.is_following = false;
	--realm.follower_count;

	try {
		const response = await Api.sendRequest(
			`/web/realms/unfollow/${realm.path}`,
			{},
			{ detach: true }
		);

		if (!response.success) {
			throw new Error(`Couldn't unfollow.`);
		}
	} catch (e) {
		realm.is_following = true;
		++realm.follower_count;
		throw e;
	}
}
