<script lang="ts" src="./page-placeholder"></script>

<template>
	<section class="-section section-thin">
		<div class="container-xl">
			<div style="max-width: 650px; margin: 0 auto">
				<div class="-user-info">
					<div class="-avatar" />
					<div class="-name">
						<div class="-top lazy-placeholder" />
						<div class="-bottom lazy-placeholder" />
					</div>

					<div class="-controls">
						<div class="-follow lazy-placeholder" />
					</div>
				</div>

				<span class="lazy-placeholder" />
				<span class="lazy-placeholder" />
				<span class="lazy-placeholder" />
				<span class="lazy-placeholder" style="width: 40%" />
			</div>
		</div>
	</section>
</template>

<style lang="stylus" scoped>
@import '../_page/page'

.-top
	width: 80px
	height: $font-size-small
	margin-bottom: 4px

.-bottom
	width: 64px
	height: $font-size-tiny

.-follow
	width: 88px
	height: 36px
	margin-bottom: 0
</style>
