import { Options, Prop, Vue } from 'vue-property-decorator';
import { AppTooltip } from '../../tooltip/tooltip-directive';
import { TooltipPlacement } from '../../tooltip/tooltip-controller';

@Options({
	directives: {
		AppTooltip,
	},
})
export default class AppCommunityDiscoverWidget extends Vue {
	@Prop({ type: String, default: 'bottom' })
	tooltipPlacement!: TooltipPlacement;

	get tooltip() {
		return {
			content: this.$gettext(`Discover Communities`),
			placement: this.tooltipPlacement,
		};
	}
}
