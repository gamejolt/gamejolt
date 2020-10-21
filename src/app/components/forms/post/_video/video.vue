<script lang="ts" src="./video"></script>

<template>
	<app-loading-fade :is-loading="!isLoaded">
		<app-form-legend compact :deletable="!isUploading" @delete="onDisableVideo">
			<translate>Select Video</translate>
		</app-form-legend>

		<template v-if="!isUploading">
			<app-form ref="form" name="postVideoForm">
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
			<a class="small pull-right">
				<translate>Link YouTube Video instead</translate>
			</a>
		</template>
		<div v-else>
			<app-progress-bar
				:percent="progress * 100"
				:thin="uploadComplete"
				:indeterminate="uploadComplete"
				active
			/>

			<template v-if="!uploadComplete">
				<translate>Uploading…</translate>
				{{ progress | number({ style: 'percent' }) }}

				<app-button class="pull-right" @click="cancelUpload">
					<translate>Cancel Upload</translate>
				</app-button>
			</template>
		</div>
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
