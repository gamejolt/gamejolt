<script lang="ts" setup>
import { onMounted, provide, reactive, watch } from 'vue';
import { RouterView } from 'vue-router';

import { useGridStore } from '~app/components/grid/grid-store';
import AppShell from '~app/components/shell/AppShell.vue';
import { useAppStore } from '~app/store';
import { createAdStore } from '~common/ad/ad-store';
import { CommentStoreManager, CommentStoreManagerKey } from '~common/comment/comment-store';
import AppErrorPage from '~common/error/page/AppErrorPage.vue';
import { createAppPromotionStore } from '~common/mobile-app/store';
import Onboarding from '~common/onboarding/onboarding.service';
import { Payload } from '~common/payload/payload-service';
import handlePayloadTargetingTags from '~common/payload/payload-targeting-tags';
import AppCommonShell from '~common/shell/AppCommonShell.vue';
import { useCommonStore } from '~common/store/common-store';
import { loadCurrentLanguage } from '~common/translate/translate.service';

const appStore = useAppStore();
const { bootstrap, loadNotificationState, clear, clearNotificationState } = appStore;
const { user } = useCommonStore();
const { loadGrid, clearGrid } = useGridStore();

const adStore = createAdStore();
Payload.addPayloadHandler(payload => handlePayloadTargetingTags({ adStore }, payload));

createAppPromotionStore();
provide(CommentStoreManagerKey, reactive(new CommentStoreManager()));

if (!import.meta.env.SSR) {
	performance.measure('gj-shell-init', 'gj-start');

	// We allow users to access the onboarding flow even after they've gone
	// through onboarding.
	//
	// In case they did that, or didn't fully complete their onboarding, clear
	// out their onboarding-start timestamp now so they're no longer considered
	// to be onboarding.
	//
	// NOTE: This can't be done for SSR. It also can't be done within
	// [onMounted], otherwise it gets called after [Onboarding] sets the new
	// token.
	Onboarding.clearOnboardingStartTimestamp();
}

onMounted(() => {
	// Let it finish doing all the initial rendering junk and track after
	// that.
	setTimeout(() => {
		performance.measure('gj-shell-mounted', 'gj-start');
	});

	loadCurrentLanguage();
});

// When the user changes, we need to change our global app state.
watch(
	() => user.value?.id,
	userId => {
		const isLoggedIn = !!userId;

		if (isLoggedIn) {
			bootstrap();

			if (!import.meta.env.SSR) {
				loadGrid();
				loadNotificationState();
			}

			if (GJ_IS_DESKTOP_APP) {
				// clientLibrary.bootstrap();
			}
		} else {
			clear();
			clearGrid();
			clearNotificationState();
		}
	},
	{ immediate: true }
);
</script>

<template>
	<AppCommonShell>
		<AppShell>
			<div id="content">
				<AppErrorPage>
					<RouterView />
				</AppErrorPage>
			</div>
		</AppShell>
	</AppCommonShell>
</template>
