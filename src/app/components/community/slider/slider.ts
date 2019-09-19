import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Community } from '../../../../_common/community/community.model';
import { Screen } from '../../../../_common/screen/screen-service';
import { AppTooltip } from '../../../../_common/tooltip/tooltip';
import AppCommunitySliderAddItem from './add-item/add-item.vue';
import AppCommunitySliderItem from './item/item.vue';

@Component({
	components: {
		AppCommunitySliderItem,
		AppCommunitySliderAddItem,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppCommunitySlider extends Vue {
	@Prop({ type: Array, required: true })
	communities!: Community[];

	@Prop({ type: Boolean, required: false })
	withAddButton?: boolean;

	@Prop({ type: String, required: false, default: 'global' })
	eventCat!: string;

	get addButtonSize() {
		return Screen.isXs ? 60 : 100;
	}
}
