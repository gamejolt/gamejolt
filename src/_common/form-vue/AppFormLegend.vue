<script lang="ts" setup>
import type { HTMLAttributes } from 'vue';

import AppButton from '~common/button/AppButton.vue';

type Props = {
	compact?: boolean;
	expandable?: boolean;
	expanded?: boolean;
	deletable?: boolean;
} & /* @vue-ignore */ Pick<HTMLAttributes, 'onClick'>;

const {
	compact = false,
	expandable = false,
	expanded = false,
	deletable = false,
} = defineProps<Props>();

const emit = defineEmits<{
	delete: [];
}>();
</script>

<template>
	<legend
		:class="{
			'-compact': compact,
			'-expandable': expandable,
			'-deletable': deletable,
		}"
	>
		<div class="-inner">
			<div v-if="expandable" class="-expander">{{ expanded ? `[-]` : `[+]` }}</div>
			<div class="-label"><slot /></div>
			<div v-if="compact" class="-compactbar" />
			<div v-if="deletable" class="-delete">
				<AppButton sparse circle icon="remove" @click="emit('delete')" />
			</div>
		</div>
	</legend>
</template>

<style lang="stylus" scoped>
.-compact
	position: relative
	font-size: $font-size-h4
	border: 0

.-expandable
	cursor: pointer
	user-select: none

.-inner
	display: flex
	align-items: center

.-expander
	flex: none
	// This makes it so that the expander takes up the same amount of space.
	font-family: monospace

.-label
	flex: none

.-compactbar
	theme-prop('border-bottom-color', 'bg-subtle')
	flex: auto
	height: 0
	border-bottom-width: $border-width-large
	border-bottom-style: solid
	margin-left: 20px

.-delete
	flex: none
	margin-left: 20px
</style>
