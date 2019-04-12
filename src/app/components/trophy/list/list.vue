<template>
	<div class="trophy-list">
		<div class="trophy-list-item" v-for="trophy of trophies" :key="trophy.id">
			<div class="trophy-list-item-thumbnail">
				<app-trophy-thumbnail :trophy="trophy" :is-achieved="!!achievedIndexed[trophy.id]" />
			</div>

			<div class="trophy-list-item-content">
				<h4 class="trophy-list-item-heading sans-margin">
					{{ trophy.title }}
				</h4>

				<!--
				We have to keep the trophy description secret unless they've achieved it, or if they're the dev.
				The API should return garbage for the description, so let's put our own text in there.
			-->
				<div
					class="trophy-list-item-description small"
					v-if="!trophy.secret || achievedIndexed[trophy.id]"
				>
					{{ trophy.description }}
				</div>

				<div class="trophy-list-item-description small text-muted" v-else>
					<em>
						<translate>Achieve this trophy to view the description.</translate>
					</em>
				</div>

				<div class="trophy-list-item-meta">
					<span v-app-tooltip="$gettext(`trophies.exp_gained_tooltip`)" class="text-muted">
						<app-jolticon icon="exp" class="middle" />
						{{ trophy.experience | number }}
						<translate class="small">leveling.exp</translate>
					</span>

					<template v-if="achievedIndexed[trophy.id]">
						<span class="dot-separator hidden-xs"></span>
						<br class="visible-xs" />

						<span class="tag tag-highlight">
							<translate>trophies.achieved_tag</translate>
						</span>
						<span class="dot-separator"></span>
						<small class="text-muted">
							<app-time-ago :date="achievedIndexed[trophy.id].logged_on" />
						</small>
					</template>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

$trophy-list-thumbnail-size-xs = 70px
$trophy-list-thumbnail-size = 100px
$trophy-list-gutter-xs = ($grid-gutter-width-xs / 2)
$trophy-list-gutter = ($grid-gutter-width / 2)

.trophy-list-item
	clearfix()

.trophy-list-item + .trophy-list-item
	margin-top: $line-height-computed

.trophy-list-item-thumbnail
	float: left
	width: $trophy-list-thumbnail-size-xs

.trophy-list-item-content
	margin-left: $trophy-list-thumbnail-size-xs + $trophy-list-gutter-xs

@media $media-sm-up
	.trophy-list-item-thumbnail
		width: $trophy-list-thumbnail-size

	.trophy-list-item-content
		margin-left: $trophy-list-thumbnail-size + $trophy-list-gutter

	.trophy-list-item-description
		margin-bottom: $font-size-base
</style>

<script lang="ts" src="./list"></script>
