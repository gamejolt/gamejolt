<script lang="ts" setup>
import { onBeforeUnmount, onMounted } from 'vue';

import { useAdStore } from '~common/ad/ad-store';

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
				class="absolute inset-0"
				:style="{
					backgroundImage: `url(${bgImg})`,
					backgroundRepeat: `no-repeat`,
					backgroundSize:
						sizing === 'cover' ? `cover` : sizing === 'contain' ? `contain` : undefined,
					backgroundPosition:
						sizing === 'cover'
							? `center`
							: sizing === 'contain'
							? `top center`
							: undefined,
				}"
				:href="destUrl"
				target="_blank"
				@click="onClick"
			/>
		</Teleport>
	</a>
</template>
