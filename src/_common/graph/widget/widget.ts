import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

import { Api } from '../../api/api.service';
import { Graph } from '../graph.service';
import AppLoading from '../../../vue/components/loading/loading.vue'
import AppGraph from '../graph.vue';

@Component({
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
