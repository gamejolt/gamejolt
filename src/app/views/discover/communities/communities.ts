import { Component, Watch } from 'vue-property-decorator';
import { sleep } from '../../../../utils/utils';
import { Api } from '../../../../_common/api/api.service';
import AppCommunityCard from '../../../../_common/community/card/card.vue';
import { Community } from '../../../../_common/community/community.model';
import AppLoading from '../../../../_common/loading/loading.vue';
import { BaseRouteComponent } from '../../../../_common/route/route-component';

const endpoint = '/web/discover/communities';

@Component({
	name: 'RouteDiscoverCommunities',
	components: {
		AppCommunityCard,
		AppLoading,
	},
})
export default class RouteDiscoverCommunities extends BaseRouteComponent {
	searchText = '';
	communities: Community[] = [];
	page = 1;
	isLoading = false;

	private nextSearchId = 0;

	get isLoadingMore() {
		return this.isLoading && this.page !== 1;
	}

	@Watch('searchText', { immediate: true })
	onSearchTextChanged() {
		this.nextSearchId++;
		this.sendSearch(this.nextSearchId, this.searchText);
	}

	async sendSearch(searchId: number, searchText: string) {
		this.isLoading = true;

		// Debounce
		await sleep(500);
		if (searchId !== this.nextSearchId) {
			return;
		}

		const url = `${endpoint}?q=${encodeURIComponent(searchText)}&page=${this.page}`;
		const result = await Api.sendRequest(url, null, {
			detach: true,
		});
		console.log(result);

		// Abort if a new search was already made while this was sent.
		if (searchId !== this.nextSearchId) {
			return;
		}

		this._populatePayload(result);

		this.isLoading = false;
	}

	private _populatePayload(payload: any) {
		this.communities = Community.populate(payload.communities || []);
	}
}
