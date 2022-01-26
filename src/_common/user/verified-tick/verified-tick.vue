<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { ChatUser } from '../../../app/components/chat/user';
import { AppTooltip } from '../../tooltip/tooltip-directive';
import { User } from '../user.model';

@Options({
	directives: {
		AppTooltip,
	},
})
export default class AppUserVerifiedTick extends Vue {
	@Prop(Object)
	user!: User | ChatUser;

	@Prop(Boolean)
	highlight!: boolean;

	@Prop(Boolean)
	big!: boolean;

	@Prop(Boolean)
	small!: boolean;

	@Prop(Boolean)
	verticalAlign!: boolean;

	get shouldShow() {
		return this.user.is_verified;
	}

	get icon() {
		if (this.user.is_verified) {
			return 'verified';
		}
	}

	get tooltip() {
		if (this.user.is_verified) {
			return this.$gettext(`Verified Account`);
		}
	}
}
</script>

<template>
	<AppJolticon
		v-if="shouldShow"
		v-app-tooltip="tooltip"
		:class="{
			'-highlight': highlight,
			'-vertical-align': verticalAlign,
			'-small': small,
		}"
		:icon="icon"
		:big="big"
	/>
</template>

<style lang="stylus" scoped>
$jolticon-size = 16px

.-vertical-align
	vertical-align: middle

.-highlight
	theme-prop('color', 'highlight')

.-small
	margin: 0 2px
	font-size: $jolticon-size * 0.85
</style>
