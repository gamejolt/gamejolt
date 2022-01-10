<script lang="ts" src="./share"></script>

<template>
	<app-share-card
		class="-share-card"
		resource="fireside"
		:url="shareUrl"
		:hide-heading="hideHeading"
		offset-color
	/>
</template>

<style lang="stylus" scoped>
.-share-card
	margin-bottom: 0px
	margin-top: 20px
</style>
