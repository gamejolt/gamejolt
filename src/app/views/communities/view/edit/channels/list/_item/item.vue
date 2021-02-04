<script lang="ts" src="./item"></script>

<template>
	<app-card-list-item :item="channel">
		<div class="-row">
			<div class="-channel-img-preview">
				<img v-if="channel.background" :src="channel.background.mediaserver_url" />
			</div>

			<div class="card-title">
				<div>
					<template v-if="channel.hasDisplayTitle">
						<b>{{ channel.displayTitle }}</b>
						<span class="dot-separator" />
						<span class="text-muted">{{ channel.title }}</span>
					</template>
					<template v-else>
						<b>{{ channel.title }}</b>
					</template>
				</div>
				<div>
					<span v-if="channel.type === 'competition'" class="tag">
						<app-jolticon icon="jams" />
						<translate>Game Jam</translate>
					</span>
					<span v-if="channel.visibility === 'draft'" class="tag">
						<translate>Draft</translate>
					</span>
				</div>
			</div>

			<a
				v-if="canRemoveChannel"
				v-app-tooltip="$gettext(`Remove Channel`)"
				class="-remove"
				@click.stop="onClickRemoveChannel(channel)"
			>
				<app-jolticon icon="remove" />
			</a>
		</div>

		<div v-if="canEditChannel" class="-controls">
			<app-button
				primary
				:to="{
					name: 'communities.view.edit.channels.overview',
					params: { channel: channel.title },
				}"
			>
				<translate>Edit</translate>
			</app-button>
		</div>
	</app-card-list-item>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-row
	display: flex
	align-items: center

	.-remove
		color: var(--theme-fg-muted)
		margin-left: auto

		&
		.jolticon
			cursor: pointer
			vertical-align: middle

		&:hover
			color: $white !important

.-channel-img-preview
	rounded-corners()
	display: flex
	align-items: center
	width: 96px
	height: 25px
	overflow: hidden

	> img
		width: 100%

.card-title
	margin-left: 16px
	margin-bottom: 0

	> *
		text-overflow()

.-controls
	margin-top: 8px
	padding-left: 112px
</style>
