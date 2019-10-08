import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Growls } from '../../growls/growls.service';
import { AppState, AppStore } from '../../store/app-store';
import { AppTooltip, TooltipPlacement } from '../../tooltip/tooltip';

@Component({
	directives: {
		AppTooltip,
	},
})
export default class AppCommunityAddWidget extends Vue {
	@AppState
	user!: AppStore['user'];

	@Prop({ type: String, default: 'bottom' })
	tooltipPlacement!: TooltipPlacement;

	get canCreate() {
		return this.user && !!this.user.can_create_communities;
	}

	get tooltip() {
		return {
			content: this.canCreate
				? this.$gettext(`Create a Community`)
				: this.$gettext(`You own too many communities`),
			placement: this.tooltipPlacement,
		};
	}

	showGrowl() {
		Growls.error({
			message: this.$gettext(
				`You own too many communities. You must remove one before creating another.`
			),
			sticky: true,
		});
	}
}
