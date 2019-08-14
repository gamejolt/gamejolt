<template>
	<div>
		<section class="container error-page" v-if="error">
			<div class="ararat">
				<img src="./ararat.png" :width="416 / 2" :height="760 / 2" alt="" />
			</div>
			<component :is="page" />
			<br />
		</section>
		<template v-else>
			<slot />
		</template>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.error-page
	text-align: center

	.ararat
		margin-top: -190px
		margin-bottom: $grid-gutter-width

		@media $media-xs
			margin-bottom: $grid-gutter-width-xs

		> img
			display: block
			margin: 0 auto
</style>

<script lang="ts" src="./page"></script>
