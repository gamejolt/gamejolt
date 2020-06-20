<template>
	<app-theme :theme="formTheme">
		<section id="styleguide-theme-svg" class="section">
			<h1 class="section-header">Theme SVG</h1>

			<p>
				<translate>
					See how our
				</translate>
				<code>.svg</code>
				<translate>
					files display on different background colors with different themes, or paste your own!
				</translate>
			</p>

			<app-form name="theme-svg">
				<div class="-selectors">
					<!-- SVG File Selector -->
					<app-form-group name="file" class="-selectors-item" :label="$gettext('Select SVG File')">
						<app-form-control-select :disabled="!!formCustomFile.length">
							<option value="custom">Custom SVG</option>

							<template v-for="(path, key) of SvgList">
								<option :key="key" :value="path">
									<!-- Display just the name of the SVG file -->
									{{ parseSvgName(path) }}
								</option>
							</template>
						</app-form-control-select>
					</app-form-group>

					<!-- Background Color Selector -->
					<app-form-group
						name="color"
						class="-selectors-item"
						:label="$gettext('Select Background')"
					>
						<app-form-control-select placeholder="fill-what">
							<template v-for="(color, key) of FillList">
								<option :key="key" :value="color">
									{{ color }}
								</option>
							</template>
						</app-form-control-select>
					</app-form-group>

					<!-- Theme Selector -->
					<app-form-group name="theme" class="-selectors-item" :label="$gettext('Select Theme')">
						<app-form-control-theme class="-selectors-item-theme" />
					</app-form-group>
				</div>

				<!-- Custom SVG Input -->
				<app-form-group name="custom" class="-custom -selectors-item" hide-label>
					<app-form-control-textarea
						v-if="formFile === 'custom'"
						class="-custom-input"
						placeholder="Paste an SVG file..."
					/>
				</app-form-group>

				<!-- Output Area -->
				<div class="-output-area" :class="formBgColor">
					<template v-if="formFile !== 'custom'">
						<app-theme-svg :src="formFile" alt="" :theme="formTheme" />
					</template>
					<template v-else-if="!formCustomFile.length">
						<translate class="text-muted">
							Waiting for Custom SVG...
						</translate>
					</template>
					<template v-else>
						<app-theme-svg
							:src="customSvg"
							alt="Something is wrong with your SVG!"
							:theme="formTheme"
						/>
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
	elevate-1()
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

	&-input
		height: 96px

.-output-area
	rounded-corners-lg()
	display: flex
	flex-flow: row wrap
	justify-content: center
	align-items: center
	min-height: 300px
	padding: 20px
</style>
