<script lang="ts">
import { Options, Vue } from 'vue-property-decorator';

@Options({})
export default class AppTimelineList extends Vue {}
</script>

<template>
	<div class="timeline-list">
		<slot />
	</div>
</template>
