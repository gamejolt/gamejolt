import { RouteLocationDefinition } from '../../utils/router';
import { RealmFollowSource, trackRealmFollow } from '../analytics/analytics.service';
import { Api } from '../api/api.service';
import { showErrorGrowl } from '../growls/growls.service';
import { MediaItem } from '../media-item/media-item-model';
import { ModalConfirm } from '../modal/confirm/confirm-service';
import { Model } from '../model/model.service';
import { $gettext } from '../translate/translate.service';

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

export async function toggleRealmFollow(realm: Realm, source: RealmFollowSource) {
	if (!realm.is_following) {
		try {
			await followRealm(realm);
			trackRealmFollow(true, { source });
		} catch (e) {
			console.error(e);
			showErrorGrowl($gettext(`Failed to follow realm.`));
			trackRealmFollow(true, { failed: true, source });
		}
	} else {
		try {
			const result = await ModalConfirm.show(
				$gettext(`Are you sure you want to unfollow this realm?`),
				$gettext(`Unfollow realm?`)
			);

			if (result) {
				await unfollowRealm(realm);
				trackRealmFollow(false, { source });
			}
		} catch (e) {
			showErrorGrowl($gettext(`Error while trying to unfollow realm.`));
			trackRealmFollow(false, { failed: true, source });
		}
	}
}
