<template>
	<!-- We completely regenerate it when the slot ID changes -->
	<div v-if="adSlot.id" :key="adSlot.id">
		<!-- Load the ad component for the currently running ad adapter -->
		<component :is="$ad.adapter.component(adSlot)" :ad-slot="adSlot" :adapter="$ad.adapter" />
	</div>
</template>

<script lang="ts" src="./inner"></script>
