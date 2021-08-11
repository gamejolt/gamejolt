<script lang="ts" src="./media"></script>

<template>
	<app-loading-fade :is-loading="isLoading">
		<app-form ref="form" name="postMediaForm">
			<app-form-group
				name="image"
				class="sans-margin-bottom"
				hide-label
				optional
				:label="$gettext(`Image`)"
			>
				<p class="help-block">
					<translate>Your image must be a PNG, JPG, or GIF.</translate>
					<br />
					<b><translate>Animated GIFs are supported.</translate></b>
				</p>

				<app-scroll-scroller horizontal thin>
					<div
						class="-items"
						@dragover="onDragOver($event)"
						@dragleave="onDragLeave()"
						@drop="onDrop($event)"
					>
						<a
							class="-add"
							:class="{
								'-drop-active': isDropActive,
							}"
							@click="showSelectMedia()"
						>
							<div class="-add-inner">
								<div>
									<app-jolticon icon="add" big />
									<br />
									<b>
										<translate>Images/GIFs</translate>
									</b>
								</div>
							</div>
						</a>

						<draggable
							v-model="internalItems"
							style="display: inline-flex"
							:options="{ delay: 100, delayOnTouchOnly: true }"
						>
							<div v-for="item of internalItems" :key="item.id" class="-item">
								<app-form-post-media-item :item="item" @remove="emitRemove(item)" />
							</div>
						</draggable>
					</div>
				</app-scroll-scroller>

				<app-form-control-upload
					ref="upload"
					class="-upload-input"
					:rules="{
						filesize: maxFilesize,
						max_img_dimensions: [maxWidth, maxHeight],
					}"
					accept=".png,.jpg,.jpeg,.gif,.webp"
					multiple
					@changed="mediaSelected()"
				/>

				<app-form-control-errors />
			</app-form-group>
		</app-form>
	</app-loading-fade>
</template>

<style lang="stylus" scoped>
@import './variables'
@import '~styles-lib/mixins'

.-items
	white-space: nowrap
	// Only put padding once so that it only pads the bottom.
	height: $-padding + $-height

.-item
	margin-right: 20px

	&:last-child
		margin-right: 0

.-add
	rounded-corners-lg()
	theme-prop('border-color', 'bg-subtle')
	display: inline-block
	vertical-align: top
	text-align: center
	border-width: 2px
	border-style: dashed
	margin-right: $-padding
	transition: border-color 0.1s ease

	&:hover
	&.-drop-active
		theme-prop('border-color', 'link')
		theme-prop('color', 'link')

	&.-drop-active
		border-style: solid

.-add-inner
	display: flex
	align-items: center
	justify-content: center
	width: $-height
	height: $-height

.-upload-input
	display: none
</style>
