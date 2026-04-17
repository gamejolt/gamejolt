<script lang="ts">
import { defineAsyncComponent } from 'vue';

import AppGrowls from '~common/growls/AppGrowls.vue';
import AppScrollInviewParent from '~common/scroll/inview/AppScrollInviewParent.vue';
import AppTheme from '~common/theme/AppTheme.vue';
export default {
	inheritAttrs: false,
};
</script>

<script lang="ts" setup>
const AppLoadingBar = defineAsyncComponent(() => import('~common/loading/AppLoadingBar.vue'));
const AppBackdropPortal = defineAsyncComponent(
	() => import('~common/backdrop/AppBackdropPortal.vue')
);
const AppLightboxPortal = defineAsyncComponent(
	() => import('~common/lightbox/AppLightboxPortal.vue')
);
const AppModalPortal = defineAsyncComponent(() => import('~common/modal/AppModalPortal.vue'));
const AppTooltipPortal = defineAsyncComponent(() => import('~common/tooltip/AppTooltipPortal.vue'));
const AppShellNotice = defineAsyncComponent(
	() => import('~common/shell/notice/AppShellNotice.vue')
);
</script>

<template>
	<AppTheme is-root>
		<AppLightboxPortal />
		<AppTooltipPortal />
		<AppBackdropPortal />

		<div v-bind="$attrs">
			<AppScrollInviewParent>
				<slot />

				<AppLoadingBar />
				<AppGrowls />
				<AppShellNotice />
				<AppModalPortal />
			</AppScrollInviewParent>
		</div>
	</AppTheme>
</template>
