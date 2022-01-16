<script lang="ts">
import { Options, Vue } from 'vue-property-decorator';

@Options({})
export default class AppFooter extends Vue {}
</script>

<template>
	<div class="footer">
		<div class="links">
			<a class="link-muted" href="https://gamejolt.com/terms" target="_blank">Terms</a>
			&nbsp; &nbsp;
			<a class="link-muted" href="https://gamejolt.com/privacy" target="_blank">Privacy</a>
		</div>
		<div class="bolt">
			<a href="https://gamejolt.com" target="_blank">
				<span class="text">Powered by</span>
				<app-jolticon icon="gamejolt" />
				<span class="text right">Game Jolt</span>
			</a>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.footer
	clearfix()
	position: absolute
	bottom: $shell-padding
	left: $shell-padding
	right: $shell-padding

.links
.bolt
	position: absolute
	bottom: 0
	font-size: $font-size-small
	line-height: 1

.links
	left: 0

.bolt
	right: 0

	a
		theme-prop('color', 'fg-muted')
		display: inline-block

		&:hover
			theme-prop('color', 'link')

			.text
				opacity: 1

			.right
				max-width: 100px

	.jolticon
		margin: 0
		vertical-align: text-bottom

	.text
		theme-prop('color', 'fg-muted')
		display: inline-block
		font-family: $font-family-heading
		opacity: 0
		transition: opacity 1s, max-width 1s
		white-space: nowrap
		vertical-align: middle

	.right
		overflow: hidden
		max-width: 0
</style>
