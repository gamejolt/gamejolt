<script lang="ts" src="./card"></script>

<template>
	<div
		class="share-card card"
		:class="{ '-bleed-padding': bleedPadding, '-offset-color': offsetColor }"
	>
		<div class="-content">
			<h4 v-if="!hideHeading">
				<translate>Share</translate>
			</h4>

			<div class="-content-row">
				<input class="-url form-control" :value="url" />

				<app-button class="-copy" @click="copyLink()">
					<translate>Copy</translate>
				</app-button>
			</div>

			<div class="-content-row-lower">
				<app-share-card-tile
					v-for="i in providers"
					:key="i"
					:resource="resource"
					:url="url"
					:provider="i"
					dense
				/>

				<a class="-tile -dense" @click="openShareModal()">
					<app-jolticon class="-icon" icon="ellipsis-h" />
				</a>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import './common'
@import '../../card/card'

h4
	margin: $-base-padding
	margin-left: $-base-padding * 1.5
	color: var(--theme-fg)

.share-card
	background-color: var(--theme-bg)
	padding: 0
	overflow: hidden

	&.-offset-color
		background-color: var(--theme-bg-offset)

	&.-bleed-padding
		margin-left: -8px
		margin-right: -8px

.-content
	display: flex
	flex-direction: column
	overflow: hidden

.-content-row
.-content-row-lower
	display: inline-flex

.-content-row
	padding: $-base-padding
	grid-gap: $-base-padding

.-content-row-lower
	border-top: $-border

	> *
		&:not(&:last-of-type)
			border-right: $-border

.-url
	flex: auto
</style>
