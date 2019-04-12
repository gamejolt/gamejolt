<template>
	<div>
		<app-client-tray v-if="os === 'windows'" />
		<app-client-mac-app-menu v-if="os === 'mac'" />
	</div>
</template>

<script lang="ts" src="./base"></script>
