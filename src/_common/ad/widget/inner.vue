<template>
	<!-- We completely regenerate it when the slot ID changes -->
	<div v-if="slotId" :key="slotId" class="ad-widget-inner">
		<!-- Load the ad component for the currently running ad adapter -->
		<component :is="adapter.component(adSlot)" :ad-slot="adSlot" :adapter="adapter" />
	</div>
</template>

<script lang="ts" src="./inner"></script>
