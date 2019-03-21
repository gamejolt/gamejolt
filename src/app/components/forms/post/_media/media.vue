<template>
	<app-loading-fade :is-loading="isLoading">
		<app-form name="postMediaForm" ref="form">
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

				<app-scroll-scroller overlay horizontal>
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

						<draggable style="display: inline-block" v-model="internalItems">
							<app-form-post-media-item
								class="-item"
								v-for="item of internalItems"
								:key="item.id"
								:item="item"
								@remove="emitRemove(item)"
							/>
						</draggable>
					</div>
				</app-scroll-scroller>

				<app-form-control-upload
					class="-upload-input"
					ref="upload"
					:rules="{
						filesize: maxFilesize,
						max_img_dimensions: [maxWidth, maxHeight],
					}"
					accept=".png,.jpg,.jpeg,.gif"
					multiple
					@changed="mediaSelected()"
				/>

				<app-form-control-errors />
			</app-form-group>
		</app-form>
	</app-loading-fade>
</template>

<style lang="stylus" scoped>
@require './variables'
@require '~styles-lib/mixins'

.-items
	white-space: nowrap
	// Only put padding once so that it only pads the bottom.
	height: $-padding + $-height

.-add
	rounded-corners()
	theme-prop('border-color', 'bg-subtle')
	display: inline-block
	vertical-align: top
	text-align: center
	border-width: 2px
	border-style: dashed
	margin-right: $-padding

	&:hover, &.-drop-active
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

<script lang="ts" src="./media" />
