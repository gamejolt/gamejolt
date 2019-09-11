import { Api } from '../../../_common/api/api.service';
import { FiresidePost } from '../../../_common/fireside/post/post-model';
import { Modal } from '../../../_common/modal/modal.service';
import { Screen } from '../../../_common/screen/screen-service';
import { asyncComponentLoader } from '../../../utils/utils';
import { appStore } from '../../../_common/store/app-store';
import { Settings } from '../../../_common/settings/settings.service';

const STORAGE_KEY_PREFIX = 'broadcast-modal:date:';

export class BroadcastModal {
	private static _key() {
		return STORAGE_KEY_PREFIX + appStore.state.user!.id;
	}

	static async check() {
		const user = appStore.state.user;
		if (!user || !Settings.get('broadcast-modal') || GJ_IS_SSR || Screen.isXs) {
			return;
		}

		const localStorage = window.localStorage as any;
		if (!localStorage[this._key()]) {
			if (user.created_on < 1483566930963) {
				// Bootstrap it from when this feature was launched.
				// Will try pulling articles since June 1st, 2016.
				localStorage[this._key()] = 1464739200000;
			} else {
				localStorage[this._key()] = Date.now();
			}
		}

		const payload = await Api.sendRequest(
			'/web/broadcasts',
			{
				from: localStorage[this._key()],
			},
			{ detach: true }
		);

		if (payload.broadcasts.length) {
			const posts = FiresidePost.populate(payload.broadcasts);
			this.show(posts);
		}

		localStorage[this._key()] = Date.now();
	}

	private static async show(posts: FiresidePost[]) {
		await Modal.show({
			modalId: 'Broadcast',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "BroadcastModal" */ './broadcast-modal.vue')
				),
			props: { posts },
			noBackdropClose: true,
		});
	}
}
