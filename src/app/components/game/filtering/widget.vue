<template>
	<div class="game-filtering-widget">
		<nav class="game-filtering-widget-list platform-list inline">
			<ul>
				<li v-for="filter of filters" :key="filter">
					<app-popper>
						<a v-app-track-event="`game-filtering:tab-${filter}`">
							{{ definitions[filter].label }}
							<template v-if="definitions[filter].type === 'radio'">
								<span class="badge badge-highlight" v-if="filtering.filters[filter]">
									1
								</span>
							</template>
							<template v-else>
								<span
									class="badge badge-highlight"
									v-if="filtering.filters[filter] && filtering.filters[filter].length > 0"
								>
									{{ filtering.filters[filter].length | number }}
								</span>
							</template>

							<app-jolticon icon="chevron-down" />
						</a>

						<div class="game-filtering-widget-list-group list-group list-group-dark" slot="popover">
							<a
								class="list-group-item has-addon"
								v-for="(label, option) of definitions[filter].options"
								:key="option"
								:class="filter === 'os' || filter === 'browser' ? 'has-icon' : ''"
								@click="toggleFilterOption(filter, option)"
								@mouseover="onMouseover(filter, option)"
								@mouseout="onMouseout(filter)"
							>
								<!--
								Array types get checboxes.
							-->
								<div class="list-group-item-addon" v-if="definitions[filter].type === 'array'">
									<app-jolticon
										:icon="filtering.isFilterOptionSet(filter, option) ? 'checkbox' : 'box-empty'"
									/>
								</div>

								<!--
								Radio types get radio button things.
							-->
								<div class="list-group-item-addon" v-if="definitions[filter].type === 'radio'">
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
					</app-popper>
				</li>
			</ul>
		</nav>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.game-filtering-widget
	.jolticon-box-empty, .jolticon-radio-circle
		theme-prop('color', 'fg-muted')
</style>

<script lang="ts" src="./widget" />
