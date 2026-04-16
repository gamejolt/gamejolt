<script lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

import { queuedThrottle } from '../../utils/utils';
import AppLoading from '../loading/AppLoading.vue';
import AppScrollInview, { ScrollInviewConfig } from './inview/AppScrollInview.vue';

const InviewConfig = new ScrollInviewConfig({
	emitsOn: 'partial-overlap',
	margin: '0px 0px 300px 0px',
});
</script>

<script lang="ts" setup>
type Props = {
	loadMore: () => Promise<void>;
	canLoadMore: boolean;
	immediate?: boolean;
};
const { loadMore, canLoadMore, immediate } = defineProps<Props>();

const isLoadingMore = ref(false);
const mounted = ref(false);
const inview = ref(false);

const queue = queuedThrottle(1_000);

watch([mounted, inview, () => canLoadMore], values => {
	if (values.every(i => i)) {
		loadOrQueue();
	}
});

onMounted(() => {
	mounted.value = true;
});

onUnmounted(() => {
	mounted.value = false;
});

function onInview() {
	inview.value = true;
}

function onOutview() {
	inview.value = false;
}

async function handleLoadMore() {
	if (!mounted.value || !canLoadMore) {
		return;
	}

	await loadMore().catch(e => console.error(e));
}

async function loadOrQueue() {
	if (!mounted.value || !canLoadMore || isLoadingMore.value) {
		return;
	}

	isLoadingMore.value = true;
	if (immediate) {
		await handleLoadMore();
	} else {
		await queue.call(handleLoadMore);
	}
	await nextTick();
	isLoadingMore.value = false;

	if (inview.value) {
		loadOrQueue();
	}
}
</script>

<template>
	<div>
		<AppScrollInview :config="InviewConfig" @inview="onInview" @outview="onOutview">
			<AppLoading
				v-if="isLoadingMore && canLoadMore"
				:style="{
					paddingTop: `12px`,
					paddingBottom: `12px`,
				}"
				centered
				stationary
				hide-label
			/>
		</AppScrollInview>
	</div>
</template>
