<script lang="ts" src="./join"></script>

<template>
	<div class="auth-join">
		<app-auth-join-form :overlay="overlay" :blocked="blocked" @submit="onJoin" />
	</div>
</template>
