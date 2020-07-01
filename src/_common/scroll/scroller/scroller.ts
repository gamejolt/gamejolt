import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propOptional } from '../../../utils/vue';
import { ThemeState, ThemeStore } from '../../theme/theme.store';
import { AppScrollInviewParent } from '../inview/parent';

// The values that FireFox scrollbars change to with no theme.
const HOVER_GRAY_SUBTLE = '#565656';
const HOVER_GRAY_LIGHT = '#656565';

@Component({
	components: {
		AppScrollInviewParent,
	},
})
export default class AppScrollScroller extends Vue {
	@Prop(propOptional(Boolean, false)) thin!: boolean;
	@Prop(propOptional(Boolean, false)) horizontal!: boolean;
	@Prop(propOptional(Boolean, false)) hideScrollbar!: boolean;

	@ThemeState
	theme?: ThemeStore['theme'];

	isMounted = GJ_IS_SSR;
	scrollElement: HTMLElement | null = null;

	get hoverColors() {
		if (!this.theme) {
			return null;
		}

		return {
			'--modal-hover': `#${this.theme.tintColor(HOVER_GRAY_SUBTLE, 0.04)}`,
			'--default-hover': `#${this.theme.tintColor(HOVER_GRAY_LIGHT, 0.04)}`,
		};
	}

	mounted() {
		this.scrollElement = this.$el as HTMLElement;
		this.isMounted = true;
	}

	scrollTo(offsetY: number) {
		this.$el.scrollTo({ top: offsetY });
	}
}
