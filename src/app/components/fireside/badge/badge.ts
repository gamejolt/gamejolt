import { Emit, Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';
import AppCommunityThumbnailImg from '../../../../_common/community/thumbnail/img/img.vue';
import { number } from '../../../../_common/filters/number';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import AppMediaItemBackdrop from '../../../../_common/media-item/backdrop/backdrop.vue';
import { AppTheme } from '../../../../_common/theme/theme';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/img/img.vue';

@Options({
	components: {
		AppTheme,
		AppMediaItemBackdrop,
		AppUserAvatarImg,
		AppCommunityThumbnailImg,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppFiresideBadge extends Vue {
	@Prop(propRequired(Fireside)) fireside!: Fireside;

	@Emit('expire') emitExpire() {}

	canEmitExpiry = true;
	expiryCheck: NodeJS.Timer | null = null;

	readonly number = number;

	get avatarTooltip() {
		if (this.fireside.community) {
			return this.fireside.community.name;
		}
		return this.fireside.user.display_name + ' (@' + this.fireside.user.username + ')';
	}

	get theme() {
		if (this.fireside.community) {
			return this.fireside.community.theme;
		}

		return this.fireside.user.theme;
	}

	mounted() {
		this.setupCheck();
	}

	destroyed() {
		this.destroyExpiryCheck();
	}

	private setupCheck() {
		// If the Fireside is unjoinable from the get go, never emit expiry.
		if (!this.fireside.isOpen()) {
			this.canEmitExpiry = false;
		} else if (!GJ_IS_SSR) {
			this.canEmitExpiry = true;
			this.destroyExpiryCheck();
			setInterval(this.checkExpiry.bind(this), 1000);
		}
	}

	// Set up a watch here, so that when we refetch info about the fireside
	// without recreating this component, we reset the expiry checks.
	@Watch('fireside', { deep: true })
	watchFireside() {
		this.setupCheck();
	}

	private checkExpiry() {
		if (!this.canEmitExpiry) {
			return;
		}

		if (!this.fireside.isOpen()) {
			this.canEmitExpiry = false;
			this.emitExpire();
		}
	}

	private destroyExpiryCheck() {
		if (this.expiryCheck) {
			clearInterval(this.expiryCheck);
			this.expiryCheck = null;
		}
	}
}
