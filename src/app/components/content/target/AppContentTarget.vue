<script lang="ts">
import { computed, PropType, toRef, toRefs } from 'vue';
import { RouteLocationRaw } from 'vue-router';
import { ComponentProps } from '../../../../_common/component-helpers';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppPill from '../../../../_common/pill/AppPill.vue';
import AppPillBi from '../../../../_common/pill/AppPillBi.vue';

export const CONTENT_TARGET_HEIGHT = 30;
</script>

<script lang="ts" setup>
const props = defineProps({
	noImg: {
		type: Boolean,
	},
	to: {
		type: Object as PropType<RouteLocationRaw>,
		default: undefined,
	},
	leftTo: {
		type: Object as PropType<RouteLocationRaw>,
		default: undefined,
	},
	rightTo: {
		type: Object as PropType<RouteLocationRaw>,
		default: undefined,
	},
	hasRemove: {
		type: Boolean,
	},
	hasRight: {
		type: Boolean,
	},
	bleedImg: {
		type: Boolean,
	},
	noHover: {
		type: Boolean,
	},
});

const { to, leftTo, rightTo, hasRemove, hasRight, bleedImg, noHover } = toRefs(props);

const emit = defineEmits({
	remove: () => true,
	click: (_e: MouseEvent) => true,
});

const component = toRef(() => {
	if (hasRight.value) {
		return AppPillBi;
	}

	return AppPill;
});

const componentProps = computed(() => {
	return {
		bleedImg: bleedImg?.value,
		...(hasRight.value
			? ({
					leftTo: leftTo?.value,
					rightTo: rightTo?.value,
					noHover: noHover.value,
			  } satisfies ComponentProps<typeof AppPillBi>)
			: ({
					to: to?.value,
			  } satisfies ComponentProps<typeof AppPill>)),
	};
});

const contentSlot = computed(() => {
	if (hasRight.value) {
		return 'left';
	}

	return 'default';
});

function onClickRemove() {
	emit('remove');
}
</script>

<template>
	<component
		:is="component"
		class="content-target"
		:class="{ '-bleed-img': bleedImg }"
		:style="{
			height: CONTENT_TARGET_HEIGHT + 'px',
		}"
		v-bind="componentProps"
	>
		<template #img>
			<span class="-img">
				<slot name="img" />
			</span>
		</template>

		<template #[contentSlot]>
			<span class="-row">
				<slot />

				<a v-if="hasRemove && !hasRight" class="text-muted" @click="onClickRemove()">
					<AppJolticon class="-remove" icon="remove" />
				</a>
			</span>
		</template>

		<template v-if="hasRight" #right>
			<span class="-row">
				<slot name="right" />

				<a v-if="hasRemove" class="text-muted" @click="onClickRemove()">
					<AppJolticon class="-remove" icon="remove" />
				</a>
			</span>
		</template>
	</component>
</template>

<style lang="stylus" scoped>
.content-target
	margin: 0

.-row
	display: inline-flex
	align-items: center
	gap: 4px

.-remove
	vertical-align: middle
</style>
