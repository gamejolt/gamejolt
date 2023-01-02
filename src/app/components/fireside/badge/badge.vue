<script lang="ts">
import { Emit, Options, Prop, Vue, Watch } from 'vue-property-decorator';
import AppExpand from '../../../../_common/expand/AppExpand.vue';
import { formatNumber } from '../../../../_common/filters/number';
import AppFiresideLiveTag from '../../../../_common/fireside/AppFiresideLiveTag.vue';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import AppMediaItemBackdrop from '../../../../_common/media-item/backdrop/AppMediaItemBackdrop.vue';
import { vAppObserveDimensions } from '../../../../_common/observe-dimensions/observe-dimensions.directive';
import AppTheme from '../../../../_common/theme/AppTheme.vue';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/AppUserAvatarImg.vue';
import AppFiresideStreamPreview from '../stream/preview/preview.vue';

@Options({
	components: {
		AppTheme,
		AppMediaItemBackdrop,
		AppUserAvatarImg,
		AppFiresideStreamPreview,
		AppExpand,
		AppFiresideLiveTag,
	},
	directives: {
		AppTooltip: vAppTooltip,
		AppObserveDimensions: vAppObserveDimensions,
	},
})
export default class AppFiresideBadge extends Vue {
	@Prop({ type: Object, required: true })
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
		return this.fireside?.routeLocation ?? null;
	}

	get headerMediaItem() {
		return this.fireside?.header_media_item ?? null;
	}

	get avatarTooltip() {
		if (!this.fireside) {
			return undefined;
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
</script>

<template>
	<AppTheme v-if="shouldDisplay" :theme="theme">
		<component :is="fireside && !fireside.is_expired ? 'router-link' : 'div'" :to="location">
			<div class="-fireside-badge fill-darkest">
				<div
					ref="badge"
					v-app-observe-dimensions="onBadgeDimensionsChanged"
					class="-fireside-badge-padding"
				>
					<AppMediaItemBackdrop
						v-if="headerMediaItem"
						class="-backdrop"
						:media-item="headerMediaItem"
						radius="lg"
					>
						<div
							class="-header"
							:style="{
								'background-image': 'url(' + headerMediaItem.mediaserver_url + ')',
							}"
						>
							<div class="-header-overlay" />
						</div>
					</AppMediaItemBackdrop>
					<div v-else class="-backdrop">
						<div class="-header -header-fill">
							<div class="-header-overlay" />
						</div>
					</div>

					<div class="-content">
						<div v-app-tooltip.left="avatarTooltip" class="-avatar">
							<AppUserAvatarImg v-if="fireside" :user="fireside.user" />
						</div>
						<div>
							<div v-if="fireside && !fireside.is_expired">
								<span class="tag">
									<span class="-new-tag" />
									<AppTranslate
										:translate-n="fireside.member_count || 0"
										:translate-params="{
											count: formatNumber(fireside.member_count || 0),
										}"
										translate-plural="%{ count } Members"
									>
										%{ count } Member
									</AppTranslate>
								</span>

								<span v-if="fireside.is_draft" class="tag">
									<AppTranslate>Draft</AppTranslate>
								</span>

								<span
									v-if="
										fireside.primaryCommunityLink &&
										fireside.primaryCommunityLink.isFeatured
									"
									class="tag"
								>
									<AppTranslate>Featured</AppTranslate>
								</span>
							</div>
							<div class="-title">
								<template v-if="fireside && !fireside.is_expired">
									{{ fireside.title }}
								</template>
								<AppTranslate v-else>
									This fireside has expired. See you next time!
								</AppTranslate>
							</div>
						</div>
						<AppFiresideLiveTag v-if="fireside && isStreaming" class="-live" />
					</div>
				</div>

				<div v-if="canExpandPreview" class="-preview">
					<AppExpand :when="showPreview">
						<div
							class="-preview-placeholder"
							:style="{ 'margin-top': -containerHeight + 'px' }"
						/>
					</AppExpand>

					<AppFiresideStreamPreview
						v-if="fireside && !fireside.is_expired"
						class="-preview-inner"
						:class="{ '-hidden': !showPreview }"
						:style="{ 'margin-top': -containerHeight + 'px' }"
						:fireside="fireside"
						:show-live="false"
						show-live-users
						@changed="onFiresidePreviewChanged"
					/>
				</div>
			</div>
		</component>
	</AppTheme>
</template>

<style lang="stylus" scoped>
$-zindex-backdrop = 1
$-zindex-preview = 2
$-zindex-content = 3

.-backdrop
	// For some reason we need position static
	// so the backdrop can get the height.
	position: static
	z-index: $-zindex-backdrop

.-hidden
	display: none

.-preview
	position: relative
	z-index: $-zindex-preview

	.-preview-placeholder
		width: 100%
		padding-top: 56.25%

	.-preview-inner
		position: absolute
		top: 0
		right: 0
		left: 0

.-fireside-badge
	clearfix()
	full-bleed-xs()
	rounded-corners-lg()
	position: relative
	margin-bottom: $line-height-computed
	overflow: hidden
	elevate-hover-2()
	-webkit-transform: translateZ(0)

	&-padding
		padding: 10px 15px

	&:hover
		.-header
			background-size: 105% auto
			filter: blur(1px)

.-header
	position: absolute
	top: 0
	left: 0
	width: 100%
	height: 100%
	background-size: 100% auto
	background-repeat: no-repeat
	background-position: center center
	transition: background-size 250ms, filter 250ms

	&-overlay
		width: 100%
		height: 100%
		background: rgba(0, 0, 0, 0.6)

	&-fill
		change-bg('backlight')

.-content
	position: relative
	z-index: $-zindex-content
	display: flex
	align-items: center

.-title
	line-clamp(2)
	font-family: $font-family-heading
	font-size: 21px
	text-shadow: 1px 1px 3px $black

.-avatar
	width: 48px
	height: 48px
	background-color: var(--theme-white)
	border-radius: 50%
	padding: 2px
	margin-right: ($grid-gutter-width / 4)
	flex-shrink: 0

	img
		display: block
		width: 100%
		height: 100%
		img-circle()

.-new-tag
	display: inline-block
	width: 8px
	height: 8px
	border-radius: 50%
	border-color: var(--theme-dark)
	border-width: 1px
	border-style: solid
	change-bg('highlight')

.-live
	margin-left: auto !important
</style>
