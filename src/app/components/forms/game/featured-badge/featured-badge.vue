<script lang="ts" src="./featured-badge"></script>

<template>
	<div class="container">
		<h1 class="section-header">Generate your Featured Badge!</h1>

		<app-form :controller="form">
			<div class="-form">
				<div class="-selectors">
					<!-- SVG File Selector -->
					<app-form-group name="color" class="-selectors-item" label="Badge Color">
						<div v-for="{ label, key } of colorOptions" :key="key" class="checkbox">
							<label>
								<app-form-control-radio :value="key" />
								{{ label }}
							</label>
						</div>
					</app-form-group>
					<app-form-group name="size" class="-selectors-item" label="Badge Size">
						<div
							v-for="{ label, key } of sizeOptions"
							:key="key.width"
							class="checkbox"
						>
							<label>
								<app-form-control-radio :value="key" />
								{{ label }}
							</label>
						</div>
					</app-form-group>
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
					<app-button class="-submit" icon="edit" @click="onClickCopy">
						Copy to Clipboard
					</app-button>
				</div>
			</div>
		</app-form>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

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
