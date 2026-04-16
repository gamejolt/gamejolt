<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

import { Api } from '../../api/api.service';
import AppPopper from '../../popper/AppPopper.vue';
import { Screen } from '../../screen/screen-service';
import { UserModel } from '../user.model';
import AppUserCard from './AppUserCard.vue';

type Props = {
	user?: UserModel | null;
	disabled?: boolean;
	hoverDelay?: number;
	noStats?: boolean;
	disableFollowWidget?: boolean;
	/**
	 * Query selector that {@link AppPopper} can use to teleport the popover
	 * content.
	 */
	to?: string;
};
const { user, disabled, hoverDelay = 500, noStats, to } = defineProps<Props>();

const emit = defineEmits<{
	show: [];
	hide: [];
	hovered: [];
	unhovered: [];
}>();

const isShowing = ref(false);
const isLoaded = ref(false);

const isDisabled = computed(() => Screen.isXs || !!disabled || import.meta.env.SSR);

const component = computed(() => {
	return isDisabled.value ? 'span' : AppPopper;
});

const componentProps = computed(() => {
	return isDisabled.value
		? {}
		: {
				placement: 'top',
				trigger: 'hover',
				showDelay: hoverDelay,
				block: true,
				to: to,
		  };
});

const componentOn = computed(() => {
	return isDisabled.value
		? {}
		: {
				show: () => onShow(),
				hide: () => onHide(),
				mouseEnter: () => onMouseEnter(),
				mouseLeave: () => onMouseLeave(),
		  };
});

function onUserChange() {
	if (user) {
		isLoaded.value = false;
	}
}

function onShow() {
	emit('show');
	isShowing.value = true;
	if (!isLoaded.value && !noStats) {
		fetchCardInfo();
	}
}

function onHide() {
	isShowing.value = false;
	emit('hide');
}

function onMouseEnter() {
	emit('hovered');
}

function onMouseLeave() {
	emit('unhovered');
}

async function fetchCardInfo() {
	if (!user) {
		return;
	}

	const response = await Api.sendRequest('/web/profile/card/' + user.id, undefined, {
		detach: true,
	});

	isLoaded.value = true;

	// Assign to the user to make sure the following status is up to date.
	user.assign(response.user);
}

watch(() => user?.id, onUserChange);
</script>

<template>
	<component :is="component" v-bind="componentProps" v-on="componentOn">
		<slot />

		<template v-if="user && isShowing" #popover>
			<AppUserCard
				class="-card"
				:user="user!"
				:is-loading="!isLoaded"
				:no-stats="noStats"
				:disable-follow-widget="disableFollowWidget"
			>
				<template v-if="noStats" #trailing>
					<slot name="trailing" />
				</template>
			</AppUserCard>
		</template>
	</component>
</template>

<style lang="stylus" scoped>
.-card
	border-radius: 0
	margin: 0 !important
</style>
