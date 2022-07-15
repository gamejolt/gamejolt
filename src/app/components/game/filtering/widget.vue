<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { Analytics } from '../../../../_common/analytics/analytics.service';
import { formatNumber } from '../../../../_common/filters/number';
import AppPopper from '../../../../_common/popper/AppPopper.vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import { GameFilteringContainer } from './container';

@Options({
	components: {
		AppPopper,
	},
})
export default class AppGameFilteringWidget extends Vue {
	@Prop(Object)
	filtering!: GameFilteringContainer;

	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	hovered: any = {};

	readonly formatNumber = formatNumber;

	get filters() {
		return ['price', 'os', 'browser', 'maturity', 'status', 'partners'];
	}

	get definitions() {
		return GameFilteringContainer.definitions;
	}

	onMouseover(filter: string, option: any) {
		this.hovered[filter] = option;
	}

	onMouseout(filter: string) {
		this.hovered[filter] = null;
	}

	toggleFilterOption(filter: string, option: any) {
		const label = filter + '-' + option;
		if (this.filtering.isFilterOptionSet(filter, option)) {
			Analytics.trackEvent('game-filtering', 'toggle', label + '-off');
		} else {
			Analytics.trackEvent('game-filtering', 'toggle', label + '-on');
		}

		this.filtering.toggleFilterOption(filter, option);
		this.filtering.onChanged();
	}

	getJolticon(filter: string, option: any) {
		if (filter === 'os') {
			return option === 'other' ? 'other-os' : option;
		} else if (filter === 'browser') {
			if (option === 'html') {
				return 'html5';
			} else if (option === 'applet') {
				return 'java';
			} else {
				return option;
			}
		}
	}
}
</script>

<template>
	<div class="game-filtering-widget">
		<nav class="game-filtering-widget-list platform-list inline">
			<ul>
				<li v-for="filter of filters" :key="filter">
					<AppPopper popover-class="fill-darkest">
						<a v-app-track-event="`game-filtering:tab-${filter}`">
							{{ definitions[filter].label }}
							<template v-if="definitions[filter].type === 'radio'">
								<span
									v-if="filtering.filters[filter]"
									class="badge badge-highlight"
								>
									1
								</span>
							</template>
							<template v-else>
								<span
									v-if="
										filtering.filters[filter] &&
										filtering.filters[filter].length > 0
									"
									class="badge badge-highlight"
								>
									{{ formatNumber(filtering.filters[filter].length) }}
								</span>
							</template>

							<AppJolticon icon="chevron-down" />
						</a>

						<template #popover>
							<div
								class="game-filtering-widget-list-group list-group list-group-dark"
							>
								<a
									v-for="(label, option) of definitions[filter].options"
									:key="option"
									class="list-group-item has-addon"
									:class="
										filter === 'os' || filter === 'browser' ? 'has-icon' : ''
									"
									@click="toggleFilterOption(filter, option)"
									@mouseover="onMouseover(filter, option)"
									@mouseout="onMouseout(filter)"
								>
									<!-- Array types get checboxes. -->
									<div
										v-if="definitions[filter].type === 'array'"
										class="list-group-item-addon"
									>
										<AppJolticon
											:icon="
												filtering.isFilterOptionSet(filter, option)
													? 'checkbox'
													: 'box-empty'
											"
										/>
									</div>

									<!-- Radio types get radio button things. -->
									<div
										v-if="definitions[filter].type === 'radio'"
										class="list-group-item-addon"
									>
										<AppJolticon
											:icon="
												filtering.isFilterOptionSet(filter, option)
													? hovered[filter] === option
														? 'remove'
														: 'radio-circle-filled'
													: 'radio-circle'
											"
										/>
									</div>

									<AppJolticon
										v-if="filter === 'os' || filter === 'browser'"
										:icon="getJolticon(filter, option)"
									/>

									{{ label }}
								</a>
							</div>
						</template>
					</AppPopper>
				</li>
			</ul>
		</nav>
	</div>
</template>

<style lang="stylus" scoped>
.game-filtering-widget
	.jolticon-box-empty
	.jolticon-radio-circle
		theme-prop('color', 'fg-muted')
</style>
