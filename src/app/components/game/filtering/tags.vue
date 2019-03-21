<template>
	<div class="game-filtering-tags" v-if="!filtering.areTagFiltersEmpty || tag">
		<a v-if="tag" class="tag tag-highlight game-filtering-tag" @click="clearTag()">
			<strong>
				<translate>Tag</translate>
				:
			</strong>
			{{ tag.label }}
			<app-jolticon icon="remove" />
		</a>

		<span
			v-for="(value, filter) of filtering.filters"
			:key="filter"
			v-if="GameFilteringContainer.definitions[filter].type !== 'string' && value"
		>
			<!-- Array type -->
			<template v-if="GameFilteringContainer.definitions[filter].type === 'array'">
				<span v-for="(option, index) of value" :key="index">
					<a
						class="tag tag-highlight game-filtering-tag"
						@click="removeFilterOption(filter, option)"
					>
						<strong>{{ GameFilteringContainer.definitions[filter].label }}:</strong>
						{{ GameFilteringContainer.definitions[filter].options[option] }}
						<app-jolticon icon="remove" />
					</a>
				</span>
			</template>

			<!-- Radio type -->
			<template v-else-if="GameFilteringContainer.definitions[filter].type === 'radio'">
				<a class="tag tag-highlight game-filtering-tag" @click="removeFilterOption(filter, value)">
					<strong>{{ GameFilteringContainer.definitions[filter].label }}:</strong>
					{{ GameFilteringContainer.definitions[filter].options[value] }}
					<app-jolticon icon="remove" />
				</a>
			</template>
		</span>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.game-filtering-tags
	margin-bottom: $line-height-computed

	a
		user-select: none

.game-filtering-tag
	margin-right: 5px
</style>

<script lang="ts" src="./tags" />
