<template>
	<app-theme :theme="theme">
		<section id="styleguide-theme-svg" class="section">
			<h1 class="section-header">Theme SVG</h1>

			<p>
				See how our
				<code>svg</code>
				files display on different background colors with different themes, or paste your own!
			</p>

			<app-form name="theme-svg">
				<div class="-selectors">
					<!-- SVG File Selector -->
					<app-form-group name="file" class="-selectors-item" label="Select SVG File">
						<app-form-control-select :disabled="!!customFile.length">
							<option value="custom">Custom SVG</option>

							<option v-for="(path, key) of SvgList" :key="key" :value="path">
								<!-- Display just the name of the SVG file -->
								{{ parseSvgName(path) }}
							</option>
						</app-form-control-select>
					</app-form-group>

					<!-- Background Color Selector -->
					<app-form-group name="color" class="-selectors-item" label="Select Background">
						<app-form-control-select placeholder="Fill Color">
							<option v-for="(color, key) of FillList" :key="key" :value="color">
								{{ color }}
							</option>
						</app-form-control-select>
					</app-form-group>

					<!-- Theme Selector -->
					<app-form-group name="theme" class="-selectors-item" label="Select Theme">
						<app-form-control-theme class="-selectors-item-theme" />
					</app-form-group>
				</div>

				<!-- Custom SVG Input -->
				<app-form-group name="custom" class="-custom -selectors-item" hide-label>
					<app-form-control-textarea
						v-if="file === 'custom'"
						placeholder="Paste an SVG file..."
						rows="6"
					/>
				</app-form-group>

				<!-- Output Area -->
				<div class="-output-area" :class="bgColor">
					<template v-if="file !== 'custom'">
						<app-theme-svg :src="file" :theme="theme" inpage />
					</template>
					<template v-else-if="!customFile.length">
						<span class="text-muted">
							Waiting for Custom SVG...
						</span>
					</template>
					<template v-else>
						<app-theme-svg :src="customSvg" :theme="theme" inpage />
					</template>
				</div>
			</app-form>
		</section>
	</app-theme>
</template>

<script lang="ts" src="./svg-styleguide"></script>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

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
