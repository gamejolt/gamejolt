<script lang="ts" src="./chunk-placeholder"></script>

<template>
	<div class="community-chunk">
		<div class="-header">
			<div class="-header-lead">
				<div class="-thumbnail">
					<div class="-thumbnail-inner" />
				</div>

				<div class="-header-details">
					<div class="-header-name" />
					<div class="-header-members" />
				</div>
			</div>

			<div class="-header-button" />
		</div>

		<component
			:is="Screen.isXs ? 'app-scroll-scroller' : 'div'"
			:horizontal="Screen.isXs"
			:thin="Screen.isXs"
		>
			<div class="-content" :class="{ '-scrollable': Screen.isXs }">
				<template v-for="(item, index) of preferredCardsPerRow">
					<div :key="item" class="-card">
						<app-post-card-placeholder />
					</div>

					<div
						:key="'spacer-' + index"
						:class="{
							'-spacer': index + 1 < preferredCardsPerRow,
							'-spacer-large': index + 1 === preferredCardsPerRow && Screen.isXs,
						}"
					/>
				</template>
			</div>
		</component>
	</div>
</template>

<style lang="stylus" scoped>
@import './chunk'

.-thumbnail-inner
	background-color: var(--theme-bg-subtle)

.-header-name
.-header-members
.-header-button
	lazy-placeholder-block()

.-header-name
	width: $-avatar-size * 2
	margin-bottom: 8px

.-header-members
	width: 75%

.-header-button
	width: $-avatar-size * 2.4
	height: $input-height-base * 1.25
</style>
