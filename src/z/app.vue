<script lang="ts" src="./app"></script>

<template>
	<app-common-shell>
		<app-user-bar :user="app.user" site="main" hide-site-selector />

		<div id="content" class="container">
			<app-error-page>
				<router-view />
			</app-error-page>
		</div>
	</app-common-shell>
</template>
