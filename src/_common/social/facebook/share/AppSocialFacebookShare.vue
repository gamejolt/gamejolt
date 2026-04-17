<script lang="ts" setup>
import '~common/social/social.styl';

import { onMounted, watch } from 'vue';

import { FacebookSdk } from '~common/social/facebook/sdk/sdk.service';

type Props = {
	url: string;
};
const { url } = defineProps<Props>();

function init() {
	FacebookSdk.load();
}

onMounted(() => init());
watch(
	() => url,
	() => init()
);
</script>

<template>
	<div class="fb-share-button" :data-href="url" data-layout="button" />
</template>
