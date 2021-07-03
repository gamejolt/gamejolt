<script lang="ts" src="./body"></script>

<template>
	<div id="shell-body" :class="{ 'has-content-sidebar': hasContentSidebar }">
		<div class="shell-body-main">
			<slot />
		</div>
		<app-shell-footer v-if="hasFooter" />
	</div>
</template>

<style lang="stylus" src="./body.styl"></style>
