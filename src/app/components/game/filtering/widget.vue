<script lang="ts" src="./widget"></script>

<template>
	<div class="game-filtering-widget">
		<nav class="game-filtering-widget-list platform-list inline">
			<ul>
				<li v-for="filter of filters" :key="filter">
					<app-popper popover-class="fill-darkest">
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
									{{ filtering.filters[filter].length | number }}
								</span>
							</template>

							<app-jolticon icon="chevron-down" />
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
										<app-jolticon
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
										<app-jolticon
											:icon="
												filtering.isFilterOptionSet(filter, option)
													? hovered[filter] === option
														? 'remove'
														: 'radio-circle-filled'
													: 'radio-circle'
											"
										/>
									</div>

									<app-jolticon
										v-if="filter === 'os' || filter === 'browser'"
										:icon="getJolticon(filter, option)"
									/>

									{{ label }}
								</a>
							</div>
						</template>
					</app-popper>
				</li>
			</ul>
		</nav>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.game-filtering-widget
	.jolticon-box-empty
	.jolticon-radio-circle
		theme-prop('color', 'fg-muted')
</style>
