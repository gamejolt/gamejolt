<script lang="ts" src="./thumbnail"></script>

<template>
	<div class="-container">
		<router-link :to="game.routeLocation">
			<div @click.prevent="onClickThumbnail">
				<div class="-thumb">
					<app-game-thumbnail-img :game="game" class="-game-img" />

					<div class="-inner">
						<div class="-rank">Overall Rank <b>#1</b></div>
						<div v-if="shouldShowRemove" class="-remove">
							<app-button
								v-app-tooltip="$gettext(`Remove Entry`)"
								icon="remove"
								sparse
								circle
								overlay
								@click.stop.prevent="onClickRemove"
							/>
						</div>
					</div>
				</div>
				<div class="-meta">
					<div class="-title-data">
						<span class="-title" :title="game.title">
							<b>{{ game.title }}</b>
						</span>
					</div>
					<div class="-author-data">
						<span
							v-translate="{ name: entry.user.display_name }"
							class="text-muted -author"
						>
							by %{ name }
						</span>
					</div>
				</div>
			</div>
		</router-link>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-container
	margin-bottom: 24px

.-thumb
	position: relative
	rounded-corners-lg()

	&:hover
		.-rank
			opacity: 0.25

		.-game-img
			elevate-2()

.-game-img
	elevate-0()

.-inner
	position: absolute
	rounded-corners-lg()
	overflow: hidden
	top: 0
	left: 0
	right: 0
	bottom: 0

.-rank
	position: absolute
	background-color: rgba(0, 0, 0, 0.5)
	backdrop-filter: blur(3px)
	color: white
	bottom: 0
	left: 0
	right: 0
	padding-top: 4px
	padding-bottom: 4px
	padding-left: 8px
	padding-right: 8px
	transition: opacity 0.1s ease

.-remove
	position: absolute
	right: 8px
	top: 8px

.-meta
	padding: 4px

.-title-data
	display: flex

.-title
	font-size: $font-size-large
	transition: color 0.1s ease
	text-overflow()

.-author-data
	display: flex

.-author
	text-overflow()
</style>
