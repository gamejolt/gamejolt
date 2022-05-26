<script lang="ts" setup>
import AppButtonPlaceholder from '../../button/AppButtonPlaceholder.vue';
</script>

<template>
	<div class="user-card sheet sheet-full">
		<div class="-user-info">
			<div class="-header" />

			<!-- Need to do the fill-darker here for the offset color to be for dark offset -->
			<div class="-avatar fill-darker" />

			<div class="-well fill-bg">
				<div class="-display-name">
					<span class="-placeholder-large" style="width: 100px" />
				</div>
				<div class="-username">
					<span class="-placeholder-small" style="width: 70px" />
				</div>

				<div class="-follow-counts small">
					<span class="-placeholder-small" style="width: 50px" />
					<span class="dot-separator" />
					<span class="-placeholder-small" style="width: 50px" />
				</div>

				<div class="-follow">
					<AppButtonPlaceholder block />
				</div>
			</div>
		</div>

		<!-- No need for stats -->
	</div>
</template>

<style lang="stylus" scoped>
@import './common'

.-avatar
	change-bg('bg-subtle')

.-placeholder-large
	lazy-placeholder-inline()
	height: $font-size-large

.-placeholder-small
	lazy-placeholder-inline()
	height: $font-size-small
</style>
