import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Store } from '../../../../../client/store/index';
import { propOptional, propRequired } from '../../../../../utils/vue';
import AppCommunityCard from '../../../../../_common/community/card/card.vue';
import { Community } from '../../../../../_common/community/community.model';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppDiscoverHomeCommunitiesItem from './item/item.vue';

@Component({
	components: {
		AppDiscoverHomeCommunitiesItem,
		AppCommunityCard,
	},
})
export default class AppDiscoverHomeCommunities extends Vue {
	@Prop(propRequired(Array)) communities!: Community[];
	@Prop(propOptional(Boolean, false)) isLoading!: boolean;

	@State app!: Store['app'];

	get slicedCommunities() {
		return this.communities.slice(0, Screen.isMobile ? 18 : 24);
	}
}
