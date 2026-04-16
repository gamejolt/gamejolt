<script lang="ts">
import { computed, toRef } from 'vue';
import { RouteLocationRaw } from 'vue-router';

import { ComponentProps } from '../../../../_common/component-helpers';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppPill from '../../../../_common/pill/AppPill.vue';
import AppPillBi from '../../../../_common/pill/AppPillBi.vue';

export const CONTENT_TARGET_HEIGHT = 30;
</script>

<script lang="ts" setup>
type Props = {
	noImg?: boolean;
	to?: RouteLocationRaw;
	leftTo?: RouteLocationRaw;
	rightTo?: RouteLocationRaw;
	hasRemove?: boolean;
	hasRight?: boolean;
	bleedImg?: boolean;
	noHover?: boolean;
};
const { to, leftTo, rightTo, hasRemove, hasRight, bleedImg, noHover } = defineProps<Props>();

const emit = defineEmits<{
	remove: [];
	click: [e: MouseEvent];
}>();

const component = toRef(() => {
	if (hasRight) {
		return AppPillBi;
	}

	return AppPill;
});

const componentProps = computed(() => {
	return {
		bleedImg: bleedImg,
		...(hasRight
			? ({
					leftTo: leftTo,
					rightTo: rightTo,
					noHover: noHover,
			  } satisfies ComponentProps<typeof AppPillBi>)
			: ({
					to: to,
			  } satisfies ComponentProps<typeof AppPill>)),
	};
});

const contentSlot = computed(() => {
	if (hasRight) {
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
