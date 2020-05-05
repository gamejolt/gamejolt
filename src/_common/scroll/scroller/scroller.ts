import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propOptional } from '../../../utils/vue';
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

	isMounted = GJ_IS_SSR;
	_scrollElement!: HTMLElement;

	mounted() {
		this._scrollElement = this.$el as HTMLElement;
		this.isMounted = true;
	}

	scrollTo(offsetY: number) {
		this.$el.scrollTo({ top: offsetY });
	}
}
