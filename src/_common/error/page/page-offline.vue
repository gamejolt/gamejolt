<template>
	<div>
		<h1><translate>Can't Connect</translate></h1>
		<p>
			<strong><translate>We are having trouble connecting to Game Jolt.</translate></strong>
		</p>
		<p><translate>Check your internet connection and try again.</translate></p>
		<br />

		<p>
			<app-button primary @click="retry">
				<translate>Retry</translate>
			</app-button>
		</p>
	</div>
</template>

<script lang="ts" src="./page-offline"></script>
