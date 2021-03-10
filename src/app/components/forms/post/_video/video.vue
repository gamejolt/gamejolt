<script lang="ts" src="./video"></script>

<template>
	<app-loading-fade :is-loading="!isLoaded">
		<template v-if="shouldShowFormPlaceholder">
			<app-form-legend compact :deletable="canRemoveUploadingVideo">
				<span class="lazy-placeholder" style="width: 60px" />
			</app-form-legend>
			<p class="help-block">
				<span class="lazy-placeholder" style="width: 230px" />
				<br />
				<span class="lazy-placeholder" style="width: 310px" />
			</p>
			<span class="-placeholder-add" />
			<div class="text-right">
				<span class="-placeholder-button" style="width: 180px" />
			</div>
		</template>
		<template v-else-if="videoProvider === FiresidePostVideo.PROVIDER_GAMEJOLT">
			<app-form-legend compact :deletable="canRemoveUploadingVideo" @delete="onDeleteUpload">
				<translate>Video</translate>
			</app-form-legend>

			<template v-if="videoStatus === 'idle'">
				<app-form ref="form" name="postVideoGameJoltForm">
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
							<translate>
								Videos must be bigger than 200x200.
							</translate>
							<translate>
								Video filetypes currently supported:
							</translate>
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
							:rules="{
								filesize: maxFilesize,
							}"
							:accept="allowedFiletypesString"
							@changed="videoSelected()"
						/>

						<app-form-control-errors />
					</app-form-group>
				</app-form>

				<div v-if="!wasPublished" class="text-right">
					<app-button trans @click="setVideoProvider(FiresidePostVideo.PROVIDER_YOUTUBE)">
						<translate>Add YouTube video instead</translate>
					</app-button>
				</div>
			</template>
			<template v-else-if="videoStatus === 'uploading'">
				<app-progress-bar :percent="uploadProgress * 100" />

				<translate>Uploading...</translate>
				{{ number(uploadProgress, { style: 'percent' }) }}

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
		<template v-else-if="videoProvider === FiresidePostVideo.PROVIDER_YOUTUBE">
			<app-form-legend compact deletable @delete="emitDelete">
				<translate>YouTube video URL</translate>
			</app-form-legend>

			<app-form name="postVideoYouTubeForm">
				<app-form-group
					v-app-focus-when="!wasPublished"
					name="video_url"
					hide-label
					:label="$gettext(`YouTube Video URL`)"
				>
					<p class="help-block">
						<translate>Enter the URL of your YouTube video. For example:</translate>
						<code>https://www.youtube.com/watch?v=dQw4w9WgXcQ</code>
					</p>

					<app-form-control
						type="text"
						:rules="{
							pattern: YOUTUBE_URL_REGEX,
						}"
					/>

					<app-form-control-errors />

					<template v-if="hasValidYouTubeUrl">
						<br />
						<app-video-embed
							class="-video-embed"
							:video-provider="FiresidePostVideo.PROVIDER_YOUTUBE"
							:video-id="youtubeVideoId"
						/>
					</template>
				</app-form-group>
			</app-form>

			<div v-if="!wasPublished" class="text-right">
				<app-button trans @click="setVideoProvider(FiresidePostVideo.PROVIDER_GAMEJOLT)">
					<translate>Upload video instead</translate>
				</app-button>
			</div>
		</template>
	</app-loading-fade>
</template>

<style lang="stylus" scoped>
@import '../_media/variables'
@import '~styles-lib/mixins'

.-placeholder-add
	lazy-placeholder-block()
	width: $-height + $border-width-large
	height: $-height + $border-width-large

.-placeholder-button
	lazy-placeholder-inline()
	height: $button-md-line-height

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
