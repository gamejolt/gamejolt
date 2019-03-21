<template>
	<app-form class="form-dash-site-build" name="siteBuildForm" ref="form">
		<app-form-group name="file" :hide-label="true">
			<p class="help-block">
				<translate
					:translate-params="{
						maxFilesize: maxFilesize / 1024 / 1024,
					}"
				>
					Static site uploads are currently capped at %{ maxFilesize }MB. Please upload a .zip file
					with an index.html file in the root of the folder.
				</translate>
			</p>

			<app-form-control-upload
				:rules="{
					size: maxFilesize,
				}"
				accept=".zip"
				:upload-link-label="$gettext(`Upload a .zip file.`)"
				@changed="onFileSelect"
			/>

			<app-form-control-errors />
		</app-form-group>
	</app-form>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.fill-offset .form-dash-site-build
	.link-muted
		color: $black

		&:hover
			text-decoration: underline
</style>

<script lang="ts" src="./build" />
