import { darken, lighten } from 'polished';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { propOptional } from '../../../utils/vue';
import { GrayLight, GraySubtle, Theme } from '../../theme/theme.model';
import { ThemeState, ThemeStore } from '../../theme/theme.store';
import { AppScrollInviewParent } from '../inview/parent';

@Options({
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

	get actualTheme() {
		// Use the form/page/user theme, or the default theme if none exist.
		return this.theme || new Theme(null);
	}

	get hoverColors() {
		return {
			'--default-hover': `#${this.actualTheme.tintColor(darken(0.2, GrayLight), 0.04)}`,
			'--modal-hover': `#${this.actualTheme.tintColor(lighten(0.15, GraySubtle), 0.04)}`,
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
