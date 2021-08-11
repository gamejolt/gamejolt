<script lang="ts" src="./card"></script>

<template>
	<div class="-card">
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
				<template v-for="i in Providers">
					<app-share-card-tile :key="i" :model="model" :url="url" :provider="i" dense />
				</template>

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
	margin: $-base-padding $-base-padding $-base-padding ($-base-padding * 2)

.-card
	@extend .card
	background-color: var(--theme-bg-offset)
	padding: 0
	overflow: hidden

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
