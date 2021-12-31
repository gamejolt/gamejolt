<script lang="ts" src="./avatar"></script>

<template>
	<app-form :controller="form">
		<app-form-group name="file" :label="$gettext(`Upload New Avatar`)" :optional="true">
			<p v-translate class="help-block">
				Your image must be a PNG or JPG.
				<br />
				<strong>PNGs are highly recommended as they produce a lossless image.</strong>
			</p>
			<p v-translate="{ dimensions: '1000×1000' }" class="help-block strong">
				The recommended size for an avatar is
				<code>%{dimensions}</code>
				.
			</p>

			<app-form-control-upload
				:validators="[
					validateFilesize(maxFilesize),
					validateImageMinDimensions({ width: minSize, height: minSize }),
					validateImageMaxDimensions({ width: maxSize, height: maxSize }),
				]"
				accept=".png,.jpg,.jpeg,.webp"
				@changed="avatarSelected()"
			/>

			<app-form-control-errors :label="$gettext(`avatar`)" />
		</app-form-group>

		<app-form-group
			v-if="formModel.avatar_media_item && !formModel.file"
			name="avatar_crop"
			:label="$gettext('Your Uploaded Avatar')"
		>
			<div class="form-control-static">
				<app-form-control-crop
					:src="formModel.avatar_media_item.img_url"
					:aspect-ratio="1"
					:min-width="minSize"
					:min-height="minSize"
					:max-width="maxSize"
					:max-height="maxSize"
				/>

				<app-form-control-errors :label="$gettext('crop')" />
			</div>
		</app-form-group>

		<template v-if="formModel.avatar_media_item && form.valid">
			<div>
				<app-form-button>
					<translate>Save</translate>
				</app-form-button>

				<app-button trans @click="clearAvatar()">
					<translate>Remove Avatar</translate>
				</app-button>
			</div>

			<br />
			<br />
		</template>

		<app-form-group name="disable_gravatar" :label="$gettext(`Disable Gravatar?`)">
			<app-form-control-toggle class="pull-right" @changed="gravatarToggled()" />
			<p class="help-block">
				<translate>
					By default we fallback to using Gravatar if you have one. If you would like to
					disable the Gravatar fallback, you can toggle this on.
				</translate>
				<app-link-external href="https://gravatar.com" class="link-help">
					<translate>What is Gravatar?</translate>
				</app-link-external>
			</p>
		</app-form-group>
	</app-form>
</template>
