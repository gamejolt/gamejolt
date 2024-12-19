<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { styleAbsoluteFill } from '../../../_styles/mixins';
import { useAdStore } from '../ad-store';

const { takeoverAdapter: adapter, hasTakeover } = useAdStore();

const fgSrc = ref('');
const bgSrc = ref('');
const href = ref('');
let clickUrl = '';

onMounted(() => {
	window.addEventListener('message', showTakeover);

	adapter.run(() => {
		const slot = adapter.getTakeoverGptSlot();
		googletag.display(slot);
		googletag.pubads().refresh([slot]);
	});
});

onBeforeUnmount(() => {
	window.removeEventListener('message', showTakeover);

	adapter.run(() => {
		const slot = adapter.getTakeoverGptSlot();
		googletag.pubads().clear([slot]);
	});

	hasTakeover.value = false;
});

function showTakeover(event: MessageEvent) {
	// We're not showing in a safe-frame, so the origin will be the same.
	if (event.origin !== window.location.origin || event.data?.type !== 'AD_TAKEOVER') {
		return;
	}

	const data = event.data;

	if (
		typeof data.fgImg !== 'string' ||
		typeof data.bgImg !== 'string' ||
		typeof data.destUrl !== 'string' ||
		typeof data.clickUrl !== 'string' ||
		typeof data.impressionUrl !== 'string'
	) {
		return;
	}

	if (!data.fgImg || !data.bgImg || !data.destUrl || !data.clickUrl || !data.impressionUrl) {
		return;
	}

	hasTakeover.value = true;

	fgSrc.value = data.fgImg;
	bgSrc.value = data.bgImg;
	href.value = data.destUrl;
	clickUrl = data.clickUrl;

	const impressionTracker = new Image();
	impressionTracker.src = data.impressionUrl;
}

function onClick() {
	if (!clickUrl) {
		return;
	}

	const clickTracker = new Image();
	clickTracker.src = clickUrl;
}
</script>

<template>
	<div :id="`div-gpt-ad-takeover`" :style="{ display: `none` }" />

	<a
		v-if="fgSrc && bgSrc && href"
		:style="{
			display: `flex`,
			alignItems: `center`,
			justifyContent: `center`,
		}"
		:href="href"
		target="_blank"
		@click="onClick"
	>
		<img class="img-responsive" width="300" height="600" alt="Advertisement" :src="fgSrc" />
		<Teleport to="#ad-takeover-background">
			<a
				:style="{
					...styleAbsoluteFill(),
					backgroundImage: `url(${bgSrc})`,
					backgroundSize: `cover`,
					backgroundPosition: `center`,
				}"
				:href="href"
				target="_blank"
				@click="onClick"
			/>
		</Teleport>
	</a>
</template>
