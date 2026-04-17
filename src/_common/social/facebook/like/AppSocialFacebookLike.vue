<script lang="ts" setup>
import '~common/social/social.styl';

import { onMounted, watch } from 'vue';

import { FacebookSdk } from '~common/social/facebook/sdk/sdk.service';

type Props = {
	url: string;
	showShare?: boolean;
};
const { url, showShare = true } = defineProps<Props>();

function init() {
	FacebookSdk.load();
}

onMounted(() => init());
watch([() => url, () => showShare], () => init());
</script>

<template>
	<div
		class="fb-like"
		:data-href="url"
		:data-share="showShare ? 'true' : 'false'"
		data-layout="button_count"
		data-action="like"
		data-show-faces="false"
	/>
</template>
