import View from '!view!./slider.html?style=./slider.styl';
import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { AppCommunitySliderItem } from './item/item';

@View
@Component({
	components: {
		AppCommunitySliderItem,
	},
})
export class AppCommunitySlider extends Vue {
	@Prop(Array)
	communities!: Community[];
}
