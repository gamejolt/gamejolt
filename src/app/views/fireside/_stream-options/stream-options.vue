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

					<template v-if="shouldShowStreamingOptions">
						<a
							v-if="!isPersonallyStreaming"
							class="list-group-item"
							@click="onClickEditStream"
						>
							<translate>Start Streaming</translate>
						</a>
						<template v-else>
							<a class="list-group-item" @click="onClickEditStream">
								<translate>Stream Settings</translate>
							</a>
							<a class="list-group-item has-icon" @click="onClickStopStreaming">
								<app-jolticon icon="remove" notice />
								<translate>Stop Streaming</translate>
							</a>
						</template>
					</template>
				</div>
			</template>
		</app-popper>
	</div>
</template>

<style lang="stylus" scoped>
@import '../common'
</style>
