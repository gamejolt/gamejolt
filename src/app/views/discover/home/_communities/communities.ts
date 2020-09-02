import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../../utils/vue';
import { Community } from '../../../../../_common/community/community.model';
import AppCommunitySliderPlaceholder from '../../../../components/community/slider/placeholder/placeholder.vue';
import AppCommunitySlider from '../../../../components/community/slider/slider.vue';

@Component({
	components: {
		AppCommunitySlider,
		AppCommunitySliderPlaceholder,
	},
})
export default class AppDiscoverHomeCommunities extends Vue {
	@Prop(propRequired(Array))
	communities!: Community[];

	@Prop(propOptional(Boolean, false))
	isLoading!: boolean;
}
