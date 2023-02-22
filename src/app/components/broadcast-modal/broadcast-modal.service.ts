import { defineAsyncComponent } from 'vue';
import { Api } from '../../../_common/api/api.service';
import { FiresidePost } from '../../../_common/fireside/post/post-model';
import { showModal } from '../../../_common/modal/modal.service';
import { Screen } from '../../../_common/screen/screen-service';
import { SettingBroadcastModal } from '../../../_common/settings/settings.service';
import { commonStore } from '../../../_common/store/common-store';

const STORAGE_KEY_PREFIX = 'broadcast-modal:date:';

export class BroadcastModal {
	private static _key() {
		return STORAGE_KEY_PREFIX + commonStore.user.value!.id;
	}

	static async check() {
		const { user } = commonStore;
		if (!user.value || !SettingBroadcastModal.get() || import.meta.env.SSR || Screen.isXs) {
			return;
		}

		const localStorage = window.localStorage as any;
		if (!localStorage[this._key()]) {
			localStorage[this._key()] = Date.now();
		}

		const payload = await Api.sendRequest(
			'/web/broadcasts?from=' + localStorage[this._key()],
			undefined,
			{ detach: true }
		);

		if (payload.broadcasts.length) {
			const posts = FiresidePost.populate(payload.broadcasts);
			this.show(posts);
		}

		localStorage[this._key()] = Date.now();
	}

	private static async show(posts: FiresidePost[]) {
		await showModal({
			modalId: 'Broadcast',
			component: defineAsyncComponent(() => import('./AppBroadcastModal.vue')),
			props: { posts },
			noBackdropClose: true,
		});
	}
}
