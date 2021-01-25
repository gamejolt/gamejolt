import Vue from 'vue';
import Component from 'vue-class-component';
import { Inject } from 'vue-property-decorator';
import { number } from '../../../../../../../../../_common/filters/number';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../../../../../view.store';

@Component({
	filters: {
		number,
	},
})
export default class AppCommunitiesEditCompetitionNav extends Vue {
	@Inject(CommunityRouteStoreKey) routeStore!: CommunityRouteStore;

	get competition() {
		return this.routeStore.competition!;
	}
}
