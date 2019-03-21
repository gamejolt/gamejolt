<template>
	<div>
		<app-auth-login overlay :redirect-to="redirect" />

		<div class="auth-page-links text-right anim-fade-in">
			<div class="auth-page-link">
				<translate>auth.or</translate>
				<router-link class="link-unstyled" :to="{ name: 'auth.join' }">
					<translate>auth.join_link</translate>
					<app-jolticon icon="friends" />
				</router-link>
			</div>
			<div class="auth-page-link">
				<router-link class="link-unstyled" :to="{ name: 'auth.forgot' }">
					<translate>
						auth.forgot_link
					</translate>
					<app-jolticon icon="help-circle" />
				</router-link>
			</div>
		</div>
	</div>
</template>

<script lang="ts" src="./login" />
