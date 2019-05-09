<template>
	<div class="-welcome fill-darkest">
		<!-- steepper would go here -->

		<component
			:is="stepComponent"
			:user="user"
			:is-social-registration="isSocialRegistration"
			@next="onNextStep"
		>
			<template v-slot:controls="{ shouldShowSkip, canContinue }">
				<section class="-controls">
					<template v-if="shouldShowSkip">
						<app-form-button class="-skip" block trans :disabled="!canContinue">
							<translate>Skip</translate>
						</app-form-button>
					</template>
					<template v-else>
						<app-form-button primary block solid :disabled="!canContinue">
							<translate>Next</translate>
						</app-form-button>
					</template>
				</section>
			</template>
		</component>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-welcome
	theme-prop('background-color', 'darkest')
	position: absolute
	z-index: $zindex-shell-top-nav
	top: 0
	left: 0
	right: 0
	bottom: 0
	overflow-y: auto
	overflow-x: hidden

.-controls
	margin-top: 30px

.-skip
	theme-prop('color', 'fg-muted')

</style>

<script lang="ts" src="./welcome"></script>
