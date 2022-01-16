<script lang="ts">
import { mixins, Options, Watch } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import { formatFilesize } from '../../../../_common/filters/filesize';
import AppFormControlCrop from '../../../../_common/form-vue/controls/AppFormControlCrop.vue';
import AppFormControlToggle from '../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import AppFormControlUpload from '../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import {
	BaseForm,
	FormOnBeforeSubmit,
	FormOnLoad,
} from '../../../../_common/form-vue/form.service';
import { ModalConfirm } from '../../../../_common/modal/confirm/confirm-service';
import { Screen } from '../../../../_common/screen/screen-service';
import { User } from '../../../../_common/user/user.model';

type FormModel = User & {
	avatar_crop?: any;
};

class Wrapper extends BaseForm<FormModel> {}

@Options({
	components: {
		AppFormControlUpload,
		AppFormControlCrop,
		AppFormControlToggle,
	},
})
export default class FormAvatar extends mixins(Wrapper) implements FormOnLoad, FormOnBeforeSubmit {
	modelClass = User;
	saveMethod = '$saveAvatar' as const;

	maxFilesize = 0;
	minSize = 0;
	maxSize = 0;

	readonly formatFilesize = formatFilesize;
	readonly Screen = Screen;

	get loadUrl() {
		return `/web/dash/avatar/save`;
	}

	get hasAvatar() {
		return !!this.formModel.avatar_media_item;
	}

	get crop() {
		return this.formModel.avatar_media_item
			? this.formModel.avatar_media_item.getCrop()
			: undefined;
	}

	@Watch('crop')
	onCropChange() {
		this.setField('avatar_crop', this.crop);
	}

	created() {
		this.form.warnOnDiscard = false;
		this.form.reloadOnSubmit = true;
	}

	onLoad(payload: any) {
		this.maxFilesize = payload.maxFilesize;
		this.minSize = payload.minSize;
		this.maxSize = payload.maxSize;
	}

	onBeforeSubmit() {
		// Backend expects this field.
		this.setField('crop' as any, this.formModel.avatar_crop);
	}

	avatarSelected() {
		if (this.formModel.file) {
			this.form.submit();
		}
	}

	async clearAvatar() {
		const result = await ModalConfirm.show(
			this.$gettext(`Are you sure you want to remove your avatar?`)
		);

		if (result) {
			this.formModel.$clearAvatar();
		}
	}

	gravatarToggled() {
		Api.sendRequest('/web/dash/avatar/gravatar', this.formModel);
	}
}
</script>

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
