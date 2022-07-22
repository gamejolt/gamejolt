<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { RouteLocationRaw } from 'vue-router';
import { formatDate } from '../../filters/date';
import { Fireside } from '../../fireside/fireside.model';
import { FiresidePost } from '../../fireside/post/post-model';
import { Game } from '../../game/game.model';
import { Screen } from '../../screen/screen-service';
import { AppTimeAgo } from '../../time/ago/ago';
import { vAppTooltip } from '../../tooltip/tooltip-directive';
import { getSingleReasonText } from '../../user/action-reasons';
import { UserBlock } from '../../user/block/block.model';
import AppUserAvatar from '../../user/user-avatar/user-avatar.vue';
import { User } from '../../user/user.model';
import { CommunityChannel } from '../channel/channel.model';
import { CommunityCompetition } from '../competition/competition.model';
import { CommunityCompetitionEntry } from '../competition/entry/entry.model';
import { CommunityActivityItem } from './activity-item.model';

@Options({
	components: {
		AppTimeAgo,
		AppUserAvatar,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppCommunityActivityItem extends Vue {
	@Prop({ type: Object, required: true }) item!: CommunityActivityItem;
	@Prop({ type: Boolean, required: true }) usersplit!: boolean;
	@Prop({ type: Boolean, required: true }) showIcon!: boolean;

	readonly Screen = Screen;
	readonly formatDate = formatDate;
	readonly CommunityActivityItem = CommunityActivityItem;

	get loggedOn() {
		return formatDate(this.item.added_on, 'medium');
	}

	get shouldShowIcon() {
		return !!this.icon && this.showIcon;
	}

	get icon() {
		return this.item.getTypeIcon()?.icon;
	}

	get color() {
		return this.item.getTypeIcon()?.color;
	}

	get actionIsFiresidePost() {
		return this.item.action_resource instanceof FiresidePost;
	}

	get actionIsUser() {
		return this.item.action_resource instanceof User;
	}

	get isToday() {
		return (
			formatDate(this.item.added_on, 'mediumDate') === formatDate(Date.now(), 'mediumDate')
		);
	}

	get isYesterday() {
		const oneDay = 24 * 60 * 60 * 1000;
		return (
			formatDate(this.item.added_on, 'mediumDate') ===
			formatDate(Date.now() - oneDay, 'mediumDate')
		);
	}

	get actionTo(): RouteLocationRaw | undefined {
		if (this.item.action_resource instanceof FiresidePost) {
			return this.item.action_resource.routeLocation;
		} else if (this.item.action_resource instanceof User) {
			return this.item.action_resource.url;
		} else if (this.item.action_resource instanceof UserBlock) {
			return this.item.action_resource.user.url;
		} else if (this.item.action_resource instanceof CommunityChannel) {
			return {
				name: 'communities.view.channel',
				params: {
					channel: this.item.action_resource.title,
				},
			};
		} else if (this.item.action_resource instanceof Game) {
			return this.item.action_resource.routeLocation;
		} else if (this.item.action_resource instanceof CommunityCompetition) {
			// For community competitions, the channel title is encoded in the extra data.
			const channelTitle = this.getExtraData('channel-title');
			return {
				name: 'communities.view.channel',
				params: {
					channel: channelTitle,
				},
			};
		} else if (this.item.action_resource instanceof CommunityCompetitionEntry) {
			// For community competition entries, the channel title is encoded in the extra data.
			const channelTitle = this.getExtraData('channel-title');
			return {
				name: 'communities.view.channel.entries',
				params: {
					channel: channelTitle,
				},
				hash: '#entry-' + this.item.action_resource.id,
			};
		} else if (this.item.action_resource instanceof Fireside) {
			return this.item.action_resource.routeLocation;
		}
	}

	get actionText() {
		if (this.item.action_resource instanceof FiresidePost) {
			return this.item.action_resource.getShortLead();
		} else if (this.item.action_resource instanceof User) {
			return '@' + this.item.action_resource.username;
		} else if (this.item.action_resource instanceof UserBlock) {
			return '@' + this.item.action_resource.user.username;
		} else if (this.item.action_resource instanceof CommunityChannel) {
			return this.item.action_resource.title;
		} else if (this.item.action_resource instanceof Game) {
			return this.item.action_resource.title;
		} else if (this.item.action_resource instanceof CommunityCompetition) {
			// For community competitions, the channel title is encoded in the extra data.
			const channelTitle = this.getExtraData('channel-title');
			return channelTitle;
		} else if (this.item.action_resource instanceof CommunityCompetitionEntry) {
			return this.item.action_resource.resource.title;
		} else if (this.item.action_resource instanceof Fireside) {
			return this.item.action_resource.title;
		}
	}

	get shouldShowActionSecondLine() {
		return !!this.actionTo || !!this.actionText;
	}

	get extraData(): Record<string, any> {
		return JSON.parse(this.item.extra_data);
	}

	get reasonText() {
		// The user block resource comes with a reason.
		if (this.item.action_resource instanceof UserBlock) {
			return getSingleReasonText(this.item.action_resource.reason);
		}

		// Some other actions might encode a "reason" field in the extra data.
		const reason = this.getExtraData('reason');
		if (!reason) {
			return null;
		}

		return getSingleReasonText(reason);
	}

	get hasReason() {
		return !!this.reasonText;
	}

	getExtraData(key: string) {
		return this.extraData[key];
	}
}
</script>

<template>
	<div class="-item" :class="{ '-item-usersplit': usersplit }">
		<span v-if="!Screen.isXs" class="-left">
			<AppUserAvatar v-if="usersplit" class="-avatar" :user="item.user" />
			<span
				v-else
				v-app-tooltip="
					formatDate(item.added_on, 'fullDate') +
					' ' +
					formatDate(item.added_on, 'shortTime')
				"
				class="-time"
			>
				{{ formatDate(item.added_on, 'shortTime') }}
			</span>
		</span>

		<div class="-main">
			<div v-if="usersplit" class="-usersplit">
				<template v-if="item.user">
					{{ item.user.display_name }}
				</template>
				<!-- This is for when the user that took the action is not available anymore. -->
				<template v-else>
					<span class="text-muted">
						<AppTranslate>Someone</AppTranslate>
						<AppJolticon
							v-app-tooltip="$gettext(`This user is no longer active.`)"
							icon="help-circle"
						/>
					</span>
				</template>
				<span class="-user-sub">
					<template v-if="item.user && !Screen.isXs">
						@{{ item.user.username }}
					</template>
					<span
						v-app-tooltip="
							formatDate(item.added_on, 'fullDate') +
							' ' +
							formatDate(item.added_on, 'shortTime')
						"
						class="-user-sub-date"
					>
						<span v-if="isToday">
							<AppTranslate>Today</AppTranslate>
						</span>
						<span v-else-if="isYesterday">
							<AppTranslate>Yesterday</AppTranslate>
						</span>
						<span
							v-if="isToday || isYesterday"
							v-translate="{ time: formatDate(item.added_on, 'shortTime') }"
						>
							at %{ time }
						</span>
						<span v-else>
							{{ formatDate(item.added_on, 'shortDate') }}
						</span>
					</span>
				</span>
			</div>
			<div class="-content">
				<span
					class="-icon"
					:class="{
						'-icon-notice': color === 'notice',
						'-icon-theme': color === 'theme',
						'-icon-other': color !== 'notice' && color !== 'theme',
					}"
				>
					<AppJolticon v-if="shouldShowIcon" :icon="icon" />
				</span>

				<div class="-action">
					<!-- Show a text based on the action taken. -->
					<span
						v-if="item.type === CommunityActivityItem.TYPE_COMMUNITY_CREATED"
						v-translate
					>
						<em>Created</em> this awesome community.
					</span>

					<span
						v-if="item.type === CommunityActivityItem.TYPE_POST_FEATURE"
						v-translate="{ channel: getExtraData('in-channel') }"
					>
						<em>Featured</em> a post in the channel <i>%{ channel }</i>.
					</span>
					<span
						v-else-if="item.type === CommunityActivityItem.TYPE_POST_UNFEATURE"
						v-translate="{ channel: getExtraData('in-channel') }"
					>
						<em>Unfeatured</em> a post in the channel <i>%{ channel }</i>.
					</span>
					<span
						v-else-if="item.type === CommunityActivityItem.TYPE_POST_MOVE"
						v-translate="{
							fromChannel: getExtraData('from-channel'),
							toChannel: getExtraData('to-channel'),
						}"
					>
						<em>Moved</em> a post from the channel <i>%{ fromChannel }</i> to the
						channel <i>%{ toChannel }</i>.
					</span>
					<span
						v-else-if="item.type === CommunityActivityItem.TYPE_POST_EJECT"
						v-translate="{ channel: getExtraData('in-channel') }"
					>
						<em>Ejected</em> a post from the channel <i>%{ channel }</i>.
					</span>

					<span
						v-else-if="item.type === CommunityActivityItem.TYPE_MOD_INVITE"
						v-translate="{ role: getExtraData('role') }"
					>
						<em>Invited</em> a user with the role <i>%{ role }</i>.
					</span>
					<span
						v-else-if="item.type === CommunityActivityItem.TYPE_MOD_ACCEPT"
						v-translate="{ role: getExtraData('role') }"
					>
						<em>Joined</em> this community with the role <i>%{ role }</i>.
					</span>
					<span
						v-else-if="item.type === CommunityActivityItem.TYPE_MOD_REMOVE"
						v-translate="{ role: getExtraData('role') }"
					>
						<em>Removed</em> a moderater with the role <i>%{ role }</i> from this
						community.
					</span>

					<span
						v-else-if="item.type === CommunityActivityItem.TYPE_BLOCK_USER"
						v-translate
					>
						<em>Blocked</em> a user from this community.
					</span>

					<span
						v-else-if="item.type === CommunityActivityItem.TYPE_EDIT_DESCRIPTION"
						v-translate
					>
						<em>Edited</em> the description of this community.
					</span>
					<span
						v-else-if="item.type === CommunityActivityItem.TYPE_EDIT_THUMBNAIL"
						v-translate
					>
						<em>Changed</em> the thumbnail of this community.
					</span>
					<span
						v-else-if="item.type === CommunityActivityItem.TYPE_EDIT_HEADER"
						v-translate
					>
						<em>Changed</em> the header of this community.
					</span>
					<span
						v-else-if="item.type === CommunityActivityItem.TYPE_EDIT_DETAILS"
						v-translate
					>
						<em>Edited</em> the details of this community.
					</span>
					<span
						v-else-if="item.type === CommunityActivityItem.TYPE_EDIT_HEADER_REMOVE"
						v-translate
					>
						<em>Removed</em> the header of this community.
					</span>

					<span
						v-else-if="item.type === CommunityActivityItem.TYPE_CHANNEL_ADD"
						v-translate
					>
						<em>Added</em> a new channel to this community.
					</span>
					<span
						v-else-if="item.type === CommunityActivityItem.TYPE_CHANNEL_REMOVE"
						v-translate
					>
						<em>Removed</em> a channel from this community.
					</span>
					<span
						v-else-if="item.type === CommunityActivityItem.TYPE_CHANNEL_EDIT"
						v-translate
					>
						<em>Edited</em> a channel in this community.
					</span>
					<span
						v-else-if="item.type === CommunityActivityItem.TYPE_CHANNEL_RENAME"
						v-translate="{
							oldName: getExtraData('old-name'),
							newName: getExtraData('new-name'),
						}"
					>
						<em>Renamed</em> a channel from <i>%{ oldName }</i> to <i>%{ newName }</i>.
					</span>

					<span
						v-else-if="item.type === CommunityActivityItem.TYPE_GAME_LINK"
						v-translate
					>
						<em>Linked</em> a game to this community.
					</span>
					<span
						v-else-if="item.type === CommunityActivityItem.TYPE_GAME_UNLINK"
						v-translate
					>
						<em>Unlinked</em> a game from this community.
					</span>

					<span
						v-else-if="
							item.type === CommunityActivityItem.TYPE_COMPETITION_EDIT_SETTINGS
						"
						v-translate
					>
						<em>Edited</em> a jam in this community.
					</span>
					<span
						v-else-if="item.type === CommunityActivityItem.TYPE_COMPETITION_EDIT_VOTING"
						v-translate
					>
						<em>Edited</em> voting settings for a jam in this community.
					</span>
					<span
						v-else-if="
							item.type === CommunityActivityItem.TYPE_COMPETITION_VOTING_SET_ACTIVE
						"
						v-translate="{
							action: getExtraData('is-active')
								? $gettext(`Activated`)
								: $gettext(`Deactivated`),
						}"
					>
						<em>%{ action }</em> voting for a jam in this community.
					</span>
					<span
						v-else-if="
							item.type === CommunityActivityItem.TYPE_COMPETITION_ENTRY_GIVE_AWARD
						"
						v-translate="{ award: getExtraData('award-name') }"
					>
						<em>Awarded</em> the <i>%{ award }</i> award to an entry.
					</span>
					<span
						v-else-if="
							item.type === CommunityActivityItem.TYPE_COMPETITION_ENTRY_REMOVE
						"
						v-translate
					>
						<em>Hid</em> an entry from its jam.
					</span>
					<span
						v-else-if="
							item.type === CommunityActivityItem.TYPE_COMPETITION_ENTRY_UNREMOVE
						"
						v-translate
					>
						<em>Readmitted</em> an entry to its jam.
					</span>
					<span
						v-else-if="item.type === CommunityActivityItem.TYPE_FIRESIDE_START"
						v-translate
					>
						<em>Started</em> a Fireside in this community.
					</span>
					<span
						v-else-if="item.type === CommunityActivityItem.TYPE_FIRESIDE_START_DRAFT"
						v-translate
					>
						<em>Started</em> a Fireside in <em>draft</em> mode in this community.
					</span>
					<span
						v-else-if="item.type === CommunityActivityItem.TYPE_FIRESIDE_PUBLISH"
						v-translate
					>
						<em>Published</em> a Fireside in this community.
					</span>
					<span
						v-else-if="item.type === CommunityActivityItem.TYPE_FIRESIDE_EXTINGUISH"
						v-translate
					>
						<em>Extinguished</em> this community's Fireside.
					</span>
					<span
						v-else-if="item.type === CommunityActivityItem.TYPE_FIRESIDE_FEATURE"
						v-translate
					>
						<em>Featured</em> a Fireside.
					</span>
					<span
						v-else-if="item.type === CommunityActivityItem.TYPE_FIRESIDE_UNFEATURE"
						v-translate
					>
						<em>Unfeatured</em> a Fireside.
					</span>
					<span
						v-else-if="item.type === CommunityActivityItem.TYPE_FIRESIDE_EJECT"
						v-translate
					>
						<em>Ejected</em> a Fireside from this community.
					</span>

					<!-- Adds a row to display the given reason for an action.  -->
					<template v-if="hasReason">
						<br />
						<span class="-reason-row">
							<AppTranslate>Reason:</AppTranslate>
							<i>{{ ' ' + reasonText }}</i>
						</span>
					</template>

					<!-- Adds a row to show a preview of the resource, and to link to it. -->
					<template v-if="shouldShowActionSecondLine">
						<br />
						<component
							:is="actionTo ? 'router-link' : 'span'"
							class="-resource-row"
							:to="actionTo"
						>
							{{ actionText }}
						</component>
					</template>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
$-left-size = 54px
$-avatar-size = 40px

.-item
	padding-left: 4px
	padding-right: 4px
	padding-top: 4px
	padding-bottom: 4px
	rounded-corners()
	transition: background-color 0.1s ease
	display: flex

	&-usersplit
		margin-top: 12px

	&:hover
		background-color: var(--theme-bg-offset)

		.-time
			opacity: 1

.-left
	display: inline-block
	width: $-left-size
	font-size: 10px
	color: var(--theme-fg-muted)
	text-align: right
	flex-shrink: 0

	.-avatar
		width: $-avatar-size
		margin-left: ($-left-size - $-avatar-size) * 0.5

	.-time
		display: inline-block
		margin-top: 4px
		margin-right: 4px
		text-align: right
		opacity: 0
		transition: opacity 0.1s ease

.-main
	margin-left: 8px

	@media $media-xs
		margin-left: 0

	.-user-sub
		display: inline-block
		margin-left: 4px
		color: var(--theme-fg-muted)
		font-size: $font-size-tiny
		cursor: default

		&-date
			display: inline-block
			margin-left: 8px

.-content
	display: flex

.-usersplit
	margin-bottom: 4px
	display: flex
	align-items: center

.-icon
	display: inline-block
	flex-shrink: 0
	margin-right: 12px
	margin-left: 12px
	// Visually aligns better with the text.
	margin-top: -1px
	width: 20px

	& *
		vertical-align: middle

	&-notice
		color: var(--theme-notice)

	&-theme
		color: var(--theme-bi-bg)

	&-other
		color: var(--theme-fg-muted)

.-action
	font-weight: lighter
	display: inline-block

	em
		font-weight: bold
		font-style: normal

.-resource-row
.-reason-row
	font-size: $font-size-small
</style>
