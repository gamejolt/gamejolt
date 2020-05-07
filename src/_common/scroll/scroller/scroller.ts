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
	@Prop(propOptional(Boolean, false))
	thin!: boolean;

	@Prop(propOptional(Boolean, false))
	horizontal!: boolean;

	@Prop(propOptional(Boolean, false))
	hideScrollbar!: boolean;

	isMounted = GJ_IS_SSR;

	mounted() {
		this.isMounted = true;
	}

	scrollTo(offsetY: number) {
		this.$el.scrollTo({ top: offsetY });
	}
}
