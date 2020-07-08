<template>
	<div class="-item" :class="{ '-item-usersplit': usersplit }">
		<span v-if="!Screen.isXs" class="-left">
			<app-user-avatar class="-avatar" v-if="usersplit" :user="item.user" />
			<span v-else class="-time">
				{{ item.added_on | date('shortTime') }}
			</span>
		</span>

		<div class="-main">
			<div v-if="usersplit" class="-usersplit">
				{{ item.user.display_name }}
				<span class="-user-sub">
					<template v-if="!Screen.isXs"> @{{ item.user.username }} </template>
					<span
						class="-user-sub-date"
						v-app-tooltip="
							date(item.added_on, 'fullDate') + ' ' + date(item.added_on, 'shortTime')
						"
					>
						<span v-if="isToday">
							<translate>Today</translate>
						</span>
						<span v-else-if="isYesterday">
							<translate>Yesterday</translate>
						</span>
						<span
							v-if="isToday || isYesterday"
							v-translate="{ time: date(item.added_on, 'shortTime') }"
						>
							at %{ time }
						</span>
						<span v-else>
							{{ date(item.added_on, 'shortDate') }}
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
					<app-jolticon v-if="shouldShowIcon" :icon="icon" />
				</span>

				<div class="-action">
					<span v-if="item.type === 'community/created'" v-translate>
						<em>Created</em> this awesome community.
					</span>

					<span
						v-if="item.type === 'post/feature'"
						v-translate="{ channel: getExtraData('in-channel') }"
					>
						<em>Featured</em> a post in the channel #%{ channel }.
					</span>
					<span
						v-else-if="item.type === 'post/unfeature'"
						v-translate="{ channel: getExtraData('in-channel') }"
					>
						<em>Unfeatured</em> a post in the channel #%{ channel }.
					</span>
					<span
						v-else-if="item.type === 'post/move'"
						v-translate="{
							fromChannel: getExtraData('from-channel'),
							toChannel: getExtraData('to-channel'),
						}"
					>
						<em>Moved</em> a post from the channel #%{ fromChannel } to the channel #%{
						toChannel }.
					</span>
					<span
						v-else-if="item.type === 'post/eject'"
						v-translate="{ channel: getExtraData('in-channel') }"
					>
						<em>Ejected</em> a post from the channel #%{ channel }.
					</span>

					<span
						v-else-if="item.type === 'mod/invite'"
						v-translate="{ role: getExtraData('role') }"
					>
						<em>Invited</em> a user to become a %{ role }.
					</span>
					<span
						v-else-if="item.type === 'mod/accept'"
						v-translate="{ role: getExtraData('role') }"
					>
						<em>Joined</em> this community as a %{ role }.
					</span>
					<span
						v-else-if="item.type === 'mod/remove'"
						v-translate="{ role: getExtraData('role') }"
					>
						<em>Removed</em> a %{ role } from this community.
					</span>

					<span v-else-if="item.type === 'block/user'" v-translate>
						<em>Blocked</em> a user from this community.
					</span>

					<span v-else-if="item.type === 'edit/description'" v-translate>
						<em>Edited</em> the description of this community.
					</span>
					<span v-else-if="item.type === 'edit/thumbnail'" v-translate>
						<em>Changed</em> the thumbnail of this community.
					</span>
					<span v-else-if="item.type === 'edit/header'" v-translate>
						<em>Changed</em> the header of this community.
					</span>
					<span v-else-if="item.type === 'edit/details'" v-translate>
						<em>Edited</em> the details of this community.
					</span>
					<span v-else-if="item.type === 'edit/header/remove'" v-translate>
						<em>Removed</em> the header of this community.
					</span>

					<span v-else-if="item.type === 'channel/add'" v-translate>
						<em>Added</em> a new channel to this community.
					</span>
					<span v-else-if="item.type === 'channel/remove'" v-translate>
						<em>Removed</em> a channel from this community.
					</span>
					<span v-else-if="item.type === 'channel/edit'" v-translate>
						<em>Edited</em> a channel in this community.
					</span>

					<span v-else-if="item.type === 'game/link'" v-translate>
						<em>Linked</em> a game to this community.
					</span>
					<span v-else-if="item.type === 'game/unlink'" v-translate>
						<em>Unlinked</em> a game from this community.
					</span>

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
@require '~styles/variables'
@require '~styles-lib/mixins'

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
	font-size: $font-size-small
</style>

<script lang="ts" src="./activity-item"></script>
