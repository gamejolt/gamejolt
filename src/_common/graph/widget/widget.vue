<script lang="ts">
import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { Api } from '../../api/api.service';
import AppLoading from '../../loading/AppLoading.vue';
import { Graph } from '../graph.service';
import AppGraph from '../graph.vue';

@Options({
	components: {
		AppLoading,
		AppGraph,
	},
})
export default class AppGraphWidget extends Vue {
	@Prop(String) url!: string;

	isLoading = true;
	graphData: any = null;

	@Watch('url', { immediate: true })
	async onUrlChange() {
		this.isLoading = true;

		const response = await Api.sendRequest(this.url, null, { detach: true });

		if (response.data && Array.isArray(response.data)) {
			this.graphData = Graph.createGraphData(response.data);
		}

		this.isLoading = false;
	}
}
</script>

<template>
	<div>
		<AppLoading v-if="isLoading" :big="true" />

		<AppGraph v-if="!isLoading && graphData" :dataset="graphData.graph" />
	</div>
</template>
