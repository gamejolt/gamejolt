<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { shallowSetup } from '../../../../utils/vue';
import AppCommunityThumbnailImg from '../../../../_common/community/thumbnail/img/img.vue';
import { formatNumber } from '../../../../_common/filters/number';
import { Screen } from '../../../../_common/screen/screen-service';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/img/img.vue';
import { useFiresideController } from '../../../components/fireside/controller/controller';
import { StreamSetupModal } from '../../../components/fireside/stream/setup/setup-modal.service';
import { FiresideChatMembersModal } from '../_chat-members/modal/modal.service';
import AppFiresideSettingsPopper from '../_settings-popper/settings-popper.vue';

@Options({
	components: {
		AppCommunityThumbnailImg,
		AppUserAvatarImg,
		AppFiresideSettingsPopper,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppFiresideHeader extends Vue {
	@Prop({ type: Boolean })
	showControls!: boolean;

	@Prop({ type: Boolean })
	hasChat!: boolean;

	@Prop({ type: Boolean })
	hasChatStats!: boolean;

	@Prop({ type: Boolean })
	isOverlay!: boolean;

	c = shallowSetup(() => useFiresideController()!);

	readonly formatNumber = formatNumber;
	readonly Screen = Screen;

	get fireside() {
		return this.c.fireside;
	}

	get memberCount() {
		return this.c.chatRoom.value?.members.length ?? 1;
	}

	onClickShowChatMembers() {
		if (!this.c.chatUsers.value || !this.c.chatRoom.value) {
			return;
		}

		FiresideChatMembersModal.show(this.c.chatUsers.value, this.c.chatRoom.value);
	}

	onClickEditStream() {
		StreamSetupModal.show(this.c);
	}

	onShowPopper() {
		if (this.isOverlay) {
			this.c.isShowingOverlayPopper.value = true;
		}
	}

	onHidePopper() {
		this.c.isShowingOverlayPopper.value = false;
	}
}
</script>

<template>
	<div class="fireside-header" :class="{ '-overlay': isOverlay }">
		<template v-if="fireside">
			<div class="-fireside-title">
				<h2
					class="sans-margin-top"
					:class="{ h3: Screen.isXs, 'sans-margin-bottom': isOverlay }"
				>
					<small class="-subtitle">
						<router-link
							:to="{
								name: 'profile.overview',
								params: { username: fireside.user.username },
							}"
						>
							@{{ fireside.user.username }}
						</router-link>
						{{ ' ' }}
						<app-user-avatar-img class="-avatar" :user="fireside.user" />
						<span>'s Fireside</span>

						<template v-if="fireside.community">
							{{ ' ' }}
							<span>in </span>
							<div class="-avatar -community-avatar">
								<app-community-thumbnail-img :community="fireside.community" />
							</div>
							{{ ' ' }}
							<router-link :to="fireside.community.routeLocation">
								{{ fireside.community.name }}
							</router-link>
						</template>

						<span v-if="c.isDraft.value" class="-tag tag">
							<translate>Draft</translate>
						</span>

						<span
							v-if="
								fireside.primaryCommunityLink &&
								fireside.primaryCommunityLink.isFeatured
							"
							class="-tag tag"
						>
							<translate>Featured</translate>
						</span>
					</small>
					<div class="-fireside-title-text" :title="fireside.title">
						{{ fireside.title }}
					</div>
				</h2>
				<div v-if="hasChatStats && c.chatUsers.value" class="-fireside-title-member-stats">
					<ul class="stat-list">
						<a @click="onClickShowChatMembers">
							<li class="stat-big stat-big-smaller">
								<div class="stat-big-label">Members</div>
								<div class="stat-big-digit">
									{{ formatNumber(c.chatUsers.value.count) }}
								</div>
							</li>
						</a>
					</ul>
				</div>
				<div v-if="showControls" class="-fireside-title-controls">
					<div
						v-if="c.shouldShowStreamingOptions.value && !c.isPersonallyStreaming.value"
						class="-stats-btn"
					>
						<app-button
							v-app-tooltip="$gettext(`Start Stream / Voice Chat`)"
							icon="broadcast"
							circle
							trans
							@click="onClickEditStream"
						/>
					</div>

					{{ ' ' }}

					<app-fireside-settings-popper @show="onShowPopper" @hide="onHidePopper">
						<div class="-stats-btn">
							<app-button icon="ellipsis-v" circle sparse solid />
						</div>
					</app-fireside-settings-popper>
				</div>
			</div>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.-overlay
	*
		text-shadow: 1px 1px 3px rgba($black, 0.5)

		&:not(a)
			color: white

	.-subtitle
		font-weight: 600
		opacity: 0.75

.-fireside-title
	display: flex
	align-items: center

	&-text
	h2
		text-overflow()
		flex: auto

	&-member-stats
		flex: none
		margin-left: 12px
		margin-right: 24px

	&-controls
		flex: none
		margin-left: 12px
		white-space: nowrap

.-subtitle
	*
		vertical-align: middle

.-avatar
	width: 16px
	height: 16px
	display: inline-block

.-community-avatar
	overflow: hidden
	border-radius: 50%

.-stats-btn
	display: inline-block
	position: relative

	&-warn
		change-bg('bg-offset')
		rounded-corners()
		position: absolute
		left: -8px
		top: -8px
		pointer-events: none
		padding: 2px

.-tag
	margin-left: 4px

.-extras-header
	font-family: $font-family-heading
	font-size: $font-size-tiny
	font-weight: normal
	letter-spacing: 0.1em
	line-height: 1
	text-transform: uppercase
	margin-top: 0
	margin-bottom: 0

	img
		width: $list-group-icon-width * 0.8
		height: $list-group-icon-width * 0.8
		border-radius: 50%
		display: inline-block
		position: relative
		left: -($list-group-icon-width - 1px)
		top: -2px
		margin-right: -($list-group-icon-width - 5px)
</style>
