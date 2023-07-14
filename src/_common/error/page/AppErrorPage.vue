<script lang="ts">
import { computed, defineAsyncComponent, markRaw, onMounted, onUnmounted } from 'vue';
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

onMounted(() => {
	// We want to do it AFTER the route resolves for the next route we are going to.
	watcher = router.afterEach(() => {
		if (error.value) {
			clearError();
		}
	});

	// We don't want to index error pages.
	Meta.seo.deindex();
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
