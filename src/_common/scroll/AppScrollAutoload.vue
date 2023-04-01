<script lang="ts" setup>
import { nextTick, onMounted, onUnmounted, PropType, ref, toRefs, watch } from 'vue';
import { queuedThrottle } from '../../utils/utils';
import AppLoading from '../loading/AppLoading.vue';
import AppScrollInview, { ScrollInviewConfig } from './inview/AppScrollInview.vue';

const InviewConfig = new ScrollInviewConfig({
	emitsOn: 'partial-overlap',
	margin: '0px 0px 300px 0px',
});

const props = defineProps({
	loadMore: {
		type: Function as PropType<() => Promise<void>>,
		required: true,
	},
	canLoadMore: {
		type: Boolean,
		required: true,
	},
	immediate: {
		type: Boolean,
	},
});

const { loadMore, canLoadMore, immediate } = toRefs(props);

const isLoadingMore = ref(false);
const mounted = ref(false);
const inview = ref(false);

const queue = queuedThrottle(1_000);

watch([mounted, inview, canLoadMore], values => {
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
	if (!mounted.value || !canLoadMore.value) {
		return;
	}

	await loadMore.value().catch(e => console.error(e));
}

async function loadOrQueue() {
	if (!mounted.value || !canLoadMore.value || isLoadingMore.value) {
		return;
	}

	isLoadingMore.value = true;
	if (immediate.value) {
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
