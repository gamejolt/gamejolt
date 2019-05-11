<template>
	<div>
		<app-theme />
		<app-cookie-banner />

		<app-user-bar :user="app.user" site="main" :hide-site-selector="true" />

		<div id="content">
			<app-error-page>
				<router-view />
			</app-error-page>
		</div>

		<app-loading-bar />
		<app-growls />
	</div>
</template>

<script lang="ts" src="./app"></script>
