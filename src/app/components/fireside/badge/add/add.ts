import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { Community } from '../../../../../_common/community/community.model';
import { Fireside } from '../../../../../_common/fireside/fireside.model';
import { useCommonStore } from '../../../../../_common/store/common-store';
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
	@Prop({ type: Object, default: undefined })
	community!: Community | undefined;

	commonStore = setup(() => useCommonStore());

	get user() {
		return this.commonStore.user;
	}

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
