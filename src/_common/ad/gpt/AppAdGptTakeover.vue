<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { styleAbsoluteFill, styleWhen } from '../../../_styles/mixins';
import { useAdStore } from '../ad-store';

const { gptAdapter, properAdapter, hasTakeover } = useAdStore();

const fgSrc = ref('');
const bgSrc = ref('');
const href = ref('');
const sizing = ref('cover');
let clickUrl = '';

onMounted(() => {
	window.addEventListener('message', showTakeover);

	gptAdapter.run(() => {
		const slot = gptAdapter.getTakeoverSlot();
		googletag.display(slot);
		googletag.pubads().refresh([slot]);
	});

	// We need to make sure that proper loads in since it's the one that loads
	// the script for now.
	properAdapter.ensureLoaded();
});

onBeforeUnmount(() => {
	window.removeEventListener('message', showTakeover);

	gptAdapter.run(() => {
		const slot = gptAdapter.getTakeoverSlot();
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

	const checkKeys = ['fgImg', 'bgImg', 'destUrl', 'clickUrl', 'impressionUrl'];
	for (const key of checkKeys) {
		if (typeof data[key] !== 'string' || !data[key]) {
			return;
		}
	}

	hasTakeover.value = true;

	fgSrc.value = data.fgImg;
	bgSrc.value = data.bgImg;
	href.value = data.destUrl;
	clickUrl = data.clickUrl;

	if (data.sizing === 'cover' || data.sizing === 'contain') {
		sizing.value = data.sizing;
	}

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
	<div :style="{ display: `none` }">
		<div id="div-gpt-ad-takeover" />
	</div>

	<a
		v-if="fgSrc && bgSrc && href"
		:style="{
			display: `flex`,
			alignItems: `center`,
			justifyContent: `center`,
		}"
		:href
		target="_blank"
		@click="onClick"
	>
		<img class="img-responsive" width="300" height="600" alt="Advertisement" :src="fgSrc" />
		<Teleport to="#ad-takeover-background">
			<a
				:style="{
					...styleAbsoluteFill(),
					backgroundImage: `url(${bgSrc})`,
					backgroundRepeat: `no-repeat`,
					...styleWhen(sizing === 'cover', {
						backgroundSize: `cover`,
						backgroundPosition: `center`,
					}),
					...styleWhen(sizing === 'contain', {
						backgroundSize: `contain`,
						backgroundPosition: `top center`,
					}),
				}"
				:href
				target="_blank"
				@click="onClick"
			/>
		</Teleport>
	</a>
</template>
