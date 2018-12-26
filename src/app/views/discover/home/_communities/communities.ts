import View from '!view!./communities.html';
import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { AppCommunitySlider } from '../../../../components/community/slider/slider';

@View
@Component({
	components: {
		AppCommunitySlider,
	},
})
export class AppDiscoverHomeCommunities extends Vue {
	@Prop(Array)
	communities!: Community[];
}
