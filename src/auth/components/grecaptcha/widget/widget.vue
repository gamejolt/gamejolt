<script lang="ts" src="./widget"></script>

<template>
	<span>
		<app-loading v-if="!loaded" />
		<div v-else ref="grecaptcha">
			<translate v-if="!loadedAndValid">
				We could not load in Google's captcha widget.
			</translate>
		</div>
	</span>
</template>
