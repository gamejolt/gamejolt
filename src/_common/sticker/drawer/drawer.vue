<script lang="ts" src="./drawer"></script>

<template>
	<div
		class="sticker-drawer anim-fade-in-up"
		:class="{ '-cbar-shifted': hasCbar }"
		@contextmenu.prevent
	>
		<div class="-drawer-outer" :style="styles.outer">
			<app-loading-fade :is-loading="isLoading">
				<component
					:is="drawerNavigationComponent"
					class="-scroller"
					:style="styles.dimensions"
					:pan-options="{ threshold: 16 }"
					@panstart="panStart"
					@pan="pan"
					@panend="panEnd"
				>
					<div
						ref="slider"
						class="-drawer-inner"
						:class="{ '-touch': !Screen.isPointerMouse }"
					>
						<template v-if="hasStickers">
							<template v-for="(sheet, index) in stickerSheets">
								<div :key="index" class="-sheet" :style="styles.sheet">
									<app-shell-bottom-drawer-item
										v-for="item of sheet"
										:key="item.sticker.id"
										:style="styles.stickers"
										:sticker="item.sticker"
										:count="item.count"
										:size="drawerStore.stickerSize"
										@mousedown.native="onMouseDown($event, item)"
										@touchstart.native="onTouchStart(item)"
									/>
								</div>
							</template>
						</template>
						<template v-else-if="drawerStore.hasLoaded">
							<div class="-no-stckers text-center">
								<p class="lead" style="padding: 0 16px">
									<translate>
										Oh no! Looks like you don't have any stickers.
									</translate>
								</p>
								<template v-if="drawerStore.hasLoaded">
									<template v-if="canPurchaseStickers">
										<app-button solid primary @click="onClickPurchase()">
											Get Stickers
										</app-button>
									</template>
									<p v-else>
										<translate>
											Use Game Jolt, like some posts, and you might get some.
										</translate>
									</p>
								</template>
							</div>
						</template>
						<template v-else>
							<div />
						</template>
					</div>
				</component>
			</app-loading-fade>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-loading
	margin: auto
	padding: 16px 0

.sticker-drawer
	position: fixed
	left: 0
	right: 0
	bottom: 0
	display: flex
	justify-content: center

	&.-cbar-shifted
		left: $shell-cbar-width

.-scroller
	height: 100%

.-drawer
	&-outer
		elevate-2()
		change-bg('bg')
		margin: 0 auto
		height: 100%
		overflow: hidden
		transition: transform 250ms $strong-ease-out

		@media $media-xs
			width: 100%

		@media $media-sm-up
			border-top-left-radius: $border-radius-large
			border-top-right-radius: $border-radius-large

	&-inner
		transition: transform 300ms $strong-ease-out

		&.-touch
			white-space: nowrap

.-sheet
	display: inline-flex
	justify-content: center
	flex-wrap: wrap
</style>
