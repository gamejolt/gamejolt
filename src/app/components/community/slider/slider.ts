import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppCommunitySliderItem from './item/item.vue';

@Component({
	components: {
		AppCommunitySliderItem,
	},
})
export default class AppCommunitySlider extends Vue {
	@Prop(Array)
	communities!: Community[];
}
