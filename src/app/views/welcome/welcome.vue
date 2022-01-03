<script lang="ts" src="./welcome"></script>

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
						<app-form-button
							class="-skip"
							block
							:primary="false"
							:solid="false"
							trans
							:disabled="!canContinue"
						>
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
.-welcome
	change-bg('darkest')
	min-height: 100vh

.-controls
	margin-top: 30px

.-skip
	theme-prop('color', 'fg-muted')
</style>
