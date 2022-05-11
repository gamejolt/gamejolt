<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Vue } from 'vue-property-decorator';
import { formatNumber } from '../../../../_common/filters/number';
import AppProgressBar from '../../../../_common/progress/AppProgressBar.vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';

@Options({
	components: {
		AppProgressBar,
	},
	directives: {
		AppTooltip: vAppTooltip,
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
		</div>
	</div>
</template>

<style lang="stylus" src="./user-box.styl" scoped></style>
