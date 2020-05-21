import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { AppTooltip } from '../../tooltip/tooltip-directive';
import { TooltipPlacement } from '../../tooltip/tooltip-model';

@Component({
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
