<template>
	<app-form name="themeEditorImageForm" ref="form">
		<app-form-group name="file" :hide-label="true">
			<app-form-control-upload
				:rules="{
					filesize: maxFilesize,
					max_img_dimensions: [maxWidth, maxHeight],
				}"
				accept=".png,.jpg,.jpeg,.gif"
				:upload-link-label="$gettext(`Upload a PNG, JPG, or GIF image.`)"
				@changed="submit"
			/>

			<app-form-control-errors />
		</app-form-group>
	</app-form>
</template>

<script lang="ts" src="./image-form"></script>
