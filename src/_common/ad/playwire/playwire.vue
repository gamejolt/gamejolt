<template>
	<div>
		<div v-if="slotId" :key="slotId">
			<div :data-pw-desk="placement" />
			<div :data-pw-mobi="placement" />
		</div>
	</div>
</template>

<script lang="ts" src="./playwire"></script>
