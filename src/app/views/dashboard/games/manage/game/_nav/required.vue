<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { vAppTooltip } from '../../../../../../../_common/tooltip/tooltip-directive';

@Options({
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppManageGameNavRequired extends Vue {
	@Prop(Boolean) isComplete?: boolean;
}
</script>

<template>
	<span v-if="!isComplete" class="manage-game-nav-required">
		<span v-app-tooltip="$gettext(`Required Step`)">
			<AppJolticon notice icon="notice" />
		</span>
	</span>
</template>

<style lang="stylus" scoped>
.manage-game-nav-required
	@media $media-md
		position: absolute
		right: -25px

	@media $media-lg
		position: absolute
		right: 0
</style>
