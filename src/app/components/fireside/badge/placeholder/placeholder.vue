<script lang="ts">
import { Options, Vue } from 'vue-property-decorator';

@Options({})
export default class AppFiresideBadgePlaceholder extends Vue {}
</script>

<template>
	<div class="fireside-badge-placeholder fill-dark" />
</template>

<style lang="stylus" scoped>
.fireside-badge-placeholder
	clearfix()
	full-bleed-xs()
	rounded-corners-lg()
	margin-bottom: $line-height-computed
	height: 70px
</style>
