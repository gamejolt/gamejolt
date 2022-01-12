<script lang="ts">
export default defineComponent({
	inheritAttrs: false,
});
</script>

<script lang="ts" setup>
import { defineComponent } from 'vue';
import AppBackdropPortal from '../backdrop/backdrop-portal.vue';
import AppGrowls from '../growls/growls.vue';
import AppLightboxPortal from '../lightbox/lightbox-portal.vue';
import AppLoadingBar from '../loading/bar/bar.vue';
import AppModals from '../modal/AppModals.vue';
import AppScrollInviewParent from '../scroll/inview/parent.vue';
import { AppTheme } from '../theme/theme';
import AppTooltipPortal from '../tooltip/tooltip-portal.vue';
</script>

<template>
	<app-lightbox-portal />
	<app-tooltip-portal />
	<app-backdrop-portal />

	<app-scroll-inview-parent v-bind="$attrs">
		<slot />

		<app-theme />
		<app-loading-bar />
		<app-growls />
		<app-modals />
	</app-scroll-inview-parent>
</template>
