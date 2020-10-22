<script lang="ts" src="./video"></script>

<template>
	<app-loading-fade :is-loading="!isLoaded">
		<template v-if="videoProvider === FiresidePostVideo.PROVIDER_GAMEJOLT">
			<app-form-legend compact :deletable="canRemoveUploadingVideo" @delete="onDeleteUpload">
				<translate>Select Video</translate>
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
							<translate>Your video must be a real deal.</translate>
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
							accept=".mp4"
							@changed="videoSelected()"
						/>
					</app-form-group>
				</app-form>

				<br />
				<a
					class="small pull-right"
					@click="setVideoProvider(FiresidePostVideo.PROVIDER_YOUTUBE)"
				>
					<translate>Link YouTube Video instead</translate>
				</a>
			</template>

			<div v-else-if="videoStatus === 'uploading'">
				<app-progress-bar :percent="uploadProgress * 100" />

				<translate>Uploading…</translate>
				{{ number(uploadProgress, { style: 'percent' }) }}

				<app-button class="pull-right" @click="cancelUpload">
					<translate>Cancel Upload</translate>
				</app-button>
			</div>

			<div v-else-if="videoStatus === 'processing'">
				<app-progress-bar :percent="processingProgress * 100" thin indeterminate active />

				<span>
					{{ processingStepDisplay }}
					{{ number(processingProgress, { style: 'percent' }) }}
				</span>

				<div v-if="processingProgressData.videoPosterImgUrl" class="-video-poster-preview">
					<!-- <app-img-responsive
						:src="processingProgressData.videoPosterImgUrl"
						:style="{
							filter: videoPosterFilterValue,
						}"
					/> -->
					<img
						:src="processingProgressData.videoPosterImgUrl"
						:style="{
							filter: videoPosterFilterValue,
						}"
					/>

					<div class="-video-poster-preview-icon-container">
						<app-jolticon icon="video" big class="-poster-icon" />
					</div>
				</div>
				<div v-else class="-video-poster-preview -no-poster">
					<app-jolticon icon="video" big class="-poster-icon" />
				</div>
			</div>

			<div v-else-if="videoStatus === 'complete'">
				<app-video-player :poster="videoPoster" :manifests="videoManifestUrls" />
			</div>
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

			<a
				class="small pull-right"
				@click="setVideoProvider(FiresidePostVideo.PROVIDER_GAMEJOLT)"
			>
				<translate>Upload Video instead</translate>
			</a>
		</template>
	</app-loading-fade>
</template>

<style lang="stylus" scoped>
@import '../_media/variables'
@import '~styles-lib/mixins'

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

.-video-embed
	rounded-corners-lg()
	overflow: hidden

.-video-poster-preview
	change-bg('bg-subtle')
	rounded-corners-lg()
	overflow: hidden
	margin-top: 16px
	position: relative

	img
		transition: filter 0.5s ease

	&-icon-container
		position: absolute
		left: 0
		top: 0
		right: 0
		bottom: 0
		display: flex
		justify-content: center
		align-items: center

.-no-poster
	height: 240px
	filter: none
	display: flex
	justify-content: center
	align-items: center

.-poster-icon
	filter: drop-shadow(0 0 5px rgba(0, 0, 0, 1))
</style>
