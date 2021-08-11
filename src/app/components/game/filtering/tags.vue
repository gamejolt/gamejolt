<script lang="ts" src="./tags"></script>

<template>
	<div v-if="!filtering.areTagFiltersEmpty || tag" class="game-filtering-tags">
		<a v-if="tag" class="tag tag-highlight game-filtering-tag" @click="clearTag()">
			<strong><translate>Tag</translate>:</strong>
			{{ tag.label }}
			<app-jolticon icon="remove" />
		</a>

		<span v-for="filter of filters" :key="filter.key">
			<template v-if="filter.type === 'array'">
				<span v-for="(option, i) of filter.options" :key="i">
					<a
						class="tag tag-highlight game-filtering-tag"
						@click="removeFilterOption(filter.key, option)"
					>
						<strong>{{ filter.label }}:</strong>
						{{ option }}
						<app-jolticon icon="remove" />
					</a>
				</span>
			</template>
			<template v-else-if="filter.type === 'radio'">
				<a
					class="tag tag-highlight game-filtering-tag"
					@click="removeFilterOption(filter.key, filter.value)"
				>
					<strong>{{ filter.label }}:</strong>
					{{ filter.valueLabel }}
					<app-jolticon icon="remove" />
				</a>
			</template>
		</span>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

.game-filtering-tags
	margin-bottom: $line-height-computed

	a
		user-select: none

.game-filtering-tag
	margin-right: 5px
</style>
