<script lang="ts" src="./drawer"></script>

<template>
	<div
		class="sticker-drawer"
		:class="{ '-cbar-shifted': hasCbar, '-touch': !Screen.isPointerMouse }"
		:style="styles.shell"
		@contextmenu.prevent
		@mousemove="onMouseMove"
		@mouseup="resetTouchedSticker()"
		@touchend="resetTouchedSticker()"
	>
		<div ref="content" class="-drawer-outer anim-fade-in-up" :style="styles.outer">
			<component
				:is="Screen.isPointerMouse ? 'app-scroll-scroller' : 'div'"
				:style="styles.dimensions"
			>
				<app-loading-fade :is-loading="isLoading">
					<template v-if="hasHalloweenStickers">
						<div class="-halloween-text" :style="styles.halloweenText">
							<b>Trick or treat on Game Jolt with candy stickers!</b>
						</div>
					</template>
					<component
						:is="drawerNavigationComponent"
						class="-scroller"
						v-bind="drawerNavigationProps"
						@panstart="panStart"
						@pan="pan"
						@panend="panEnd"
					>
						<div ref="slider" class="-drawer-inner">
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
											@mousedown.native="assignTouchedSticker(item)"
											@touchstart.native="assignTouchedSticker(item)"
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
												Use Game Jolt, like some posts, and you might get
												some.
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
					<div v-if="!Screen.isPointerMouse">
						<app-event-item-media-indicator
							:count="stickerSheets.length"
							:current="sheetPage"
						/>
					</div>
				</app-loading-fade>
			</component>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-touch
	.-drawer-inner
		white-space: nowrap

	.-sheet
		display: inline-flex

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
	transition: transform 250ms $strong-ease-out

	&.-cbar-shifted
		left: $shell-cbar-width

.-scroller
	height: 100%

.-halloween-text
	font-size: $font-size-small
	text-align: center
	height: 15px

.-drawer
	&-outer
		elevate-2()
		change-bg('bg')
		margin: 0 auto
		height: 100%
		overflow: hidden

		@media $media-xs
			width: 100%

		@media $media-sm-up
			border-top-left-radius: $border-radius-large
			border-top-right-radius: $border-radius-large

	&-inner
		transition: transform 300ms $strong-ease-out

.-sheet
	display: flex
	justify-content: center
	flex-wrap: wrap
</style>
