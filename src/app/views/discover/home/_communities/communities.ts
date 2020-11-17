import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Store } from '../../../../../client/store/index';
import { propOptional, propRequired } from '../../../../../utils/vue';
import AppCommunityAddWidget from '../../../../../_common/community/add-widget/add-widget.vue';
import { Community } from '../../../../../_common/community/community.model';
import AppCommunityDiscoverWidget from '../../../../../_common/community/discover-widget/discover-widget.vue';
import AppCommunitySliderPlaceholder from '../../../../components/community/slider/placeholder/placeholder.vue';
import AppCommunitySlider from '../../../../components/community/slider/slider.vue';
import AppDiscoverHomeCommunitiesItem from './item/item.vue';

@Component({
	components: {
		AppCommunitySlider,
		AppCommunitySliderPlaceholder,
		AppDiscoverHomeCommunitiesItem,
		AppCommunityDiscoverWidget,
		AppCommunityAddWidget,
	},
})
export default class AppDiscoverHomeCommunities extends Vue {
	@State
	app!: Store['app'];

	@Prop(propRequired(Array))
	communities!: Community[];

	@Prop(propOptional(Boolean, false))
	isLoading!: boolean;
}
