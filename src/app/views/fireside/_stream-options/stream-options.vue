<script lang="ts" src="./stream-options"></script>

<template>
	<div class="-stream-options-wrap">
		<app-popper>
			<div v-app-tooltip="$gettext(`Stream Options`)" class="-stream-options">
				<app-jolticon class="-icon" icon="ellipsis-v" />
			</div>

			<template #popover>
				<div class="list-group">
					<a v-if="shouldMute" class="list-group-item" @click="muteAll()">
						<translate>Mute All</translate>
					</a>
					<a v-else class="list-group-item" @click="unmuteAll()">
						<translate>Unmute All</translate>
					</a>
					<a class="list-group-item" @click="toggleVideoStats()">
						<translate>Toggle Video Stats</translate>
					</a>
				</div>
			</template>
		</app-popper>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-stream-options-wrap
	display: flex
	align-items: flex-start
	justify-content: center
	width: var(--fireside-host-size)
	height: var(--fireside-host-size)

.-stream-options
	elevate-1()
	img-circle()
	display: flex
	align-items: center
	justify-content: center
	width: calc(var(--fireside-host-size) - 12px)
	height: calc(var(--fireside-host-size) - 12px)
	cursor: pointer
	user-select: none
	background-color: var(--theme-bg-offset)

	&:hover
		color: var(--theme-bi-fg)
		background-color: var(--theme-bi-bg)

.-icon
	font-size: 20px
	color: var(--theme-fg)
</style>
