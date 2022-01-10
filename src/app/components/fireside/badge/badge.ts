import { Emit, Options, Prop, Vue, Watch } from 'vue-property-decorator';
import AppExpand from '../../../../_common/expand/expand.vue';
import { formatNumber } from '../../../../_common/filters/number';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import AppMediaItemBackdrop from '../../../../_common/media-item/backdrop/backdrop.vue';
import { AppObserveDimensions } from '../../../../_common/observe-dimensions/observe-dimensions.directive';
import { AppTheme } from '../../../../_common/theme/theme';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/img/img.vue';
import AppFiresideStreamPreview from '../stream/preview/preview.vue';

@Options({
	components: {
		AppTheme,
		AppMediaItemBackdrop,
		AppUserAvatarImg,
		AppFiresideStreamPreview,
		AppExpand,
	},
	directives: {
		AppTooltip,
		AppObserveDimensions,
	},
})
export default class AppFiresideBadge extends Vue {
	@Prop({ type: Fireside, required: true })
	fireside!: Fireside | null;

	@Prop({ type: Boolean, required: false, default: null })
	showPreview!: boolean | null;

	@Emit('expire') emitExpire() {}
	@Emit('changed') emitChanged(_hasVideo: boolean, _isStreaming: boolean) {}

	canEmitExpiry = true;
	expiryCheck: NodeJS.Timer | null = null;
	isStreaming = false;
	hasVideo = false;
	hadInitialFireside = true;

	containerHeight = 70;

	readonly formatNumber = formatNumber;

	declare $refs: {
		badge: HTMLDivElement;
	};

	get shouldDisplay() {
		return !!this.fireside || (this.hadInitialFireside && this.canExpandPreview);
	}

	get location() {
		return this.fireside?.location ?? null;
	}

	get headerMediaItem() {
		return this.fireside?.header_media_item ?? null;
	}

	get avatarTooltip() {
		if (!this.fireside) {
			return;
		}

		return this.fireside.user.display_name + ' (@' + this.fireside.user.username + ')';
	}

	get theme() {
		return this.fireside?.user.theme ?? null;
	}

	get canExpandPreview() {
		// We want to react to showPreview changes. If showPreview is null,
		// we'll probably never want to show the preview and shouldn't even let
		// it connect to the RTC.
		return this.showPreview !== null;
	}

	created() {
		this.hadInitialFireside = !!this.fireside;
	}

	mounted() {
		this.setupCheck();
	}

	unmounted() {
		this.destroyExpiryCheck();
	}

	private setupCheck() {
		// If the fireside is unjoinable from the get go, never emit expiry.
		if (this.fireside && !this.fireside.isOpen()) {
			this.canEmitExpiry = false;
		} else if (!import.meta.env.SSR) {
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

		if (!this.fireside || !this.fireside.isOpen()) {
			this.onFiresidePreviewChanged(false, false);
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

	onFiresidePreviewChanged(hasVideo: boolean, isStreaming: boolean) {
		this.emitChanged(hasVideo, isStreaming);
		this.hasVideo = hasVideo;
		this.isStreaming = isStreaming;
	}

	onBadgeDimensionsChanged() {
		this.containerHeight = this.$refs.badge.clientHeight;
	}
}
