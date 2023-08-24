<script lang="ts">
import { mixins, Options, Watch } from 'vue-property-decorator';
import { CommunityChannelModel } from '../../../../../../_common/community/channel/channel.model';
import AppFormControlCrop from '../../../../../../_common/form-vue/controls/AppFormControlCrop.vue';
import AppFormControlUpload from '../../../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import {
	BaseForm,
	FormOnBeforeSubmit,
	FormOnLoad,
} from '../../../../../../_common/form-vue/form.service';
import { showModalConfirm } from '../../../../../../_common/modal/confirm/confirm-service';

type FormModel = CommunityChannelModel & {
	background_crop: any;
};

class Wrapper extends BaseForm<FormModel> {}

@Options({
	components: {
		AppFormControlUpload,
		AppFormControlCrop,
	},
})
export default class FormCommunityChannelBackground
	extends mixins(Wrapper)
	implements FormOnLoad, FormOnBeforeSubmit
{
	modelClass = CommunityChannelModel as any;
	saveMethod = '$saveBackground' as const;

	maxFilesize = 0;
	aspectRatio = 0;
	minWidth = 0;
	minHeight = 0;
	maxWidth = 0;
	maxHeight = 0;

	get loadUrl() {
		return `/web/dash/communities/channels/save/${this.formModel.community_id}/${this.formModel.id}`;
	}

	get crop() {
		return this.formModel.background ? this.formModel.background.getCrop() : undefined;
	}

	@Watch('crop')
	onCropChange() {
		this.setField('background_crop', this.crop);
	}

	onLoad(payload: any) {
		this.maxFilesize = payload.maxFilesize;
		this.aspectRatio = payload.aspectRatio;
		this.minWidth = payload.minWidth;
		this.maxWidth = payload.maxWidth;
		this.minHeight = payload.minHeight;
		this.maxHeight = payload.maxHeight;
	}

	onBeforeSubmit() {
		// Backend expects this field.
		this.setField('crop' as any, this.formModel.background_crop);
	}

	backgroundSelected() {
		if (this.formModel.file) {
			this.form.submit();
		}
	}

	async clearBackground() {
		const result = await showModalConfirm(
			this.$gettext(`Are you sure you want to remove this channel's background?`)
		);

		if (!result) {
			return;
		}

		const payload = await this.formModel.$clearBackground();

		this.model?.assign(payload.channel);
	}
}
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup
			name="file"
			:label="
				!formModel.background
					? $gettext('Upload Channel Background Image')
					: $gettext('Change Channel Background Image')
			"
			:optional="!!formModel.background"
		>
			<p class="help-block">
				<AppTranslate>
					Channel images are backgrounds for your community channels. They give a viewer
					an easy way to identify what kind of content can be found in the channel. Text
					can be overlayed, so make sure no important information is on this image.
				</AppTranslate>
			</p>

			<p v-translate class="help-block">
				Your image must be a PNG or JPG.
				<br />
				<strong>PNGs are highly recommended as they produce a lossless image.</strong>
			</p>

			<p
				v-translate="{
					dimensions: maxWidth + '×' + maxHeight,
					ratio: aspectRatio + ' ÷ 1',
				}"
				class="help-block"
			>
				The recommended size for a channel image is <code>760x200</code> (ratio of
				<strong>%{ratio}</strong>).
				<br />
				Your channel image must be smaller than
				<code>%{dimensions}</code>.
			</p>

			<AppFormControlUpload
				:validators="[
					validateFilesize(maxFilesize),
					validateImageMaxDimensions({ width: maxWidth, height: maxHeight }),
				]"
				accept=".png,.jpg,.jpeg,.webp"
				@changed="backgroundSelected()"
			/>

			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormGroup
			v-if="formModel.background && !formModel.file"
			name="background_crop"
			:label="$gettext(`Crop Current Background`)"
		>
			<div class="form-control-static">
				<AppFormControlCrop
					:src="formModel.background.img_url"
					:min-width="minWidth"
					:min-height="minHeight"
					:max-width="maxWidth"
					:max-height="maxHeight"
					:min-aspect-ratio="aspectRatio"
					:max-aspect-ratio="aspectRatio"
				/>

				<AppFormControlErrors />
			</div>
		</AppFormGroup>

		<template v-if="formModel.background">
			<AppFormButton>
				<AppTranslate>Save</AppTranslate>
			</AppFormButton>
			<AppButton trans @click="clearBackground()">
				<AppTranslate>Remove Background</AppTranslate>
			</AppButton>
		</template>
	</AppForm>
</template>
