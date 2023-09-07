import { defineAsyncComponent } from 'vue';
import { Api } from '../../../_common/api/api.service';
import { FiresidePostModel } from '../../../_common/fireside/post/post-model';
import { showModal } from '../../../_common/modal/modal.service';
import { Screen } from '../../../_common/screen/screen-service';
import { SettingBroadcastModal } from '../../../_common/settings/settings.service';
import { commonStore } from '../../../_common/store/common-store';

const STORAGE_KEY_PREFIX = 'broadcast-modal:date:';

function _key() {
	return STORAGE_KEY_PREFIX + commonStore.user.value!.id;
}

async function _show(posts: FiresidePostModel[]) {
	await showModal({
		modalId: 'Broadcast',
		component: defineAsyncComponent(() => import('./AppBroadcastModal.vue')),
		props: { posts },
		noBackdropClose: true,
	});
}

export async function checkBroadcastModal() {
	const { user } = commonStore;
	if (!user.value || !SettingBroadcastModal.get() || import.meta.env.SSR || Screen.isXs) {
		return;
	}

	const localStorage = window.localStorage as any;
	if (!localStorage[_key()]) {
		localStorage[_key()] = Date.now();
	}

	const payload = await Api.sendRequest(
		'/web/broadcasts?from=' + localStorage[_key()],
		undefined,
		{ detach: true }
	);

	if (payload.broadcasts.length) {
		const posts = FiresidePostModel.populate(payload.broadcasts);
		_show(posts);
	}

	localStorage[_key()] = Date.now();
}
