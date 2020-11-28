import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Store } from '../../../../../client/store/index';
import { propOptional, propRequired } from '../../../../../utils/vue';
import AppCommunityCardCreatePlaceholder from '../../../../../_common/community/card-create-placeholder/card-create-placeholder.vue';
import { Community } from '../../../../../_common/community/community.model';
import AppCommunitySliderPlaceholder from '../../../../components/community/slider/placeholder/placeholder.vue';
import AppCommunitySlider from '../../../../components/community/slider/slider.vue';
import { hasCommunitiesHomeSplitTest } from '../../../../components/split-test/split-test-service';
import AppDiscoverHomeCommunitiesItem from './item/item.vue';

@Component({
	components: {
		AppCommunitySlider,
		AppCommunitySliderPlaceholder,
		AppDiscoverHomeCommunitiesItem,
		AppCommunityCardCreatePlaceholder,
	},
})
export default class AppDiscoverHomeCommunities extends Vue {
	@Prop(propRequired(Array)) communities!: Community[];
	@Prop(propOptional(Boolean, false)) isLoading!: boolean;

	@State app!: Store['app'];

	get isInSplit() {
		return hasCommunitiesHomeSplitTest(this.$route, this.app.user);
	}
}
