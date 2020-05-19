<template>
	<div
		:id="popperId"
		class="v-popover"
		:class="triggerClass"
		ref="trigger"
		@click="onTriggerClicked"
		@contextmenu="onContextMenu"
	>
		<slot />
		<div
			v-if="isVisible"
			class="popper"
			:class="{ '-hide': isHiding, '-ssr': GJ_IS_SSR }"
			ref="popper"
		>
			<div class="popper-arrow" data-popper-arrow />
			<div
				class="popper-content"
				:class="contentClass"
				:style="{
					maxHeight,
					width,
					maxWidth,
				}"
			>
				<div class="-header">
					<slot name="header" />
				</div>
				<app-scroll-scroller ref="scroller" class="-main" thin>
					<slot name="popover" />
				</app-scroll-scroller>
				<div class="-footer">
					<slot name="footer" />
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.popper-content
	display: flex
	flex-direction: column
</style>

<script lang="ts" src="./popper"></script>
