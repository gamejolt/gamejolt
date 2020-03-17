import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { AppState, AppStore } from '../../store/app-store';
import { AppTooltip, TooltipPlacement } from '../../tooltip/tooltip';

@Component({
	directives: {
		AppTooltip,
	},
})
export default class AppCommunityDiscoverWidget extends Vue {
	@AppState
	user!: AppStore['user'];

	@Prop({ type: String, default: 'bottom' })
	tooltipPlacement!: TooltipPlacement;

	get tooltip() {
		return {
			content: this.$gettext(`Discover Communities`),
			placement: this.tooltipPlacement,
		};
	}
}
