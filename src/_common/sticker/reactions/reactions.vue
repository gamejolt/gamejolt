<script lang="ts" src="./reactions"></script>

<template>
	<div class="sticker-reactions">
		<template v-for="reaction in reactionsList">
			<app-sticker-reaction-item
				:key="reaction.stickerId"
				:img-url="reaction.imgUrl"
				:count="reaction.count"
			/>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.sticker-reactions
	display: flex
	flex-wrap: wrap
	margin: 4px 0
</style>
