<script lang="ts" setup>
import { onBeforeUnmount, onMounted } from 'vue';
import { styleAbsoluteFill, styleWhen } from '../../../_styles/mixins';
import { useAdStore } from '../ad-store';

export type AdTakeoverProps = {
	fgImg: string;
	bgImg: string;
	destUrl: string;
	clickUrl: string;
	impressionUrl: string;
	sizing?: 'cover' | 'contain';
};

const { fgImg, bgImg, destUrl, clickUrl, impressionUrl, sizing } = defineProps<AdTakeoverProps>();

const { hasTakeover } = useAdStore();

onMounted(() => {
	hasTakeover.value = true;

	const impressionTracker = new Image();
	impressionTracker.src = impressionUrl;
});

onBeforeUnmount(() => {
	hasTakeover.value = false;
});

function onClick() {
	if (!clickUrl) {
		return;
	}

	const clickTracker = new Image();
	clickTracker.src = clickUrl;
}
</script>

<template>
	<a
		v-if="fgImg && bgImg && destUrl"
		:style="{
			display: `flex`,
			alignItems: `center`,
			justifyContent: `center`,
		}"
		:href="destUrl"
		target="_blank"
		@click="onClick"
	>
		<img class="img-responsive" width="300" height="600" alt="Advertisement" :src="fgImg" />
		<Teleport to="#ad-takeover-background">
			<a
				:style="{
					...styleAbsoluteFill(),
					backgroundImage: `url(${bgImg})`,
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
				:href="destUrl"
				target="_blank"
				@click="onClick"
			/>
		</Teleport>
	</a>
</template>
