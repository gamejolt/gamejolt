import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Community } from '../../../../../_common/community/community.model';
import AppCommunitySlider from '../../../community/slider/slider.vue';

@Component({
	components: {
		AppCommunitySlider,
	},
})
export default class AppDiscoverHomeCommunities extends Vue {
	@Prop(Array)
	communities!: Community[];
}
