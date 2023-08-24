<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { formatNumber } from '../../../../_common/filters/number';
import AppProgressBar from '../../../../_common/progress/AppProgressBar.vue';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { UserModel } from '../../../../_common/user/user.model';

@Options({
	components: {
		AppProgressBar,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppUserLevelWidget extends Vue {
	@Prop(Object) user!: UserModel;

	readonly formatNumber = formatNumber;

	get tooltip() {
		return this.$gettextInterpolate('%{ percentage }% progress to next level', {
			percentage: this.user.level_next_percentage,
		});
	}
}
</script>

<template>
	<div class="user-level-widget">
		<div class="user-level-widget-level fill-darkest">
			<div class="user-level-widget-level-digit">{{ user.level }}</div>
			<div class="user-level-widget-level-label">Current Level</div>
		</div>
		<div class="user-level-widget-experience fill-offset text-right">
			<div class="stat-big stat-big-smaller">
				<div class="stat-big-label">Current EXP</div>
				<div class="stat-big-digit">{{ formatNumber(user.experience) }} EXP</div>
			</div>
			<div class="stat-big stat-big-smaller">
				<div class="stat-big-label">Next Level in</div>
				<div class="stat-big-digit">{{ formatNumber(user.experience_next) }} EXP</div>
			</div>
		</div>
		<AppProgressBar
			class="user-level-widget-progress"
			thin
			:percent="user.level_next_percentage"
			v-app-tooltip="tooltip"
		/>
	</div>
</template>

<style lang="stylus" scoped>
.user-level-widget-level
	float: left
	padding: 10px 0
	width: 110px
	height: 140px
	text-align: center
	border-top-left-radius: $border-radius-large
	border-bottom-left-radius: $border-radius-large

.user-level-widget-level-digit
	theme-prop('color', 'highlight')
	padding-top: 15px
	font-weight: 300
	font-size: $font-size-h2

.user-level-widget-level-label
	theme-prop('color', 'fg-muted')
	font-size: $font-size-small

.user-level-widget-experience
	padding: 7px
	height: 140px
	border-top-right-radius: $border-radius-large
	border-bottom-right-radius: $border-radius-large

.user-level-widget-progress
	margin-top: 5px
</style>
