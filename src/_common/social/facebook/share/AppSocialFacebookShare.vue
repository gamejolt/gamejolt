<script lang="ts" setup>
import { onMounted, watch } from 'vue';
import '../../social.styl';
import { FacebookSdk } from '../sdk/sdk.service';

type Props = {
	url: string;
};
const { url } = defineProps<Props>();

function init() {
	FacebookSdk.load();
}

onMounted(() => init());
watch(() => url, () => init());
</script>

<template>
	<div class="fb-share-button" :data-href="url" data-layout="button" />
</template>
