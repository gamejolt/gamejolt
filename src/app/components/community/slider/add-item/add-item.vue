<script lang="ts">
import { Options, Vue } from 'vue-property-decorator';
import AppCommunityAddWidget from '../../../../../_common/community/add-widget/add-widget.vue';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';

@Options({
	components: {
		AppCommunityAddWidget,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppCommunitySliderAddItem extends Vue {}
</script>

<template>
	<div class="-item">
		<AppCommunityAddWidget />
	</div>
</template>

<style lang="stylus" scoped>
@import '../common'

.-item
	position: relative
	height: $-size-xs
	vertical-align: middle

	@media $media-sm-up
		height: $-size
		// Needed to counteract the height of the label the add button does not have.
		vertical-align: top

	::v-deep(.jolticon)
		font-size: $jolticon-size * 2

	&:not(.-disabled)
		// Undoes pressy()
		transition: none !important
		transform: none !important
</style>
