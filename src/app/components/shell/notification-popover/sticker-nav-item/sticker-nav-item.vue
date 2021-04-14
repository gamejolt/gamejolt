<script lang="ts" src="./sticker-nav-item"></script>

<template>
	<div>
		<router-link :to="{ name: 'dash.stickers' }">
			<div class="-item">
				<app-timeline-list-item>
					<template #bubble>
						<div class="-icon-container">
							<app-jolticon icon="sticker" :big="hasNew" :highlight="hasNew" />
						</div>
					</template>

					<div class="timeline-list-item-title timeline-list-item-title-small -title">
						<translate
							:translate-n="stickerCount"
							:translate-params="{ count: fuzzynumber(stickerCount) }"
							translate-plural="You have %{ count } stickers."
						>
							You have %{ count } sticker.
						</translate>
					</div>
				</app-timeline-list-item>

				<div v-if="hasNew" class="-actions">
					<span v-app-tooltip="$gettext(`View newly unlocked stickers`)" class="-icon" />
				</div>
			</div>
		</router-link>

		<div class="timeline-list-item-split" />
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-item
	display: flex
	justify-content: space-between
	margin-bottom: 8px

.-icon-container
	position: absolute
	width: 100%
	height: 100%
	top: 0
	left: 0
	display: flex
	justify-content: center
	align-items: center

.-icon
	display: block
	width: 12px
	height: 12px
	border-radius: 50%
	background-color: var(--theme-highlight)
	margin-right: 4px

.-actions
	margin-top: 18px
	margin-left: 10px

.-title
	margin-top: 14px
</style>
