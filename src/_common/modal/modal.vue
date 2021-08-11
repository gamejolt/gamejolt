<script lang="ts" src="./modal"></script>

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
				ref="scroller"
				class="modal"
				:class="{
					'modal-sm': modal.size === 'sm',
					'modal-lg': modal.size === 'lg',
					'modal-full': modal.size === 'full',
				}"
			>
				<component :is="!drawer ? 'div' : 'app-sticker-layer'" class="modal-sticker-layer">
					<app-theme
						class="modal-content"
						:theme="theme"
						@mouseover="isHoveringContent = true"
						@mouseout="isHoveringContent = false"
					>
						<slot />

						<app-scroll-affix v-if="hasFooter" anchor="bottom">
							<div class="-footer fill-offset">
								<slot name="footer" />
							</div>
						</app-scroll-affix>
					</app-theme>
				</component>
			</app-scroll-scroller>
		</div>
	</transition>
</template>

<style lang="stylus" src="./modal.styl" scoped></style>
