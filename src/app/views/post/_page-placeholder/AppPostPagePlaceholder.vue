<script lang="ts" setup>
import { styleChangeBg } from '../../../../_styles/mixins';
</script>

<template>
	<section class="-section section-thin">
		<div class="container-xl">
			<div class="-col-primary">
				<div class="-user-info">
					<div
						class="-avatar"
						:style="{
							...styleChangeBg('bg-subtle'),
							borderRadius: `50%`,
						}"
					/>
					<div class="-name">
						<div class="-name-top lazy-placeholder" />
						<div class="-name-bottom lazy-placeholder" />
					</div>

					<div class="-follow lazy-placeholder" />
				</div>

				<span class="lazy-placeholder" />
				<span class="lazy-placeholder" />
				<span class="lazy-placeholder" />
				<p>
					<span class="lazy-placeholder" style="width: 40%" />
				</p>

				<div class="page-cut" />

				<span class="lazy-placeholder" />
				<span class="lazy-placeholder" />
				<p>
					<span class="lazy-placeholder" style="width: 70%" />
				</p>
			</div>
		</div>
	</section>
</template>

<style lang="stylus" scoped>
@import '../variables'
@import '../common'

.-col-primary
	max-width: $-center-col-max-width
	margin: 0 auto

.-name
	margin-right: auto

.-name-top
	width: 80px
	height: $font-size-small
	margin-bottom: 4px

.-name-bottom
	width: 64px
	height: $font-size-tiny

.-follow
	width: 88px
	height: 36px
</style>
