import { Options, Prop, Vue } from 'vue-property-decorator';
import { Community } from '../../../../../_common/community/community.model';
import { Fireside } from '../../../../../_common/fireside/fireside.model';
import { AppState, AppStore } from '../../../../../_common/store/app-store';
import { AppTheme } from '../../../../../_common/theme/theme';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { FiresideAddModal } from '../../add-modal/add-modal.service';

@Options({
	components: {
		AppTheme,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppFiresideBadgeAdd extends Vue {
	@AppState user!: AppStore['user'];

	@Prop({ type: Object, default: undefined })
	community!: Community | undefined;

	get theme() {
		return this.user?.theme;
	}

	get isCommunity() {
		return this.community !== undefined;
	}

	get isDisabled() {
		return !!this.community && !this.community.is_member;
	}

	declare $refs: {
		header: HTMLDivElement;
	};

	async onClickBadge() {
		const fireside = await FiresideAddModal.show({ community: this.community });
		if (fireside instanceof Fireside) {
			this.$router.push(fireside.location);
		}
	}
}
