<template>
	<div>
		<app-client-intro v-if="userBootstrapped && isShowingIntro" @finish="isShowingIntro = false" />
		<app-client-system-progress />
	</div>
</template>

<script lang="ts" src="./client" />
