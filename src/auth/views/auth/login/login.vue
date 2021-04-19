<script lang="ts" src="./login"></script>

<template>
	<div>
		<app-auth-login overlay :redirect-to="redirect" />

		<div class="auth-page-links text-right anim-fade-in">
			<div class="auth-page-link">
				<router-link :to="{ name: 'auth.forgot' }">
					<translate>Having trouble logging in?</translate>
				</router-link>
			</div>
			<div class="auth-page-link">
				Don't have an account?
				<router-link :to="{ name: 'auth.join' }">
					<translate>Sign up!</translate>
				</router-link>
			</div>
		</div>
	</div>
</template>
