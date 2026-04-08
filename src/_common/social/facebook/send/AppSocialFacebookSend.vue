<script lang="ts" setup>
import '../../social.styl';

import { onMounted, watch } from 'vue';

import { FacebookSdk } from '../sdk/sdk.service';

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
	<div class="fb-send" :data-href="url" />
</template>
