<script lang="ts" src="./video"></script>

<template>
	<app-loading-fade :is-loading="!isLoaded">
		<template v-if="shouldShowFormPlaceholder">
			<app-form-legend compact :deletable="canRemoveUploadingVideo">
				<span class="-placeholder-text" style="width: 60px" />
			</app-form-legend>
			<p class="help-block">
				<span class="-placeholder-text" style="width: 230px" />
				<br />
				<span class="-placeholder-text" style="width: 310px" />
				<br />
				<span class="-placeholder-text" style="width: 190px" />
			</p>
			<span class="-placeholder-add" />
		</template>
		<template v-else-if="videoProvider === FiresidePostVideo.PROVIDER_GAMEJOLT">
			<app-form-legend compact :deletable="canRemoveUploadingVideo" @delete="onDeleteUpload">
				<translate>Video</translate>
			</app-form-legend>

			<template v-if="videoStatus === 'idle'">
				<app-form :controller="form">
					<app-form-group
						name="video"
						class="sans-margin-bottom"
						hide-label
						optional
						:label="$gettext(`Video`)"
					>
						<p class="help-block">
							<translate>
								Your video must be between 1 second and 15 minutes long.
							</translate>
							<br />
							<translate> Videos must be bigger than 200x200. </translate>
							<translate> Video filetypes currently supported: </translate>
							<span
								v-for="filetype of allowedFiletypes"
								:key="filetype"
								style="margin-right: 2px"
							>
								<code>{{ filetype }}</code>
							</span>
						</p>

						<div
							@dragover="onDragOver($event)"
							@dragleave="onDragLeave()"
							@drop="onDrop($event)"
						>
							<a
								class="-add"
								:class="{
									'-drop-active': isDropActive,
								}"
								@click="showSelectVideo()"
							>
								<div class="-add-inner">
									<div>
										<app-jolticon icon="add" big />
										<br />
										<b>
											<translate>Video</translate>
										</b>
									</div>
								</div>
							</a>
						</div>

						<app-form-control-upload
							ref="upload"
							class="-upload-input"
							:validators="[validateFilesize(maxFilesize)]"
							:accept="allowedFiletypesString"
							@changed="videoSelected()"
						/>

						<app-form-control-errors />
					</app-form-group>
				</app-form>
			</template>
			<template v-else-if="videoStatus === 'uploading'">
				<app-progress-bar :percent="uploadProgress * 100" />

				<translate>Uploading...</translate>
				{{ formatNumber(uploadProgress, { style: 'percent' }) }}

				<app-button
					class="pull-right"
					trans
					:disabled="uploadProgress === 1"
					@click="cancelUpload"
				>
					<translate>Cancel Upload</translate>
				</app-button>
			</template>
			<template v-else-if="videoStatus === 'processing'">
				<app-video-processing-progress
					:post="post"
					@complete="onProcessingComplete"
					@error="onProcessingError"
				/>
			</template>
			<template v-else-if="videoStatus === 'complete'">
				<app-video-player
					class="-video-player"
					:media-item="videoMediaItem"
					:manifests="videoManifestSources"
				/>
			</template>
		</template>
	</app-loading-fade>
</template>

<style lang="stylus" scoped>
@import '../_media/variables'

.-placeholder-text
	lazy-placeholder-inline()

.-placeholder-add
	lazy-placeholder-block()
	width: $-height + $border-width-large
	height: $-height + $border-width-large

.-add
	rounded-corners-lg()
	theme-prop('border-color', 'bg-subtle')
	display: inline-block
	vertical-align: top
	text-align: center
	border-width: $border-width-large
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

.-video-embed
	rounded-corners-lg()
	overflow: hidden
</style>
