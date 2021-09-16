<script lang="ts" src="./fireside"></script>

<template>
	<app-loading-fade :is-loading="isLoading">
		<div class="-header">
			<h4 class="section-header">
				<translate>Firesides</translate>
			</h4>
			<span class="help-inline">
				<a class="link-unstyled" @click="emitRequestRefresh()">
					<translate>Refresh</translate>
				</a>
			</span>
		</div>
		<p>
			<small>
				<translate>Hang out with your followers in temporary pop-up chats</translate>
			</small>
		</p>

		<app-fireside-badge-placeholder v-if="showPlaceholders" />
		<div v-else class="-list">
			<app-fireside-badge-add v-if="!userFireside" />

			<template v-if="displayFiresides.length">
				<hr v-if="!userFireside" />
				<component
					:is="shouldDisplaySingleRow ? 'app-scroll-scroller' : 'div'"
					:class="{ '-scroller': shouldDisplaySingleRow }"
					horizontal
				>
					<div :class="{ '-scroller-inner': shouldDisplaySingleRow }">
						<div :style="gridStyling">
							<app-fireside-avatar
								v-for="fireside of displayFiresides"
								:key="fireside.id"
								:fireside="fireside"
								@expired="onFiresideExpired()"
							/>
						</div>
					</div>
				</component>
			</template>
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

.-list
	margin-bottom: $line-height-computed
</style>
