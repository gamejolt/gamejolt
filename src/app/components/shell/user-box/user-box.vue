<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Vue } from 'vue-property-decorator';
import { formatNumber } from '../../../../_common/filters/number';
import AppProgressBar from '../../../../_common/progress/bar/bar.vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';

@Options({
	components: {
		AppProgressBar,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppShellUserBox extends Vue {
	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	readonly formatNumber = formatNumber;
}
</script>

<template>
	<div class="user-box-exp">
		<div class="user-box-exp-stats">
			<div class="user-box-exp-stats-current">
				Level
				<em>{{ app.user.level }}</em>
				<span class="user-box-exp-stats-help">
					[
					<AppLinkHelp page="user-exp"> ? </AppLinkHelp>
					]
				</span>
			</div>
			<div class="user-box-exp-stats-next">
				Next in
				<strong>{{ formatNumber(app.user.experience_next) }}</strong>
				EXP
			</div>
		</div>
		<div class="user-box-exp-progress">
			<AppJolticon icon="exp" />
			<AppProgressBar
				thin
				:percent="app.user.level_next_percentage"
				v-app-tooltip="`${app.user.level_next_percentage}% progress to next level`"
			/>
			<!-- <div class="progress progress-thin progress-green"
			>
			<div class="progress-bar" :style="{ width: app.user.level_next_percentage + '%' }"></div>
		</div> -->
		</div>
	</div>
</template>

<style lang="stylus" src="./user-box.styl" scoped></style>
