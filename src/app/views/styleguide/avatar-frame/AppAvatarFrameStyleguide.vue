<script lang="ts" setup>
import { computed, ref, Ref } from 'vue';
import AppAvatarFrame from '../../../../_common/avatar/AppAvatarFrame.vue';
import { AvatarFrameModel, DefaultAvatarFrameScale } from '../../../../_common/avatar/frame.model';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppForm, { createForm, FormController } from '../../../../_common/form-vue/AppForm.vue';
import AppFormControl from '../../../../_common/form-vue/AppFormControl.vue';
import AppFormGroup from '../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControlSelect from '../../../../_common/form-vue/controls/AppFormControlSelect.vue';
import AppFormControlTheme from '../../../../_common/form-vue/controls/AppFormControlTheme.vue';
import AppFormControlToggle from '../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import AppTheme from '../../../../_common/theme/AppTheme.vue';
import { ThemeModel } from '../../../../_common/theme/theme.model';
import { useThemeStore } from '../../../../_common/theme/theme.store';
import { kThemeFg } from '../../../../_common/theme/variables';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/AppUserAvatarImg.vue';
import { styleBorderRadiusLg, styleChangeBg, styleFlexCenter } from '../../../../_styles/mixins';
import { kBorderWidthBase } from '../../../../_styles/variables';

interface FormModel {
	imageUrl?: string;
	avatarFrame?: AvatarFrameModel;
	useFallbackAvatar?: boolean;
	avatarSize: number;

	color?: string;
	theme?: null | ThemeModel;
}

const FillList = [
	'none',
	'fill-offset',
	'fill-backdrop',
	'fill-bg',
	'fill-highlight',
	'fill-notice',
	'fill-gray',
	'fill-dark',
	'fill-darker',
	'fill-darkest',
	'fill-black',
] as const;

const fallbackAvatarSize = 200;

const { theme: storeTheme } = useThemeStore();
const { user } = useCommonStore();

const input = ref() as Ref<HTMLInputElement>;

const model = ref<FormModel>({
	theme: storeTheme.value,
	color: 'fill-offset',
	avatarSize: fallbackAvatarSize,
});

const form: FormController<FormModel> = createForm<FormModel>({
	model,
});

// const avatarFrame = computed(() => form.formModel.avatarFrame || null);
const avatarSize = computed(() => form.formModel.avatarSize || fallbackAvatarSize);
const avatarUser = computed(() => (form.formModel.useFallbackAvatar ? null : user.value));

const bgColor = computed(() =>
	form.formModel.color === 'none' ? undefined : form.formModel.color
);
const theme = computed(() => form.formModel.theme || storeTheme.value || undefined);

function getDragEventItems(e: DragEvent) {
	if (
		!e.dataTransfer ||
		!e.dataTransfer.items.length ||
		e.dataTransfer.items[0].kind !== 'file'
	) {
		return null;
	}
	return e.dataTransfer.items;
}

function dragOver(e: DragEvent) {
	// Don't do anything if not a file drop.
	const items = getDragEventItems(e);
	if (!items) {
		return;
	}

	e.preventDefault();
}

function selectFile() {
	if (!input.value) {
		return;
	}

	const fileList = input.value.files;
	const files: File[] = [];
	if (fileList) {
		for (let i = 0; i < fileList.length; ++i) {
			files.push(fileList.item(i)!);
		}
	}

	setFiles(files);
}

/**
 * File select resulting from a drop onto the input.
 */
async function drop(e: DragEvent) {
	// Don't do anything if not a file drop.
	const items = getDragEventItems(e);
	if (!items) {
		return;
	}

	e.preventDefault();
	const files = await getFiles(items);
	setFiles(files);
}

async function getFiles(items: DataTransferItemList) {
	const files: File[] = [];

	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		if (item.type.includes('image')) {
			const blob = item.getAsFile();
			if (blob) {
				files.push(blob);
			}
		}
	}

	return files;
}

function setFiles(files: File[]) {
	if (files.length === 0) {
		return;
	}

	const oldUrl = form.formModel.avatarFrame?.image_url;
	const windowUrl = window.URL || window.webkitURL;

	form.formModel.imageUrl = windowUrl.createObjectURL(files[0]);

	if (oldUrl) {
		windowUrl.revokeObjectURL(oldUrl);
	}
}
</script>

<template>
	<AppTheme :theme="theme">
		<section id="styleguide-avatar-frame" class="section" @dragover="dragOver" @drop="drop">
			<h1 class="section-header">Avatar Frame</h1>

			<p>See how avatar frames are displayed on top of a user avatar.</p>

			<AppForm :controller="form">
				<div class="-selectors">
					<input
						ref="input"
						:style="{ display: `none` }"
						type="file"
						@change="selectFile"
					/>
					<div
						class="-selectors-item"
						:style="{
							...styleBorderRadiusLg,
							...styleFlexCenter(),
							border: `${kBorderWidthBase.px} solid ${kThemeFg}`,
							padding: `6px 12px`,
							cursor: `pointer`,
							flex: 1,
						}"
						@click="input.click()"
					>
						<div>Select file</div>
					</div>

					<AppFormGroup name="color" class="-selectors-item" label="Select Background">
						<AppFormControlSelect placeholder="Fill Color">
							<option v-for="(color, key) of FillList" :key="key" :value="color">
								{{ color }}
							</option>
						</AppFormControlSelect>
					</AppFormGroup>

					<AppFormGroup name="useFallbackAvatar" class="-selectors-item">
						<AppFormControlToggle />
					</AppFormGroup>

					<AppFormGroup
						name="theme"
						class="-selectors-item"
						:style="{
							flex: 1,
						}"
						label="Select Theme"
					>
						<AppFormControlTheme class="-selectors-item-theme" />
					</AppFormGroup>

					<AppFormGroup name="avatarSize" class="-selectors-item" label="Avatar Size">
						<AppFormControl :placeholder="`${fallbackAvatarSize}`" />
					</AppFormGroup>
				</div>

				<div class="-output-area" :class="bgColor">
					<AppAvatarFrame
						:style="{
							width: `100%`,
							maxWidth: `${avatarSize}px`,
						}"
						:frame="
							form.formModel.imageUrl
								? {
										image_url: form.formModel.imageUrl,
										scale: DefaultAvatarFrameScale,
								  }
								: null
						"
					>
						<AppUserAvatarImg
							:style="{
								...styleChangeBg('bg-offset'),
								width: `100%`,
								height: `100%`,
								borderRadius: `50%`,
								display: `flex`,
								justifyContent: `stretch`,
								alignItems: `stretch`,
							}"
							:user="avatarUser"
						/>
					</AppAvatarFrame>

					<AppButton
						v-if="form.formModel.imageUrl"
						:style="{
							position: `absolute`,
							top: `12px`,
							right: `12px`,
							zIndex: 1,
						}"
						icon="remove"
						solid
						overlay
						circle
						trans
						@click="form.formModel.imageUrl = undefined"
					/>
				</div>
			</AppForm>
		</section>
	</AppTheme>
</template>

<style lang="stylus" scoped>
#styleguide-avatar-frame
	rounded-corners-lg()
	change-bg('bg')
	border: $border-width-base solid var(--theme-bg-subtle)
	padding-left: 20px
	padding-right: 20px
	margin-bottom: $line-height-computed

.-selectors
	full-bleed()
	display: flex

.-selectors-item
	flex: 2
	margin: 0 20px

	&:last-of-type
		flex: 1

.-selectors-item-theme
	height: 20px

.-custom
	margin: 8px 0

.-output-area
	rounded-corners-lg()
	display: flex
	flex-flow: row wrap
	justify-content: center
	align-items: center
	min-height: 300px
	padding: 20px
	margin-top: $line-height-computed
	position: relative
</style>
