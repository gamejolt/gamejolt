<script lang="ts">
// TODO(remove-firesides) (ask) verify that this should still support firesides.

import { Options, Prop, Vue } from 'vue-property-decorator';
import { RouteLocationRaw } from 'vue-router';
import { formatDate } from '../../filters/date';
import { FiresideModel } from '../../fireside/fireside.model';
import { FiresidePostModel } from '../../fireside/post/post-model';
import { GameModel } from '../../game/game.model';
import { Screen } from '../../screen/screen-service';
import AppTimeAgo from '../../time/AppTimeAgo.vue';
import { vAppTooltip } from '../../tooltip/tooltip-directive';
import { getSingleReasonText } from '../../user/action-reasons';
import { UserBlockModel } from '../../user/block/block.model';
import AppUserAvatar from '../../user/user-avatar/AppUserAvatar.vue';
import { UserModel } from '../../user/user.model';
import { CommunityChannelModel } from '../channel/channel.model';
import { CommunityCompetitionModel } from '../competition/competition.model';
import { CommunityCompetitionEntryModel } from '../competition/entry/entry.model';
import { CommunityActivityItemModel, CommunityActivityItemType } from './activity-item.model';

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
	@Prop({ type: Object, required: true }) item!: CommunityActivityItemModel;
	@Prop({ type: Boolean, required: true }) usersplit!: boolean;
	@Prop({ type: Boolean, required: true }) showIcon!: boolean;

	readonly Screen = Screen;
	readonly formatDate = formatDate;

	readonly CommunityCreated = CommunityActivityItemType.CommunityCreated;
	readonly PostFeature = CommunityActivityItemType.PostFeature;
	readonly PostUnfeature = CommunityActivityItemType.PostUnfeature;
	readonly PostMove = CommunityActivityItemType.PostMove;
	readonly PostEject = CommunityActivityItemType.PostEject;

	readonly ModInvite = CommunityActivityItemType.ModInvite;
	readonly ModAccept = CommunityActivityItemType.ModAccept;
	readonly ModRemove = CommunityActivityItemType.ModRemove;

	readonly BlockUser = CommunityActivityItemType.BlockUser;

	readonly EditDescription = CommunityActivityItemType.EditDescription;
	readonly EditThumbnail = CommunityActivityItemType.EditThumbnail;
	readonly EditHeader = CommunityActivityItemType.EditHeader;
	readonly EditDetails = CommunityActivityItemType.EditDetails;
	readonly EditHeaderRemove = CommunityActivityItemType.EditHeaderRemove;

	readonly ChannelAdd = CommunityActivityItemType.ChannelAdd;
	readonly ChannelRemove = CommunityActivityItemType.ChannelRemove;
	readonly ChannelEdit = CommunityActivityItemType.ChannelEdit;
	readonly ChannelRename = CommunityActivityItemType.ChannelRename;

	readonly GameLink = CommunityActivityItemType.GameLink;
	readonly GameUnlink = CommunityActivityItemType.GameUnlink;

	readonly CompetitionEditSettings = CommunityActivityItemType.CompetitionEditSettings;
	readonly CompetitionEditVoting = CommunityActivityItemType.CompetitionEditVoting;
	readonly CompetitionVotingSetActive = CommunityActivityItemType.CompetitionVotingSetActive;
	readonly CompetitionEntryRemove = CommunityActivityItemType.CompetitionEntryRemove;
	readonly CompetitionEntryUnremove = CommunityActivityItemType.CompetitionEntryUnremove;
	readonly CompetitionEntryGiveAward = CommunityActivityItemType.CompetitionEntryGiveAward;

	readonly FiresideStart = CommunityActivityItemType.FiresideStart;
	readonly FiresideStartDraft = CommunityActivityItemType.FiresideStartDraft;
	readonly FiresidePublish = CommunityActivityItemType.FiresidePublish;
	readonly FiresideExtinguish = CommunityActivityItemType.FiresideExtinguish;
	readonly FiresideFeature = CommunityActivityItemType.FiresideFeature;
	readonly FiresideUnfeature = CommunityActivityItemType.FiresideUnfeature;
	readonly FiresideEject = CommunityActivityItemType.FiresideEject;

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
		return this.item.action_resource instanceof FiresidePostModel;
	}

	get actionIsUser() {
		return this.item.action_resource instanceof UserModel;
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
		if (this.item.action_resource instanceof FiresidePostModel) {
			return this.item.action_resource.routeLocation;
		} else if (this.item.action_resource instanceof UserModel) {
			return this.item.action_resource.url;
		} else if (this.item.action_resource instanceof UserBlockModel) {
			return this.item.action_resource.user.url;
		} else if (this.item.action_resource instanceof CommunityChannelModel) {
			return {
				name: 'communities.view.channel',
				params: {
					channel: this.item.action_resource.title,
				},
			};
		} else if (this.item.action_resource instanceof GameModel) {
			return this.item.action_resource.routeLocation;
		} else if (this.item.action_resource instanceof CommunityCompetitionModel) {
			// For community competitions, the channel title is encoded in the extra data.
			const channelTitle = this.getExtraData('channel-title');
			return {
				name: 'communities.view.channel',
				params: {
					channel: channelTitle,
				},
			};
		} else if (this.item.action_resource instanceof CommunityCompetitionEntryModel) {
			// For community competition entries, the channel title is encoded in the extra data.
			const channelTitle = this.getExtraData('channel-title');
			return {
				name: 'communities.view.channel.entries',
				params: {
					channel: channelTitle,
				},
				hash: '#entry-' + this.item.action_resource.id,
			};
		} else if (this.item.action_resource instanceof FiresideModel) {
			// No longer supported.
			return undefined;
		}
	}

	get actionText() {
		if (this.item.action_resource instanceof FiresidePostModel) {
			return this.item.action_resource.getShortLead();
		} else if (this.item.action_resource instanceof UserModel) {
			return '@' + this.item.action_resource.username;
		} else if (this.item.action_resource instanceof UserBlockModel) {
			return '@' + this.item.action_resource.user.username;
		} else if (this.item.action_resource instanceof CommunityChannelModel) {
			return this.item.action_resource.title;
		} else if (this.item.action_resource instanceof GameModel) {
			return this.item.action_resource.title;
		} else if (this.item.action_resource instanceof CommunityCompetitionModel) {
			// For community competitions, the channel title is encoded in the extra data.
			const channelTitle = this.getExtraData('channel-title');
			return channelTitle;
		} else if (this.item.action_resource instanceof CommunityCompetitionEntryModel) {
			return this.item.action_resource.resource.title;
		} else if (this.item.action_resource instanceof FiresideModel) {
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
		if (this.item.action_resource instanceof UserBlockModel) {
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
					<span v-if="item.type === CommunityCreated" v-translate>
						<em>Created</em> this awesome community.
					</span>

					<span
						v-if="item.type === PostFeature"
						v-translate="{ channel: getExtraData('in-channel') }"
					>
						<em>Featured</em> a post in the channel <i>%{ channel }</i>.
					</span>
					<span
						v-else-if="item.type === PostUnfeature"
						v-translate="{ channel: getExtraData('in-channel') }"
					>
						<em>Unfeatured</em> a post in the channel <i>%{ channel }</i>.
					</span>
					<span
						v-else-if="item.type === PostMove"
						v-translate="{
							fromChannel: getExtraData('from-channel'),
							toChannel: getExtraData('to-channel'),
						}"
					>
						<em>Moved</em> a post from the channel <i>%{ fromChannel }</i> to the
						channel <i>%{ toChannel }</i>.
					</span>
					<span
						v-else-if="item.type === PostEject"
						v-translate="{ channel: getExtraData('in-channel') }"
					>
						<em>Ejected</em> a post from the channel <i>%{ channel }</i>.
					</span>

					<span
						v-else-if="item.type === ModInvite"
						v-translate="{ role: getExtraData('role') }"
					>
						<em>Invited</em> a user with the role <i>%{ role }</i>.
					</span>
					<span
						v-else-if="item.type === ModAccept"
						v-translate="{ role: getExtraData('role') }"
					>
						<em>Joined</em> this community with the role <i>%{ role }</i>.
					</span>
					<span
						v-else-if="item.type === ModRemove"
						v-translate="{ role: getExtraData('role') }"
					>
						<em>Removed</em> a moderater with the role <i>%{ role }</i> from this
						community.
					</span>

					<span v-else-if="item.type === BlockUser" v-translate>
						<em>Blocked</em> a user from this community.
					</span>

					<span v-else-if="item.type === EditDescription" v-translate>
						<em>Edited</em> the description of this community.
					</span>
					<span v-else-if="item.type === EditThumbnail" v-translate>
						<em>Changed</em> the thumbnail of this community.
					</span>
					<span v-else-if="item.type === EditHeader" v-translate>
						<em>Changed</em> the header of this community.
					</span>
					<span v-else-if="item.type === EditDetails" v-translate>
						<em>Edited</em> the details of this community.
					</span>
					<span v-else-if="item.type === EditHeaderRemove" v-translate>
						<em>Removed</em> the header of this community.
					</span>

					<span v-else-if="item.type === ChannelAdd" v-translate>
						<em>Added</em> a new channel to this community.
					</span>
					<span v-else-if="item.type === ChannelRemove" v-translate>
						<em>Removed</em> a channel from this community.
					</span>
					<span v-else-if="item.type === ChannelEdit" v-translate>
						<em>Edited</em> a channel in this community.
					</span>
					<span
						v-else-if="item.type === ChannelRename"
						v-translate="{
							oldName: getExtraData('old-name'),
							newName: getExtraData('new-name'),
						}"
					>
						<em>Renamed</em> a channel from <i>%{ oldName }</i> to <i>%{ newName }</i>.
					</span>

					<span v-else-if="item.type === GameLink" v-translate>
						<em>Linked</em> a game to this community.
					</span>
					<span v-else-if="item.type === GameUnlink" v-translate>
						<em>Unlinked</em> a game from this community.
					</span>

					<span v-else-if="item.type === CompetitionEditSettings" v-translate>
						<em>Edited</em> a jam in this community.
					</span>
					<span v-else-if="item.type === CompetitionEditVoting" v-translate>
						<em>Edited</em> voting settings for a jam in this community.
					</span>
					<span
						v-else-if="item.type === CompetitionVotingSetActive"
						v-translate="{
							action: getExtraData('is-active')
								? $gettext(`Activated`)
								: $gettext(`Deactivated`),
						}"
					>
						<em>%{ action }</em> voting for a jam in this community.
					</span>
					<span
						v-else-if="item.type === CompetitionEntryGiveAward"
						v-translate="{ award: getExtraData('award-name') }"
					>
						<em>Awarded</em> the <i>%{ award }</i> award to an entry.
					</span>
					<span v-else-if="item.type === CompetitionEntryRemove" v-translate>
						<em>Hid</em> an entry from its jam.
					</span>
					<span v-else-if="item.type === CompetitionEntryUnremove" v-translate>
						<em>Readmitted</em> an entry to its jam.
					</span>
					<span v-else-if="item.type === FiresideStart" v-translate>
						<em>Started</em> a Fireside in this community.
					</span>
					<span v-else-if="item.type === FiresideStartDraft" v-translate>
						<em>Started</em> a Fireside in <em>draft</em> mode in this community.
					</span>
					<span v-else-if="item.type === FiresidePublish" v-translate>
						<em>Published</em> a Fireside in this community.
					</span>
					<span v-else-if="item.type === FiresideExtinguish" v-translate>
						<em>Extinguished</em> this community's Fireside.
					</span>
					<span v-else-if="item.type === FiresideFeature" v-translate>
						<em>Featured</em> a Fireside.
					</span>
					<span v-else-if="item.type === FiresideUnfeature" v-translate>
						<em>Unfeatured</em> a Fireside.
					</span>
					<span v-else-if="item.type === FiresideEject" v-translate>
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
