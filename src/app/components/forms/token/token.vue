<template>
	<app-form :controller="form">
		<app-form-group name="token" :label="$gettext('Game Token')">
			<app-form-control
				type="text"
				:validators="[validateMinLength(4), validateMaxLength(30)]"
				autocomplete="off"
				v-app-focus-when
			/>

			<app-form-control-errors />

			<p class="help-block">
				<translate>
					For security reasons, don't make your game token the same as your password.
				</translate>
			</p>
		</app-form-group>

		<app-form-button>
			<translate>Save Game Token</translate>
		</app-form-button>
	</app-form>
</template>

<script lang="ts" src="./token"></script>
