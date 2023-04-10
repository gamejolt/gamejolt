<script lang="ts" setup>
import AppScrollAffix from '../scroll/AppScrollAffix.vue';
</script>

<template>
	<AppScrollAffix class="modal-floating-header" anchor="top" :offset-top="0" :padding="0">
		<div class="modal-controls">
			<slot name="modal-controls" />
		</div>

		<div class="-floating-top">
			<div class="-sans-padding-horizontal modal-header">
				<h2 class="modal-title">
					<div class="-title">
						<slot name="title" />
					</div>
				</h2>
			</div>

			<slot name="bottom" />
		</div>
	</AppScrollAffix>
</template>

<style lang="stylus" scoped>
.modal-floating-header
	--float-padding: ($grid-gutter-width-xs / 2)

	@media $media-sm-up
		--float-padding: ($grid-gutter-width / 2)

	.-floating-top
		background-color: var(--theme-bg-actual)
		transition: box-shadow 300ms $strong-ease-out
		padding: 0 var(--float-padding)

	::v-deep(.gj-scroll-affixed)
		z-index: 3

		.modal-controls
			padding-left: @padding-right
			background-color: var(--theme-bg-actual)
			position: relative
			z-index: 2

		.-floating-top
			box-shadow: 0 5px 10px rgba(0, 0, 0, 0.5)
			z-index: 1

.modal-controls
	padding-left: var(--float-padding)
	display: flex
	justify-content: flex-end

.-sans-padding-horizontal
	padding-left: 0
	padding-right: 0
</style>
