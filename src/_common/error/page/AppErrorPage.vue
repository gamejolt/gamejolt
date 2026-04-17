<script lang="ts" setup>
import { computed, defineAsyncComponent, markRaw, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';

import errorImage from '~common/error/page/ararat.png';
import { Meta } from '~common/meta/meta-service';
import AppSpacer from '~common/spacer/AppSpacer.vue';
import { useCommonStore } from '~common/store/common-store';

const errorPages = markRaw({
	400: defineAsyncComponent(() => import('~common/error/page/AppErrorPage400.vue')),
	403: defineAsyncComponent(() => import('~common/error/page/AppErrorPage403.vue')),
	404: defineAsyncComponent(() => import('~common/error/page/AppErrorPage404.vue')),
	500: defineAsyncComponent(() => import('~common/error/page/AppErrorPage500.vue')),
	offline: defineAsyncComponent(() => import('~common/error/page/AppErrorPageOffline.vue')),
});

const { error, clearError } = useCommonStore();
const router = useRouter();

let watcher: (() => void) | undefined;

const page = computed(() => {
	if (error.value) {
		return errorPages[error.value as keyof typeof errorPages];
	}
});

// Payload sets this error value if there was a payload error. We want to
// deindex any page that shows an error. When they click to go to a new page,
// the Meta gets cleared out, and this deindex will go away. We don't need to
// clean it up ourselves, basically, since it gets cleared on each new route.
watch(error, () => {
	if (error.value) {
		Meta.seo.deindex();
	}
});

onMounted(() => {
	// We want to do it AFTER the route resolves for the next route we are going to.
	watcher = router.afterEach(() => {
		if (error.value) {
			clearError();
		}
	});
});

onUnmounted(() => {
	watcher?.();
	watcher = undefined;
});
</script>

<template>
	<div>
		<section v-if="error && page" class="gj-container error-page text-center">
			<div class="mt-[-190px]">
				<img
					class="mx-auto block"
					:src="errorImage"
					:width="416 / 2"
					:height="760 / 2"
					alt=""
				/>
			</div>
			<AppSpacer vertical :scale="4" />

			<component :is="page" />

			<br />
		</section>
		<template v-else>
			<slot />
		</template>
	</div>
</template>
