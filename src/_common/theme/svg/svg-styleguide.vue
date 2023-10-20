<script lang="ts">
import { setup } from 'vue-class-component';
import { mixins, Options, Watch } from 'vue-property-decorator';
import { imageGameJoltClientLogo, imageGameJoltLogo, imageJolt } from '../../../app/img/images';
import AppForm from '../../form-vue/AppForm.vue';
import AppFormGroup from '../../form-vue/AppFormGroup.vue';
import AppFormControlSelect from '../../form-vue/controls/AppFormControlSelect.vue';
import AppFormControlTextarea from '../../form-vue/controls/AppFormControlTextarea.vue';
import AppFormControlTheme from '../../form-vue/controls/AppFormControlTheme.vue';
import AppFormControlToggle from '../../form-vue/controls/AppFormControlToggle.vue';
import { BaseForm } from '../../form-vue/form.service';
import AppTheme from '../AppTheme.vue';
import { ThemeModel } from '../theme.model';
import { useThemeStore } from '../theme.store';
import AppThemeSvg from './AppThemeSvg.vue';

interface VueColor {
	hex: string | null;
}

interface FormModel {
	file?: string;
	color?: string;
	theme?: null | ThemeModel;
	custom?: string;
	strictColors?: boolean;
}

class Wrapper extends BaseForm<FormModel> {}

@Options({
	components: {
		AppTheme,
		AppThemeSvg,
		AppForm,
		AppFormGroup,
		AppFormControlSelect,
		AppFormControlToggle,
		AppFormControlTheme,
		AppFormControlTextarea,
	},
})
export default class AppThemeSvgStyleguide extends mixins(Wrapper) {
	themeStore = setup(() => useThemeStore());

	customSvg = '';
	customSelection: VueColor = { hex: null };

	readonly SvgList = {
		imageGameJoltLogo,
		imageGameJoltClientLogo,
		imageJolt,
	};
	readonly FillList = [
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
	];

	get file() {
		return this.formModel.file || 'custom';
	}

	get bgColor() {
		return this.formModel.color || 'fill-offset';
	}

	get theme() {
		return this.formModel.theme || this.themeStore.theme;
	}

	get customFile() {
		return this.formModel.custom || '';
	}

	get strictColors() {
		return !!this.formModel.strictColors;
	}

	mounted() {
		// Initialize the form fields
		this.setField('file', this.file);
		this.setField('color', this.bgColor);
		this.setField('theme', this.theme);
		this.setField('custom', this.customFile);
		this.setField('strictColors', false);
	}

	parseSvgName(name: string) {
		try {
			// This will remove '/assets/' and '.X.svg' from list names,
			// leaving the plain filename without the file extension or path.
			return name.split('/assets/')[1].split('.')[0];
		} catch {
			return name;
		}
	}

	@Watch('customFile')
	onCustomSvgChange() {
		// Reset and return if the textarea is empty.
		if (!this.customFile.length) {
			return;
		}

		// Trim the start of the SVG string, otherwise we could have issues processing it.
		const svgString = this.customFile.trimLeft();

		// Parse the pasted SVG XML into a format that we can pass to AppThemeSvg.
		this.customSvg = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgString);
	}
}
</script>

<template>
	<AppTheme :theme="theme">
		<section id="styleguide-theme-svg" class="section">
			<h1 class="section-header">Theme SVG</h1>

			<p>
				See how our
				<code>svg</code>
				files display on different background colors with different themes, or paste your
				own!
			</p>

			<AppForm :controller="form">
				<div class="-selectors">
					<!-- SVG File Selector -->
					<AppFormGroup name="file" class="-selectors-item" label="Select SVG File">
						<AppFormControlSelect :disabled="!!customFile.length">
							<option value="custom">Custom SVG</option>

							<option v-for="(path, key) of SvgList" :key="key" :value="path">
								<!-- Display just the name of the SVG file -->
								{{ parseSvgName(path) }}
							</option>
						</AppFormControlSelect>
					</AppFormGroup>

					<!-- Background Color Selector -->
					<AppFormGroup name="color" class="-selectors-item" label="Select Background">
						<AppFormControlSelect placeholder="Fill Color">
							<option v-for="(color, key) of FillList" :key="key" :value="color">
								{{ color }}
							</option>
						</AppFormControlSelect>
					</AppFormGroup>

					<AppFormGroup
						name="strictColors"
						class="-selectors-item"
						label="Strict Colors?"
					>
						<AppFormControlToggle />
					</AppFormGroup>

					<!-- Theme Selector -->
					<AppFormGroup name="theme" class="-selectors-item" label="Select Theme">
						<AppFormControlTheme class="-selectors-item-theme" />
					</AppFormGroup>
				</div>

				<!-- Custom SVG Input -->
				<AppFormGroup name="custom" class="-custom -selectors-item" hide-label>
					<AppFormControlTextarea
						v-if="file === 'custom'"
						placeholder="Paste an SVG file..."
						rows="6"
					/>
				</AppFormGroup>

				<!-- Output Area -->
				<div class="-output-area" :class="bgColor">
					<template v-if="file !== 'custom'">
						<AppThemeSvg :src="file" :theme="theme" :strict-colors="strictColors" />
					</template>
					<template v-else-if="!customFile.length">
						<span class="text-muted"> Waiting for Custom SVG... </span>
					</template>
					<template v-else>
						<AppThemeSvg
							:src="customSvg"
							:theme="theme"
							:strict-colors="strictColors"
						/>
					</template>
				</div>
			</AppForm>
		</section>
	</AppTheme>
</template>

<style lang="stylus" scoped>
#styleguide-theme-svg
	rounded-corners-lg()
	change-bg('bg')
	border: $border-width-base solid var(--theme-bg-subtle)
	padding-left: 20px
	padding-right: 20px

.-selectors
	full-bleed()
	display: flex

	&-item
		flex: 2
		margin: 0 20px

		&:last-of-type
			flex: 1

		&-theme
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
</style>
