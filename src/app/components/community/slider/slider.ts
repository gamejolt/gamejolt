import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Community } from '../../../../_common/community/community.model';
import AppCommunitySliderItem from './item/item.vue';

@Component({
	components: {
		AppCommunitySliderItem,
	},
})
export default class AppCommunitySlider extends Vue {
	@Prop({ type: Array, required: true }) communities!: Community[];
	@Prop({ type: String, required: false, default: 'global' }) eventCat!: string;
}
