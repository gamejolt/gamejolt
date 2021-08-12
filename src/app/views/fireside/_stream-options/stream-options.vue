<script lang="ts" src="./stream-options"></script>

<template>
	<div class="-options-wrap">
		<app-popper @show="emitShowPopper" @hide="emitHidePopper">
			<div v-app-tooltip="$gettext(`Stream Options`)" class="-options">
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
@import '../common'
</style>
