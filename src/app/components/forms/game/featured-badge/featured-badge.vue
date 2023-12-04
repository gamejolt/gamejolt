<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { Clipboard } from '../../../../../_common/clipboard/clipboard-service';
import { Environment } from '../../../../../_common/environment/environment.service';
import { BaseForm } from '../../../../../_common/form-vue/form.service';
import { GameModel } from '../../../../../_common/game/game.model';

interface FormModel {
	color: string;
	size: Record<'width' | 'height', string>;
}

class Wrapper extends BaseForm<FormModel> {}

@Options({})
export default class FormGameFeaturedBadge extends mixins(Wrapper) {
	@Prop({ type: Object, required: true }) game!: GameModel;

	get colorOptions() {
		return [
			{
				key: 'black',
				label: this.$gettext(`dark`),
			},
			{
				key: 'white',
				label: this.$gettext(`light`),
			},
		];
	}

	get sizeOptions() {
		return [
			{
				key: {
					width: '312px',
					height: '204px',
				},
				label: this.$gettext(`Large (312x204)`),
			},
			{
				key: {
					width: '156px',
					height: '102px',
				},
				label: this.$gettext(`Small (156x102)`),
			},
		];
	}

	get previewImage() {
		return {
			src: `https://gamejolt.com/img/badge/featured/${this.formModel.color}.png`,
			alt: `Follow ${this.game.title} on Game Jolt`,
			size: this.formModel.size,
		};
	}

	get processedTag() {
		const gameUrl = `href="${Environment.baseUrl}/games/${this.game.path}/${this.game.id}"`;
		const imgSize = `width="${this.formModel.size.width}" height="${this.formModel.size.height}"`;
		const imgAlt = `alt="${this.previewImage.alt.replace(/"/g, '&quot;')}"`;

		return `<a ${gameUrl}><img ${imgSize} src="${this.previewImage.src}" ${imgAlt} /></a>`;
	}

	created() {
		this.setField('color', this.colorOptions[0].key);
		this.setField('size', this.sizeOptions[0].key);
	}

	onClickCopy() {
		Clipboard.copy(this.processedTag);
	}
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
