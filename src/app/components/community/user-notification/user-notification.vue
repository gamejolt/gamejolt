<script lang="ts" src="./user-notification"></script>

<template>
	<app-alert-dismissable
		class="-notification"
		no-margin
		:dismiss-tooltip="$gettext(`Dismiss`)"
		@dismiss="onDismiss"
	>
		<div class="-community">
			<app-community-thumbnail-img
				:community="notification.community"
				class="-community-img"
			/>
			<span class="-community-title">{{ notification.community.name }}</span>
			<span class="dot-separator" />
			<app-time-ago :date="notification.added_on" class="-community-date" />
		</div>

		<div class="-message">
			<div>
				<template v-if="notification.type === NotificationType.POSTS_MOVE">
					<span
						v-translate="{
							fromChannel: notification.extra_data['from-channel'],
							toChannel: notification.extra_data['to-channel'],
						}"
					>
						Your post has been <b>moved</b> from the <i>%{ fromChannel }</i> channel to
						the <i>%{ toChannel }</i> channel.
					</span>
				</template>
				<template v-else-if="notification.type === NotificationType.POSTS_EJECT">
					<span v-translate>Your post has been <b>ejected</b> from the community.</span>
				</template>
			</div>

			<template v-if="hasReason">
				<div><translate>The reason for this action is as follows:</translate></div>
				<div class="-reason">
					<em>
						<strong>
							{{ reasonText }}
						</strong>
					</em>
				</div>
			</template>
		</div>
	</app-alert-dismissable>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-notification
	margin-top: 8px
	full-bleed-xs()

.-dismiss
	position: absolute
	right: 16px
	top: 16px

.-community
	&-img
		border-radius: 50%
		width: 20px
		display: inline-block
		vertical-align: middle

	&-title
		font-size: $font-size-base
		vertical-align: middle

	&-date
		vertical-align: middle

.-message
	margin-top: 8px

.-reason
	margin-top: 8px
	padding-left: 12px
	padding-top: 4px
	padding-bottom: 4px
	border-color: var(--theme-bg-subtle)
	border-width: 4px
	border-left-style: solid
</style>
