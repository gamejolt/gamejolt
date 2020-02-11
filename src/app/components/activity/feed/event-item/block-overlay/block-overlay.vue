<template>
	<div>
		<div v-if="shouldBlock" class="alert -hidden">
			<span v-translate="{ username: posterUsername }">
				Hidden post by blocked user <b>@%{ username }</b>.
			</span>
			<app-button trans @click="unhide">
				<translate>Show</translate>
			</app-button>
		</div>
		<div v-else>
			<slot />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '../../variables'

.-hidden
	-activity-feed-item()
	display: flex
	justify-content: space-between
	align-items: center
	padding-top: 10px !important
	padding-bottom: 10px !important
	margin: 0

	button
		margin: 0

	&:hover
		cursor: default

</style>

<script lang="ts" src="./block-overlay"></script>
