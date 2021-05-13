<script lang="ts" src="./join"></script>

<template>
	<div>
		<app-auth-join overlay />

		<div class="auth-page-links text-right anim-fade-in">
			<div class="auth-page-link">
				Already have an account?
				<router-link :to="{ name: 'auth.login' }">
					<translate>Log in!</translate>
				</router-link>
			</div>
		</div>
	</div>
</template>
