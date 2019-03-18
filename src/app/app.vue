<template>
	<div :id="id">
		<app-theme />
		<app-cookie-banner />
		<app-shell>
			<div id="content">
				<app-error-page>
					<router-view />
				</app-error-page>
			</div>
		</app-shell>
	</div>
</template>

<script lang="ts" src="./app" />
