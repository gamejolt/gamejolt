<script lang="ts" setup>
import { computed } from 'vue';

import AppButton from '~common/button/AppButton.vue';
import { Clipboard } from '~common/clipboard/clipboard-service';
import { Environment } from '~common/environment/environment.service';
import AppForm, { createForm, FormController } from '~common/form-vue/AppForm.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import AppFormControlRadio from '~common/form-vue/controls/AppFormControlRadio.vue';
import { GameModel } from '~common/game/game.model';
import { $gettext } from '~common/translate/translate.service';

type FormModel = {
	color: string;
	size: Record<'width' | 'height', string>;
};

type Props = {
	game: GameModel;
};

const { game } = defineProps<Props>();

const form: FormController<FormModel> = createForm<FormModel>({
	warnOnDiscard: false,
	onInit() {
		form.formModel.color = colorOptions[0].key;
		form.formModel.size = sizeOptions[0].key;
	},
});

const colorOptions = [
	{
		key: 'black',
		label: $gettext(`dark`),
	},
	{
		key: 'white',
		label: $gettext(`light`),
	},
];

const sizeOptions = [
	{
		key: {
			width: '312px',
			height: '204px',
		},
		label: $gettext(`Large (312x204)`),
	},
	{
		key: {
			width: '156px',
			height: '102px',
		},
		label: $gettext(`Small (156x102)`),
	},
];

const previewImage = computed(() => ({
	src: `https://gamejolt.com/img/badge/featured/${form.formModel.color}.png`,
	alt: `Follow ${game.title} on Game Jolt`,
	size: form.formModel.size,
}));

const processedTag = computed(() => {
	const gameUrl = `href="${Environment.baseUrl}/games/${game.path}/${game.id}"`;
	const imgSize = `width="${form.formModel.size.width}" height="${form.formModel.size.height}"`;
	const imgAlt = `alt="${previewImage.value.alt.replace(/"/g, '&quot;')}"`;

	return `<a ${gameUrl}><img ${imgSize} src="${previewImage.value.src}" ${imgAlt} /></a>`;
});

function onClickCopy() {
	Clipboard.copy(processedTag.value);
}
</script>

<template>
	<div class="container">
		<h1 class="section-header">Generate your Featured Badge!</h1>

		<AppForm :controller="form">
			<div class="-form">
				<div class="-selectors">
					<!-- SVG File Selector -->
					<AppFormGroup name="color" class="-selectors-item" label="Badge Color">
						<div v-for="{ label, key } of colorOptions" :key="key" class="checkbox">
							<label>
								<AppFormControlRadio :value="key" />
								{{ label }}
							</label>
						</div>
					</AppFormGroup>
					<AppFormGroup name="size" class="-selectors-item" label="Badge Size">
						<div
							v-for="{ label, key } of sizeOptions"
							:key="key.width"
							class="checkbox"
						>
							<label>
								<AppFormControlRadio :value="key" />
								{{ label }}
							</label>
						</div>
					</AppFormGroup>
				</div>

				<div class="-preview">
					<div class="-preview-inner">
						<img
							:src="previewImage.src"
							:alt="previewImage.alt"
							:width="previewImage.size.width"
							:height="previewImage.size.height"
						/>
					</div>
					<code class="-preview-output">
						{{ processedTag }}
					</code>
					<AppButton class="-submit" icon="edit" @click="onClickCopy">
						Copy to Clipboard
					</AppButton>
				</div>
			</div>
		</AppForm>
	</div>
</template>

<style lang="stylus" scoped>
.-form
	display: flex
	flex-direction: column

	@media $media-md-up
		flex-direction: row

		.-selectors
			flex-direction: column

	.-selectors
		display: flex
		flex: 1

		&-item
			rounded-corners-lg()
			display: inline-block
			flex: 1
			padding: 8px

	.-preview
		flex: 2

		&-inner
		&-output
			rounded-corners-lg()
			border: $border-width-base solid var(--theme-fg-muted)
			background-color: var(--theme-bg-subtle)

		&-inner
			padding: 16px
			display: flex
			justify-content: center
			align-items: center
			min-height: 240px

		&-output
			padding: 8px
			display: block
			white-space: normal
			line-break: anywhere
			margin-top: 4px

	.-submit
		margin-top: 8px
		float: right
</style>
