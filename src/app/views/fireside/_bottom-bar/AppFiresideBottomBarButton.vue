<script lang="ts" setup>
import { PropType } from 'vue';
import AppJolticon, { Jolticon } from '../../../../_common/jolticon/AppJolticon.vue';

defineProps({
	icon: {
		type: String as PropType<Jolticon>,
		required: true,
	},
	active: {
		type: Boolean,
	},
	disabled: {
		type: Boolean,
	},
	badge: {
		type: String,
		default: undefined,
	},
	showSettings: {
		type: Boolean,
	},
	activeColor: {
		type: String as PropType<'primary' | 'overlay-notice'>,
		default: 'primary',
	},
});

const emit = defineEmits({
	click: () => true,
	clickSettings: () => true,
});
</script>

<template>
	<div
		class="-button-wrapper"
		:class="{
			'-active-notice': activeColor === 'overlay-notice',
			'-active-primary': activeColor === 'primary',
		}"
	>
		<button
			class="-button"
			:class="{ '-active': active }"
			:disabled="disabled ? 'true' : undefined"
			@click="emit('click')"
		>
			<AppJolticon class="-icon" :icon="icon" />

			<span v-if="badge" class="-badge badge badge-overlay-notice">{{ badge }}</span>
		</button>

		<a v-if="showSettings" class="-settings-wrapper" @click="emit('clickSettings')">
			<div class="-settings">
				<AppJolticon class="-settings-icon" icon="cog" />
			</div>
		</a>
	</div>
</template>

<style lang="stylus" scoped>
.-button-wrapper
	position: relative

.-active-notice
	--active-bg: $gj-overlay-notice
	--active-fg: white

.-active-primary
	--active-bg: var(--theme-primary)
	--active-fg: var(--theme-primary-fg)

.-button
	flex: none
	display: flex
	align-items: center
	justify-content: center
	width: 40px
	height: 40px
	border-radius: 100%
	background-color: rgba(0, 0, 0, 0.65)
	border: 0
	outline: 0
	color: white
	cursor: pointer

	&:disabled
		cursor: not-allowed
		opacity: 0.5

	&.-active
	&:hover:not(:disabled)
		background-color: var(--active-bg)
		color: var(--active-fg)

.-badge
	position: absolute
	top: -5px
	right: -10px

// The wrapper gives the tiny button a little bit more click area.
.-settings-wrapper
	position: absolute
	bottom: -6px
	right: -4px
	display: flex
	align-items: center
	justify-content: center
	width: 20px
	height: 20px
	cursor: pointer

	&:hover .-settings
		background-color: var(--theme-primary)
		color: var(--theme-primary-fg)

.-settings
	display: flex
	align-items: center
	justify-content: center
	width: 16px
	height: 16px
	border-radius: 100%
	background-color: rgba(0, 0, 0, 0.65)
	color: white

.-settings-icon
	font-size: 13px
	position: relative
</style>
