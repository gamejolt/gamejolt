<script lang="ts" src="./fireside"></script>

<template>
	<app-loading-fade :is-loading="isLoading">
		<div class="-header">
			<h4 class="section-header" :class="{ h6: Screen.isXs }">
				<translate>Firesides</translate>
			</h4>
			<span class="help-inline">
				<a class="link-unstyled" @click="emitRequestRefresh()">
					<translate>Refresh</translate>
				</a>
			</span>
		</div>

		<div class="-list">
			<component
				:is="shouldDisplaySingleRow ? 'app-scroll-scroller' : 'div'"
				:class="{ '-scroller': shouldDisplaySingleRow }"
				horizontal
			>
				<div :class="{ '-scroller-inner': shouldDisplaySingleRow }">
					<div v-if="showPlaceholders" key="placeholders" :style="gridStyling">
						<app-fireside-avatar-base
							v-for="i of gridColumns"
							:key="i"
							is-placeholder
						/>
					</div>
					<div v-else key="list" :style="gridStyling">
						<app-fireside-avatar-add v-if="!userFireside" key="add" />
						<app-fireside-avatar
							v-for="fireside of displayFiresides"
							:key="fireside.id"
							:fireside="fireside"
							@expired="onFiresideExpired()"
						/>
					</div>
				</div>
			</component>
		</div>
	</app-loading-fade>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-header
	display: flex
	justify-content: space-between
	align-items: center
	margin-bottom: ($line-height-computed / 2)

	h4
		margin-bottom: 0

.-scroller
	@media $media-xs
		full-bleed-xs()

		.-scroller-inner
			padding: 0 ($grid-gutter-width-xs / 2)

	@media $media-sm-up
		full-bleed()

		.-scroller-inner
			padding: 0 ($grid-gutter-width / 2)

.-scroller-inner
	display: inline-block
	width: 100%

.-list
	margin-bottom: $line-height-computed
</style>
