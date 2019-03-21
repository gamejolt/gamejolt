<template>
	<div>
		<app-auth-join overlay />

		<div class="auth-page-links text-right anim-fade-in">
			<div class="auth-page-link">
				<translate>auth.or</translate>
				<router-link class="link-unstyled" :to="{ name: 'auth.login' }">
					<translate>auth.login_link</translate>
					<app-jolticon icon="sign-in" />
				</router-link>
			</div>
		</div>
	</div>
</template>

<script lang="ts" src="./join" />
