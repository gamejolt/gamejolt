<template>
	<transition appear>
		<div
			class="-container"
			role="dialog"
			tabindex="-1"
			:style="{
				'z-index': zIndex,
			}"
			@click="dismissBackdrop"
		>
			<app-scroll-scroller
				class="modal"
				:class="{
					'modal-sm': modal.size === 'sm',
					'modal-lg': modal.size === 'lg',
					'modal-full': modal.size === 'full',
				}"
				ref="scroller"
			>
				<app-theme
					class="modal-content"
					:theme="theme"
					@mouseover.native="isHoveringContent = true"
					@mouseout.native="isHoveringContent = false"
				>
					<slot />

					<app-scroll-affix v-if="hasFooter" anchor="bottom">
						<div class="-footer fill-offset">
							<slot name="footer" />
						</div>
					</app-scroll-affix>
				</app-theme>
			</app-scroll-scroller>
		</div>
	</transition>
</template>

<style lang="stylus" src="./modal.styl" scoped></style>

<script lang="ts" src="./modal"></script>
