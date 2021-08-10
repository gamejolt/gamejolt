<script lang="ts" src="./upload"></script>

<template>
	<div
		class="form-control-upload"
		:class="{
			'drop-active': isDropActive,
		}"
		@dragover="dragOver"
		@dragleave="dragLeave"
		@drop="drop"
	>
		<div v-show="!controlVal">
			<!--
			If we have a label, then we show the upload "button" as a link instead.
			We hide the button and use it to simulate a click on it.
		-->
			<div v-if="!!uploadLinkLabel" class="small">
				<a class="link-muted" @click="showFileSelect()">
					{{ uploadLinkLabel }}
				</a>
			</div>

			<app-form-control-upload-file
				v-show="!uploadLinkLabel"
				:id="id"
				ref="input"
				v-validate="{ rules: validationRules }"
				:name="group.name"
				:multiple="multiple"
				:accept="accept"
				:data-vv-validate-on="validateOn"
				:data-vv-delay="validateDelay"
				:value="controlVal"
				@input="onChange"
			/>
		</div>

		<template v-if="!!controlVal">
			<div v-if="progress === undefined" class="form-upload-control-files">
				<p>
					<strong><translate>Selected files:</translate></strong>
				</p>
				<div class="list-group list-group-dark">
					<div v-for="file of files" class="list-group-item">
						<a class="card-remove" @click="clearFile(file)">
							<app-jolticon icon="remove" notice />
						</a>
						{{ file.name }}
					</div>
				</div>
			</div>
			<template v-else>
				<app-progress-bar :percent="progress * 100">
					<template v-if="progress < 0.99">
						{{ progress | number({ style: 'percent' }) }}
					</template>
					<template v-else>
						<translate>Processing...</translate>
					</template>
				</app-progress-bar>

				<div v-if="progress >= 0.99" class="alert">
					<p>
						<translate>
							Upload complete! Please wait while we process your file(s). This may
							take a few minutes, so don't close or refresh the page.
						</translate>
					</p>
				</div>
			</template>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.form-control-upload
	rounded-corners-lg()
	theme-prop('border-color', 'bg-subtle')
	border-width: 2px
	border-style: dashed
	padding: ($grid-gutter-width / 2)

	&.drop-active
		theme-prop('border-color', 'link')
		border-style: solid

.list-group
	margin-bottom: 0
</style>
