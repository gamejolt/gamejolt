<script lang="ts" setup>
import { Ref, ref, watch } from 'vue';

import { Api } from '../api/api.service';
import AppLoading from '../loading/AppLoading.vue';
import AppGraph from './AppGraph.vue';
import { Graph } from './graph.service';

type Props = {
	url: string;
};
const { url } = defineProps<Props>();

const isLoading = ref(true);
const graphData = ref() as Ref<any>;

watch(
	() => url,
	async () => {
		isLoading.value = true;

		const response = await Api.sendRequest(url, null, { detach: true });

		if (response.data && Array.isArray(response.data)) {
			graphData.value = Graph.createGraphData(response.data);
		}

		isLoading.value = false;
	},
	{ immediate: true }
);
</script>

<template>
	<div>
		<AppLoading v-if="isLoading" :big="true" />

		<AppGraph v-if="!isLoading && graphData" :dataset="graphData.graph" />
	</div>
</template>
