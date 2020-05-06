<template>
	<div :id="popperId" class="v-popover" ref="popover" @click="onShow">
		<slot />
		<div
			v-if="isVisible"
			class="-container popper-content"
			ref="popper"
			:style="{
				maxHeight,
				width,
				maxWidth,
			}"
		>
			<div class="-header">
				<slot name="header" />
			</div>
			<app-scroll-scroller ref="scroller" class="-main" overlay>
				<slot name="popover" />
			</app-scroll-scroller>
			<div class="-footer">
				<slot name="footer" />
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-container
	display: flex
	flex-direction: column
	position: absolute

.-header, .-footer
	flex: none

.-main
	flex: auto
</style>

<script lang="ts" src="./popover"></script>
