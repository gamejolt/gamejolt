<script lang="ts" setup>
import { Ref, ref, watch } from 'vue';

import { Api } from '~common/api/api.service';
import AppGraph from '~common/graph/AppGraph.vue';
import { Graph } from '~common/graph/graph.service';
import AppLoading from '~common/loading/AppLoading.vue';

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
