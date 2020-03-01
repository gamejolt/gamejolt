<template>
	<div v-if="isVisible">
		<section class="section section-thin" v-if="Screen.isDesktop">
			<app-ad-widget size="leaderboard" :meta="meta" />
		</section>
		<section class="section section-thin fill-offset" v-else>
			<app-ad-widget size="rectangle" :meta="meta" />
		</section>
	</div>
</template>

<script lang="ts" src="./placement"></script>
