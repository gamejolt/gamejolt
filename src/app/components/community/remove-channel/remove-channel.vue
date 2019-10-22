<template>
	<div>
		<p v-translate>
			All posts in this channel will be
			<b>ejected</b>
			from the community,
			<br />
			unless you choose to
			<b>move</b>
			them to a different channel instead.
		</p>

		<template v-if="!moving">
			<app-button primary @click="moving = true" icon="arrow-forward">
				<translate>Move</translate>
			</app-button>

			<app-button primary @click="onEject" icon="remove">
				<translate>Eject</translate>
			</app-button>
		</template>
		<span v-else class="-where-to">Where to?</span>

		<app-expand :when="moving">
			<app-community-channel-select
				class="-channel-select"
				v-model="selectedChannel"
				:channels="channels"
			/>

			<div class="-move-controls">
				<app-button primary :disabled="!hasSelectedChannel" @click="onMove" icon="arrow-forward">
					<translate>Move</translate>
				</app-button>
				<a @click="moving = false">
					<app-jolticon icon="remove" />
				</a>
			</div>
		</app-expand>

		<p class="help-block">
			<translate>Removing a channel is irreversible. Once it's gone, it's gone for good.</translate>
			<template v-if="moving">
				<br />
				<translate>It might take a few moments for the posts to show in the new channel.</translate>
			</template>
		</p>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.-where-to
	display: inline-block
	line-height: $button-md-line-height
	font-weight: bold

.-channel-select
	margin: $line-height-computed 0

.-move-controls
	display: flex
	align-items: center

	button
		margin-right: 10px

	a
		color: var(--theme-fg)

</style>

<script lang="ts" src="./remove-channel"></script>
