<template>
	<app-form :controller="form">
		<app-form-group name="file" :hide-label="true">
			<app-form-control-upload
				:validators="[
					validateFilesize(maxFilesize),
					validateImageMaxDimensions({ width: maxWidth, height: maxHeight }),
				]"
				accept=".png,.jpg,.jpeg,.gif"
				:upload-link-label="$gettext(`Upload a PNG, JPG, or GIF image.`)"
				@changed="submit"
			/>

			<app-form-control-errors />
		</app-form-group>
	</app-form>
</template>

<script lang="ts" src="./image-form"></script>
