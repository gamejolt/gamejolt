<script lang="ts" setup>
import { onMounted } from 'vue';
import '../../social.styl';
import { TwitterSdk } from '../sdk/sdk.service';

type Props = {
	content: string;
	url?: string;
	size?: string;
};
const { content, url, size = 'small' } = defineProps<Props>();

onMounted(() => TwitterSdk.load());
</script>

<template>
	<a
		class="twitter-share-button"
		href="https://twitter.com/share"
		:data-text="content"
		:data-url="url"
		:data-size="size"
	/>
</template>
