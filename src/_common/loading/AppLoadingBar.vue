<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { styleChangeBg } from '../../_styles/mixins';
import { kLayerLoadingBar, kStrongEaseOut } from '../../_styles/variables';
import { Api } from '../api/api.service';

/**
 * How long to wait after a request has started before showing the loading bar.
 */
const ShowDelay = 500;

/**
 * How long to wait before hiding the bar again after it has been visible. We
 * delay this so that it doesn't flash really fast.
 */
const HideDelay = 200;

const routeChanging = ref(false);
const requestCount = ref(0);
const completedCount = ref(0);
const shouldShow = ref(false);

let showTimeout: NodeJS.Timer | undefined;
let hideTimeout: NodeJS.Timer | undefined;

// TODO: This will apparently break gameserver. Figure out a better way.
const router = useRouter();

const width = computed(() => {
	if (!requestCount.value) {
		return 0;
	}
	return (completedCount.value / requestCount.value) * 100;
});

const apiRequestCount = computed(() => Api.loadingBarRequests.value);

onMounted(() => {
	// NOTICE: Router may not be available on all sections (like gameserver).

	// We hook into router so that we can show loading bar while the async
	// component chunks are being loaded by webpack.
	router?.beforeEach((_to, _from, next) => {
		// If we hit before each while in the middle of a route change, it
		// means that the previous one never resolved, so we should mark a
		// request as having been completed first.
		if (routeChanging.value) {
			addComplete();
		}

		routeChanging.value = true;
		addRequest();
		next();
	});

	router?.beforeResolve((_to, _from, next) => {
		routeChanging.value = false;
		addComplete();
		next();
	});
});

function addRequest() {
	// If we had a clear set, then let's cancel that out.

	if (hideTimeout) {
		clearTimeout(hideTimeout);
		hideTimeout = undefined;
	}

	if (!showTimeout) {
		show();
	}

	++requestCount.value;
}

function addComplete() {
	++completedCount.value;
	if (completedCount.value >= requestCount.value) {
		clear();
	}
}

function show() {
	showTimeout = setTimeout(() => {
		shouldShow.value = true;
	}, ShowDelay);
}

function clear() {
	if (showTimeout) {
		clearTimeout(showTimeout);
		showTimeout = undefined;
	}

	// Wait for the 100% width to show first.
	hideTimeout = setTimeout(() => {
		requestCount.value = 0;
		completedCount.value = 0;
		shouldShow.value = false;
	}, HideDelay);
}

watch(apiRequestCount, () => {
	if (apiRequestCount.value > requestCount.value) {
		addRequest();
	} else if (apiRequestCount.value < requestCount.value) {
		addComplete();
	}
	requestCount.value = apiRequestCount.value;
});
</script>

<template>
	<transition>
		<div
			v-if="width > 0 && shouldShow"
			class="loading-bar anim-fade-enter anim-fade-leave"
			:style="{
				position: `fixed`,
				top: 0,
				left: 0,
				right: 0,
				height: `3px`,
				pointerEvents: `none`,
				zIndex: kLayerLoadingBar,
			}"
		>
			<div
				class="loading-bar-bar"
				:style="{
					...styleChangeBg('highlight'),
					width: width + '%',
					height: `3px`,
					transition: `width 300ms ${kStrongEaseOut}`,
					willChange: `width`,
				}"
			/>
		</div>
	</transition>
</template>
