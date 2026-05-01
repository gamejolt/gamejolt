import { defineAsyncComponent } from 'vue';

import { Api } from '~common/api/api.service';
import { FiresidePostModel } from '~common/fireside/post/post-model';
import { showModal } from '~common/modal/modal.service';
import { Screen } from '~common/screen/screen-service';
import { SettingBroadcastModal } from '~common/settings/settings.service';
import { getCommonStore } from '~common/store/common-store';

const STORAGE_KEY_PREFIX = 'broadcast-modal:date:';

function _key() {
	return STORAGE_KEY_PREFIX + getCommonStore().user.value!.id;
}

async function _show(posts: FiresidePostModel[]) {
	await showModal({
		modalId: 'Broadcast',
		component: defineAsyncComponent(
			() => import('~app/components/broadcast-modal/AppBroadcastModal.vue')
		),
		props: { posts },
		noBackdropClose: true,
		size: 'sm',
	});
}

export async function checkBroadcastModal() {
	const { user } = getCommonStore();
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
