<script lang="ts">
export default {
	inheritAttrs: false,
};
</script>

<script lang="ts" setup>
import AppBackdropPortal from '../backdrop/AppBackdropPortal.vue';
import AppGrowls from '../growls/AppGrowls.vue';
import AppLightboxPortal from '../lightbox/AppLightboxPortal.vue';
import AppLoadingBar from '../loading/bar/bar.vue';
import AppModals from '../modal/AppModals.vue';
import AppScrollInviewParent from '../scroll/inview/AppScrollInviewParent.vue';
import AppTheme from '../theme/AppTheme.vue';
import AppTooltipPortal from '../tooltip/AppTooltipPortal.vue';
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
			<AppModals />
		</AppScrollInviewParent>
	</div>
</template>
