<script lang="ts">
import { computed, defineAsyncComponent, markRaw, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Meta } from '../../meta/meta-service';
import AppSpacer from '../../spacer/AppSpacer.vue';
import { useCommonStore } from '../../store/common-store';
import errorImage from './ararat.png';

const errorPages = markRaw({
	400: defineAsyncComponent(() => import('./AppErrorPage400.vue')),
	403: defineAsyncComponent(() => import('./AppErrorPage403.vue')),
	404: defineAsyncComponent(() => import('./AppErrorPage404.vue')),
	500: defineAsyncComponent(() => import('./AppErrorPage500.vue')),
	offline: defineAsyncComponent(() => import('./AppErrorPageOffline.vue')),
});
</script>

<script lang="ts" setup>
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
		<section v-if="error && page" class="container error-page" :style="{ textAlign: `center` }">
			<div :style="{ marginTop: `-190px` }">
				<img
					:style="{
						display: `block`,
						margin: `0 auto`,
					}"
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
