<script lang="ts">
import { Options, Vue } from 'vue-property-decorator';

@Options({})
export default class AppShellHotBottom extends Vue {}
</script>

<template>
	<div id="shell-hot-bottom">
		<slot></slot>
	</div>
</template>

<style lang="stylus" scoped>
#shell-hot-bottom
	position: fixed
	z-index: $zindex-shell-hot-bottom
</style>
