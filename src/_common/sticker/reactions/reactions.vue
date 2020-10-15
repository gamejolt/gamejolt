<script lang="ts" src="./reactions"></script>

<template>
	<div class="sticker-reactions">
		<template v-for="{ sticker, count } in reactionsList">
			<app-sticker-reaction-item :key="sticker.id" :sticker="sticker" :count="count" />
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.sticker-reactions
	display: flex
	flex-wrap: wrap
	margin-bottom: 4px
</style>
