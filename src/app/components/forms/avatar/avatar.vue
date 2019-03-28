<template>
	<app-form name="avatarForm" ref="form">
		<app-form-group name="file" :label="$gettext(`Upload New Avatar`)" :optional="true">
			<p class="help-block" v-translate>
				Your image must be a PNG, JPG, or GIF.
				<br />
				<strong>PNGs are highly recommended as they produce a lossless image.</strong>
			</p>
			<p class="help-block strong" v-translate="{ dimensions: '1000x1000' }">
				The recommended size for an avatar is
				<code>%{dimensions}</code>
				.
			</p>

			<app-form-control-upload
				:rules="{
					filesize: maxFilesize,
					min_img_dimensions: [minSize, minSize],
					max_img_dimensions: [maxSize, maxSize],
				}"
				accept=".png,.jpg,.jpeg,.gif"
				@changed="avatarSelected()"
			/>

			<app-form-control-errors :label="$gettext(`avatar`)" />
		</app-form-group>

		<app-form-group
			name="avatar_crop"
			:label="$gettext('Your Uploaded Avatar')"
			v-if="formModel.avatar_media_item && !formModel.file"
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

		<template v-if="formModel.avatar_media_item && !hasFormErrors">
			<div>
				<app-form-button>
					<translate>Save</translate>
				</app-form-button>

				<app-button trans @click.prevent.stop="clearAvatar()">
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
					By default we fallback to using Gravatar if you have one. If you would like to disable the
					Gravatar fallback, you can toggle this on.
				</translate>
				<a href="https://gravatar.com" target="_blank" class="link-help">
					<translate>What is Gravatar?</translate>
				</a>
			</p>
		</app-form-group>
	</app-form>
</template>

<script lang="ts" src="./avatar" />
