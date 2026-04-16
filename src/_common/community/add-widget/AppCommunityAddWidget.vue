<script lang="ts" setup>
import { computed, type HTMLAttributes } from 'vue';
import { RouterLink } from 'vue-router';

import { vAppAuthRequired } from '~common/auth/auth-required-directive';
import { showErrorGrowl } from '~common/growls/growls.service';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import { useCommonStore } from '~common/store/common-store';
import { TooltipPlacement } from '~common/tooltip/tooltip-controller';
import { vAppTooltip } from '~common/tooltip/tooltip-directive';
import { $gettext } from '~common/translate/translate.service';

type Props = {
	tooltipPlacement?: TooltipPlacement;
} & /* @vue-ignore */ Pick<HTMLAttributes, 'onContextmenu' | 'onClick'>;

const { tooltipPlacement = 'bottom' } = defineProps<Props>();

const { user } = useCommonStore();

const canCreate = computed(() => user.value && !!user.value.can_create_communities);

const tooltip = computed(() => {
	let content;
	if (canCreate.value || !user.value) {
		content = $gettext(`Create a community`);
	} else {
		content = $gettext(`You own too many communities`);
	}

	return {
		content,
		placement: tooltipPlacement,
	};
});

function showGrowl() {
	if (!user.value) {
		return;
	}

	showErrorGrowl({
		message: $gettext(
			`You own too many communities. You must remove one before creating another.`
		),
		sticky: true,
	});
}
</script>

<template>
	<RouterLink
		v-if="canCreate"
		v-app-tooltip="tooltip"
		class="-add"
		:to="{ name: 'dash.communities.add' }"
	>
		<AppJolticon icon="add" big />
	</RouterLink>
	<a
		v-else
		v-app-auth-required
		v-app-tooltip="tooltip"
		class="-add"
		:class="{ '-disabled': user }"
		@click="showGrowl"
	>
		<AppJolticon icon="add" big />
	</a>
</template>

<style lang="stylus" scoped>
.-add
	pressy()
	display: flex
	justify-content: center
	align-items: center
	border: $border-width-large dashed
	border-color: var(--theme-fg-muted)
	color: var(--theme-fg-muted)
	border-radius: 100%
	cursor: pointer
	position: absolute
	width: 100%
	height: 100%
	outline: 0

	&:not(.-disabled):hover
		border-color: var(--theme-link)
		color: var(--theme-link)

.-disabled
	unpressy()
	cursor: not-allowed

	> *
		pointer-events: none
</style>
