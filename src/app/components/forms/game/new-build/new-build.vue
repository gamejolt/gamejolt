<template>
	<app-form class="game-new-build-form" name="newBuildForm" ref="form">
		<!--
		Can only add files. Can't edit builds anymore.
		They need to release a new version to do that.
	-->
		<app-form-group
			name="file"
			:label="$gettext('Upload File')"
			:hide-label="true"
			:optional="true"
		>
			<app-form-control-upload
				:rules="{
					filesize: maxFilesize,
				}"
				:accept="uploadAccept"
				@changed="submit"
			/>

			<app-form-control-errors :label="$gettext(`dash.games.builds.form.file_error_label`)" />

			<app-expand :when="hasBrowserTypeError">
				<br />
				<div class="alert alert-notice sans-margin-bottom">
					<translate>
						You can't upload multiple browser builds of the same type into the same release. If
						you're trying to update your build, add a new release first.
					</translate>
				</div>
			</app-expand>

			<p class="help-block" v-if="type === 'browser'">
				<translate>
					For HTML builds, upload a .zip archive containing all of your build's files and assets.
					There must be an index.html file in the root folder.
				</translate>
			</p>
		</app-form-group>
	</app-form>
</template>

<script lang="ts" src="./new-build"></script>
