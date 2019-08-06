<template>
	<app-form name="communityTagForm">
		<div class="-form">
			<app-form-group name="tag" :label="$gettext(`Tag`)" hide-label optional>
				<app-form-control
					type="text"
					:rules="{
						pattern: /^[a-z0-9_]{3,30}$/i,
						min: 3,
						max: 30,
					}"
					:validate-on="['blur']"
				/>
				<app-form-control-errors />
			</app-form-group>

			<app-form-button :disabled="!isValid">
				<translate>Add</translate>
			</app-form-button>
		</div>
	</app-form>
</template>

<style lang="stylus" scoped>
.-form
	display: flex
	align-items: flex-start

	button
		margin-left: 5px
</style>

<script lang="ts" src="./tag"></script>
