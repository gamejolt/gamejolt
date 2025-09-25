<script lang="ts" setup>
import { computed, reactive } from 'vue';
import { formatNumber } from '../../../../_common/filters/number';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppPopper from '../../../../_common/popper/AppPopper.vue';
import { GameFilteringContainer } from './container';

type Props = {
	filtering: GameFilteringContainer;
};

const { filtering } = defineProps<Props>();

const hovered = reactive<Record<string, any>>({});

const filterOptions = ['price', 'os', 'browser', 'maturity', 'status', 'partners'];

const definitions = computed(() => GameFilteringContainer.definitions);

function onMouseover(filter: string, option: any) {
	hovered[filter] = option;
}

function onMouseout(filter: string) {
	hovered[filter] = null;
}

function toggleFilterOption(filter: string, option: any) {
	filtering.toggleFilterOption(filter, option);
	filtering.onChanged();
}

function getJolticon(filter: string, option: any) {
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
</script>

<template>
	<div class="game-filtering-widget">
		<nav class="game-filtering-widget-list platform-list inline">
			<ul>
				<li v-for="filter of filterOptions" :key="filter">
					<AppPopper popover-class="fill-darkest">
						<a>
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
