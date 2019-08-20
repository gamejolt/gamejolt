<template>
	<div v-if="isVisible">
		<section class="section section-thin" v-if="Screen.isDesktop">
			<app-ad-widget size="leaderboard" :static-size="staticSize" />
		</section>
		<section class="section section-thin fill-offset" v-else>
			<app-ad-widget size="rectangle" :static-size="staticSize" />
		</section>
	</div>
</template>

<script lang="ts" src="./placement"></script>
