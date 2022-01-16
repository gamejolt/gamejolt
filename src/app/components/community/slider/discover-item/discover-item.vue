<script lang="ts">
import { Options, Vue } from 'vue-property-decorator';
import AppCommunityDiscoverWidget from '../../../../../_common/community/discover-widget/discover-widget.vue';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';

@Options({
	components: {
		AppCommunityDiscoverWidget,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppCommunitySliderDiscoverItem extends Vue {}
</script>

<template>
	<div class="-item">
		<app-community-discover-widget />
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

		@media $media-mobile
			margin: 0 4px
			font-size: $jolticon-size * 2

	// Undoes pressy()
	transition: none !important
	transform: none !important
</style>
