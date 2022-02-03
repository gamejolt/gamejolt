<script lang="ts">
import { Options, Vue } from 'vue-property-decorator';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';

@Options({
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppFiresideHostListStickerButton extends Vue {}
</script>

<template>
	<div v-app-tooltip="$gettext(`Stickers`)" class="-options">
		<AppJolticon class="-icon" icon="sticker" />
	</div>
</template>

<style lang="stylus" scoped>
@import '../../common'
</style>
