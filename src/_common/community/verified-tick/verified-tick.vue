<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { AppTooltip } from '../../tooltip/tooltip-directive';
import { Community } from '../community.model';

@Options({
	directives: {
		AppTooltip,
	},
})
export default class AppCommunityVerifiedTick extends Vue {
	@Prop(Object)
	community!: Community;

	@Prop(Boolean)
	big!: boolean;

	@Prop(Boolean)
	small!: boolean;

	@Prop(Boolean)
	noTooltip!: boolean;

	get tooltip() {
		if (this.community.is_verified && !this.noTooltip) {
			return this.$gettext('Verified Community');
		}
	}
}
</script>

<template>
	<app-jolticon
		v-if="community.is_verified"
		:class="{
			'-small': small,
		}"
		icon="verified"
		:big="big"
		v-app-tooltip="tooltip"
	/>
</template>

<style lang="stylus" scoped>
$jolticon-size = 16px

.-small
	margin: 0 2px
	font-size: $jolticon-size * 0.85
</style>
