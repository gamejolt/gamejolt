import Vue from 'vue';
import { Component, Inject } from 'vue-property-decorator';
import AppCommunityCardBase from '../../../../../_common/community/card-base/card-base.vue';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../view.store';
import AppEditableThumbnail from '../_editable-thumbnail/editable-thumbnail.vue';

@Component({
	components: {
		AppCommunityCardBase,
		AppEditableThumbnail,
	},
})
export default class AppCommunitiesViewCard extends Vue {
	@Inject({ from: CommunityRouteStoreKey })
	routeStore!: CommunityRouteStore;

	get community() {
		return this.routeStore.community;
	}
}
