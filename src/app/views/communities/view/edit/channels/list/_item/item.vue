<script lang="ts" src="./item"></script>

<template>
	<app-card-list-item :item="channel" force-expandable-padding>
		<a
			v-if="canRemoveChannel"
			v-app-tooltip="$gettext(`Remove Channel`)"
			class="card-remove"
			@click.stop="onClickRemoveChannel(channel)"
		>
			<app-jolticon icon="remove" />
		</a>

		<div class="card-title">
			<div>
				<span v-if="channel.type === 'competition'" class="tag">
					<app-jolticon icon="jams" />
					<translate>Game Jam</translate>
				</span>
				<span v-if="channel.visibility === 'draft'" class="tag">
					<translate>Draft</translate>
				</span>
			</div>
			<div>
				<template v-if="channel.hasDisplayTitle">
					<b class="-title">{{ channel.displayTitle }}</b>
					<span class="hidden-xs">&nbsp;</span>
					<br class="visible-xs" />
					<span class="-path text-muted">{{ channel.title }}</span>
				</template>
				<template v-else>
					<b>{{ channel.title }}</b>
				</template>
			</div>
		</div>

		<div v-if="canEditChannel" class="-controls">
			<app-button
				primary
				:to="{
					name: 'communities.view.edit.channels.overview',
					params: { channel: channel.title },
				}"
			>
				<translate>Edit Channel</translate>
			</app-button>
		</div>
	</app-card-list-item>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-title
.-path
	text-overflow()
	display: inline-block
	max-width: 100%
</style>
