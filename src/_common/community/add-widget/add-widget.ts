import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { AppAuthRequired } from '../../auth/auth-required-directive';
import { Growls } from '../../growls/growls.service';
import { AppState, AppStore } from '../../store/app-store';
import { AppTooltip } from '../../tooltip/tooltip-directive';
import { TooltipPlacement } from '../../tooltip/tooltip-model';

@Component({
	directives: {
		AppTooltip,
		AppAuthRequired,
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
		let content;
		if (this.canCreate || !this.user) {
			content = this.$gettext(`Create a Community`);
		} else {
			content = this.$gettext(`You own too many communities`);
		}

		return {
			content,
			placement: this.tooltipPlacement,
		};
	}

	showGrowl() {
		if (!this.user) {
			return;
		}

		Growls.error({
			message: this.$gettext(
				`You own too many communities. You must remove one before creating another.`
			),
			sticky: true,
		});
	}
}
