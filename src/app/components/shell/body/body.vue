<template>
	<div id="shell-body">
		<div class="shell-body-main">
			<slot />
			<app-ad-widget size="footer" />
		</div>
		<app-shell-footer />
	</div>
</template>

<script lang="ts" src="./body"></script>
