<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import AppCard from '../../../../_common/card/AppCard.vue';
import { formatNumber } from '../../../../_common/filters/number';
import AppProgressBar from '../../../../_common/progress/AppProgressBar.vue';

@Options({
	components: {
		AppCard,
		AppProgressBar,
	},
})
export default class AppTrophyCompletion extends Vue {
	@Prop(Number)
	total!: number;

	@Prop(Number)
	achieved!: number;

	@Prop(Number)
	experience!: number;

	@Prop({ type: Boolean, default: true })
	isLoggedInUser!: boolean;

	readonly formatNumber = formatNumber;

	get completionRate() {
		return Math.ceil((this.achieved / this.total) * 100);
	}
}
</script>

<template>
	<AppCard class="trophy-completion">
		<template v-if="achieved > 0">
			<p>
				<span
					v-if="isLoggedInUser"
					v-translate="{
						achieved: formatNumber(achieved),
						total: formatNumber(total),
					}"
				>
					You've achieved
					<b>%{ achieved }</b>
					trophies out of a possible
					<b>%{ total }</b>
					.
				</span>
				<span
					v-else
					v-translate="{
						achieved: formatNumber(achieved),
						total: formatNumber(total),
					}"
				>
					They've achieved
					<b>%{ achieved }</b>
					trophies out of a possible
					<b>%{ total }</b>
					.
				</span>
			</p>
			<br />

			<AppProgressBar thin :percent="completionRate" />

			<div class="clearfix">
				<div class="pull-left">
					<div class="stat-big stat-big-smaller" style="margin-bottom: 0">
						<div class="stat-big-digit">{{ formatNumber(completionRate) }}%</div>
						<div class="stat-big-label">
							<AppTranslate>Completion</AppTranslate>
						</div>
					</div>
				</div>
				<div class="pull-right">
					<div class="stat-big stat-big-smaller text-right" style="margin-bottom: 0">
						<div class="stat-big-digit">
							<AppJolticon icon="exp" class="text-muted" />
							{{ formatNumber(experience) }}
						</div>
						<div class="stat-big-label">
							<AppTranslate>EXP Gained</AppTranslate>
						</div>
					</div>
				</div>
			</div>
		</template>
		<template v-else>
			<AppTranslate>You haven't achieved any trophies for this game yet!</AppTranslate>
		</template>
	</AppCard>
</template>
