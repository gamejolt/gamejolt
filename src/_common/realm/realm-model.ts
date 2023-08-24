import { RouteLocationDefinition } from '../../utils/router';
import { RealmFollowSource, trackRealmFollow } from '../analytics/analytics.service';
import { Api } from '../api/api.service';
import { showErrorGrowl } from '../growls/growls.service';
import { MediaItemModel } from '../media-item/media-item-model';
import { showModalConfirm } from '../modal/confirm/confirm-service';
import { Model } from '../model/model.service';
import { $gettext } from '../translate/translate.service';

export class RealmModel extends Model {
	declare name: string;
	declare path: string;
	declare added_on: number;

	declare cover: MediaItemModel;

	declare is_following: boolean;
	declare follower_count: number;
	declare can_moderate: boolean;

	constructor(data: any = {}) {
		super(data);

		if (data.cover) {
			this.cover = new MediaItemModel(data.cover);
		}
	}

	get routeLocation(): RouteLocationDefinition {
		return {
			name: 'realms.view.overview',
			params: {
				path: this.path,
			},
		};
	}
}

export async function followRealm(realm: RealmModel) {
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

export async function unfollowRealm(realm: RealmModel) {
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

export async function toggleRealmFollow(realm: RealmModel, source: RealmFollowSource) {
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
			const result = await showModalConfirm(
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
