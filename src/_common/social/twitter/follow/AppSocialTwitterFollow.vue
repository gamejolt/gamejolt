<script lang="ts" setup>
import '~common/social/social.styl';

import { onMounted } from 'vue';

import { TwitterSdk } from '~common/social/twitter/sdk/sdk.service';

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
