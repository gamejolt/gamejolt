import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { AppAuthRequired } from '../../auth/auth-required-directive';
import { showErrorGrowl } from '../../growls/growls.service';
import { useCommonStore } from '../../store/common-store';
import { TooltipPlacement } from '../../tooltip/tooltip-controller';
import { AppTooltip } from '../../tooltip/tooltip-directive';

@Options({
	directives: {
		AppTooltip,
		AppAuthRequired,
	},
})
export default class AppCommunityAddWidget extends Vue {
	@Prop({ type: String, default: 'bottom' })
	tooltipPlacement!: TooltipPlacement;

	commonStore = setup(() => useCommonStore());

	get user() {
		return this.commonStore.user;
	}

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

		showErrorGrowl({
			message: this.$gettext(
				`You own too many communities. You must remove one before creating another.`
			),
			sticky: true,
		});
	}
}
