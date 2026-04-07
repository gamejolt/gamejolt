<script lang="ts" setup>
import { onMounted } from 'vue';
import '../../social.styl';
import { TwitterSdk } from '../sdk/sdk.service';

type Props = {
	handle: string;
	showCount?: boolean;
	size?: string;
};
const { handle, showCount = true, size = 'small' } = defineProps<Props>();

onMounted(() => TwitterSdk.load());
</script>

<template>
	<a
		class="twitter-follow-button"
		:href="'https://twitter.com/' + handle"
		:data-show-count="showCount ? 'true' : 'false'"
		:data-size="size"
	/>
</template>
