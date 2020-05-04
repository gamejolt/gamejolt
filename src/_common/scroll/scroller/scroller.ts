import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propOptional } from '../../../utils/vue';
// This definitely needs to be changed if we're removing Simplebar
import { AppScrollInviewParent } from '../inview/parent';

@Component({
	components: {
		AppScrollInviewParent,
	},
})
export default class AppScrollScroller extends Vue {
	@Prop(propOptional(Boolean))
	overlay?: boolean;

	@Prop(propOptional(Boolean))
	horizontal?: boolean;

	@Prop(propOptional(Boolean))
	hideScrollbar?: boolean;

	scrollTo(offsetY: number) {
		this.$el.scrollTo({ top: offsetY });
	}
}
