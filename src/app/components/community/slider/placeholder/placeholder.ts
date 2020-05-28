import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propOptional } from '../../../../../utils/vue';
import AppScrollScroller from '../../../../../_common/scroll/scroller/scroller.vue';

@Component({
	components: {
		AppScrollScroller,
	},
})
export default class AppCommunitySliderPlaceholder extends Vue {
	/**
	 * 10 seems to be the max that 'xs' can see in feed view.
	 */
	@Prop(propOptional(Number, 10))
	num!: number;

	/**
	 * Adds a second non-community bubble
	 * if we want the 'add' placeholder to show.
	 */
	@Prop(propOptional(Boolean, false))
	withAddButton!: number;
}
