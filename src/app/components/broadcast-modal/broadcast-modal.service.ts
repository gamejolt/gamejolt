import { Modal } from '../../../lib/gj-lib-client/components/modal/modal.service';
import { appStore } from '../../../lib/gj-lib-client/vue/services/app/app-store';
import { Settings } from '../settings/settings.service';
import { Api } from '../../../lib/gj-lib-client/components/api/api.service';
import { FiresidePost } from '../../../lib/gj-lib-client/components/fireside/post/post-model';
import { asyncComponentLoader } from '../../../lib/gj-lib-client/utils/utils';

const STORAGE_KEY_PREFIX = 'broadcast-modal:date:';

export class BroadcastModal {
	private static _key() {
		return STORAGE_KEY_PREFIX + appStore.state.user!.id;
	}

	static async check() {
		const user = appStore.state.user;
		if (!user || !Settings.get('broadcast-modal')) {
			return;
		}

		// Bootstrap it from when this feature was launched.
		if (!window.localStorage[this._key()] && user.created_on < 1483566930963) {
			// Will try pulling articles since June 1st, 2016.
			window.localStorage[this._key()] = 1464739200000;
		}

		const payload = await Api.sendRequest('/web/broadcasts', {
			from: window.localStorage[this._key()],
		});

		if (payload.broadcasts.length) {
			const posts = FiresidePost.populate(payload.broadcasts);
			this.show(posts);
		}

		window.localStorage[this._key()] = Date.now();
	}

	private static async show(posts: FiresidePost[]) {
		await Modal.show({
			component: () => asyncComponentLoader(import('./broadcast-modal')),
			props: { posts },
			noBackdropClose: true,
		});
	}
}
