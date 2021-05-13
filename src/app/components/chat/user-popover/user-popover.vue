<script lang="ts" src="./user-popover"></script>

<template>
	<div class="chat-user-popover">
		<div class="fill-darker -info-container">
			<div class="-avatar-container">
				<div class="-avatar-img">
					<app-user-avatar class="-avatar" :user="user" />
					<div class="-avatar-circle" />
				</div>
			</div>

			<div class="-names">
				<div class="-displayname">
					<b>{{ user.display_name }}</b>
				</div>
				<div class="-username text-muted">@{{ user.username }}</div>
			</div>

			<div v-if="isOnline !== null" class="-status">
				<app-chat-user-online-status
					class="-status-bubble"
					:is-online="isOnline"
					:size="16"
					:absolute="false"
				/>
				<span>{{ isOnline ? $gettext(`Online`) : $gettext(`Offline`) }}</span>
			</div>

			<div v-if="isOwner" class="-status">
				<app-jolticon icon="crown" />
				<translate>Room Owner</translate>
			</div>
		</div>
		<div class="list-group list-group-dark">
			<router-link
				:to="{ name: 'profile.overview', params: { username: user.username } }"
				class="list-group-item has-icon"
			>
				<app-jolticon icon="user" />
				<translate>View Profile</translate>
			</router-link>
			<a v-if="canMessage" class="list-group-item has-icon" @click="onClickSendMessage">
				<app-jolticon icon="message" />
				<translate>Send Message</translate>
			</a>
			<template v-if="canModerate">
				<hr />
				<a class="list-group-item has-icon" @click="onClickKick">
					<app-jolticon icon="logout" notice />
					<translate>Kick from Room</translate>
				</a>
			</template>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.chat-user-popover
	.-info-container
		padding: 16px
		border-bottom-width: $border-width-large
		border-bottom-style: solid
		border-bottom-color: var(--theme-darkest)
		width: 250px

	.-names
		margin-top: 4px
		text-align: center

	.-username
		font-size: $font-size-small

	.-avatar
		width: 72px
		height: 72px
		z-index: 2
		transition: filter 0.1s ease

		&:hover
			filter: brightness(0.6) contrast(1.1)

		&-circle
			width: 80px
			height: 80px
			top: -4px
			left: -4px
			position: absolute
			z-index: 1
			border-radius: 50%
			background-color: var(--theme-darkest)

		&-img
			position: relative
			border-radius: 50%

			&:hover
				elevate-hover-2()

		&-container
			display: flex
			justify-content: center
			margin-bottom: 10px

	.-status
		margin-top: 8px
		display: flex
		font-family: $font-family-tiny
		font-size: $font-size-tiny
		font-weight: bold
		justify-content: center
		user-select: none

		&-bubble
			margin-right: 4px
</style>
