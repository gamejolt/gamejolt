<script lang="ts" src="./user-notification"></script>

<template>
	<app-alert-dismissable class="-notification" no-margin @dismiss="onDismiss">
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
				<app-jolticon icon="notice" notice />

				<template v-if="notification.type === NotificationType.POSTS_MOVE">
					<span
						v-translate="{
							fromChannel: notification.extra_data['from-channel'],
							toChannel: notification.extra_data['to-channel'],
						}"
					>
						Your post has been moved from the <i>%{ fromChannel }</i> channel to the
						<i>%{ toChannel }</i> channel.
					</span>
				</template>
				<template v-else-if="notification.type === NotificationType.POSTS_EJECT">
					<span>
						<translate>Your posts has been ejected from the community.</translate>
					</span>
				</template>
			</div>

			<template v-if="hasReason">
				<div><translate>The reason for this action is as follows:</translate></div>
				<div>
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
</style>
