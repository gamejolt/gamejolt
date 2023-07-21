<script lang="ts">
export default {
	inheritAttrs: false,
};
</script>

<script lang="ts" setup>
import { defineAsyncComponent } from 'vue';
import AppGrowls from '../growls/AppGrowls.vue';
import AppScrollInviewParent from '../scroll/inview/AppScrollInviewParent.vue';
import AppTheme from '../theme/AppTheme.vue';

const AppLoadingBar = defineAsyncComponent(() => import('../loading/AppLoadingBar.vue'));
const AppBackdropPortal = defineAsyncComponent(() => import('../backdrop/AppBackdropPortal.vue'));
const AppLightboxPortal = defineAsyncComponent(() => import('../lightbox/AppLightboxPortal.vue'));
const AppModalPortal = defineAsyncComponent(() => import('../modal/AppModalPortal.vue'));
const AppTooltipPortal = defineAsyncComponent(() => import('../tooltip/AppTooltipPortal.vue'));
const AppShellNotice = defineAsyncComponent(() => import('./notice/AppShellNotice.vue'));
</script>

<template>
	<AppLightboxPortal />
	<AppTooltipPortal />
	<AppBackdropPortal />

	<div v-bind="$attrs">
		<AppScrollInviewParent>
			<slot />

			<AppTheme />
			<AppLoadingBar />
			<AppGrowls />
			<AppShellNotice />
			<AppModalPortal />
		</AppScrollInviewParent>
	</div>
</template>
