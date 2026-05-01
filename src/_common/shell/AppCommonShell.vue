<script lang="ts" setup>
import { defineAsyncComponent } from 'vue';

import AppGrowls from '~common/growls/AppGrowls.vue';
import AppScrollInviewParent from '~common/scroll/inview/AppScrollInviewParent.vue';
import AppTheme from '~common/theme/AppTheme.vue';

defineOptions({
	inheritAttrs: false,
});

const AppLoadingBar = defineAsyncComponent(() => import('~common/loading/AppLoadingBar.vue'));
const AppBackdropPortal = defineAsyncComponent(
	() => import('~common/backdrop/AppBackdropPortal.vue')
);
const AppLightboxPortal = defineAsyncComponent(
	() => import('~common/lightbox/AppLightboxPortal.vue')
);
const AppModalPortal = defineAsyncComponent(() => import('~common/modal/AppModalPortal.vue'));
const AppTooltipPortal = defineAsyncComponent(() => import('~common/tooltip/AppTooltipPortal.vue'));
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
				<AppModalPortal />
			</AppScrollInviewParent>
		</div>
	</AppTheme>
</template>
