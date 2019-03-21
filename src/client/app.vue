<template>
	<div>
		<app-theme />
		<div id="content">
			<app-error-page>
				<router-view />
			</app-error-page>
		</div>
	</div>
</template>

<script lang="ts" src="./app" />
