<script lang="ts" src="./video"></script>

<template>
	<app-form :controller="form">
		<app-form-group name="_url" :label="$gettext(`dash.games.media.video.form.url_label`)">
			<app-form-control type="text" :validators="[validatePattern(REGEX_VIDEO)]" />

			<app-form-control-errors
				:label="$gettext(`dash.games.media.video.form.url_error_label`)"
			/>

			<p v-translate class="help-block">
				We currently only support videos from Vimeo or YouTube.
				<br />
				The URL should look something like:
				<br />
				<strong>YouTube:</strong>
				<code>https://youtube.com/watch?v=oHg5SJYRHA0</code>
				<br />
				<strong>Vimeo:</strong>
				<code>https://vimeo.com/243244233</code>
			</p>
			<template v-if="hasValidVideoUrl && videoData">
				<br />
				<app-video-embed :video-provider="videoData.type" :video-id="videoData.id" />
			</template>
		</app-form-group>

		<app-form-group name="title" :label="$gettext(`dash.games.media.video.form.title_label`)">
			<app-form-control type="text" :validators="[validateMaxLength(150)]" />
			<app-form-control-errors />
		</app-form-group>

		<app-form-group
			name="description"
			:label="$gettext(`dash.games.media.video.form.description_label`)"
			:optional="true"
		>
			<app-form-control-textarea rows="5" :validators="[validateMaxLength(2500)]" />
			<app-form-control-errors />
		</app-form-group>

		<app-form-button show-when-valid>
			<translate v-if="method === 'add'">Add</translate>
			<translate v-else-if="method === 'edit'">Save</translate>
		</app-form-button>
	</app-form>
</template>
