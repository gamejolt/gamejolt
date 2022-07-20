<script lang="ts">
import { computed, PropType, ref, toRefs, watch } from 'vue';
import { Api } from '../../api/api.service';
import AppPopper from '../../popper/AppPopper.vue';
import { Screen } from '../../screen/screen-service';
import { User } from '../user.model';
import AppUserCard from './AppUserCard.vue';
</script>

<script lang="ts" setup>
const props = defineProps({
	user: {
		type: Object as PropType<User>,
		default: undefined,
	},
	disabled: {
		type: Boolean,
	},
	hoverDelay: {
		type: Number,
		default: 500,
		validator: val => typeof val === 'number' && val >= 0,
	},
	noStats: {
		type: Boolean,
	},
	disableFollowWidget: {
		type: Boolean,
	},
});

const emit = defineEmits({
	show: () => true,
	hide: () => true,
});

const { user, disabled, hoverDelay, noStats } = toRefs(props);

const isShowing = ref(false);
const isLoaded = ref(false);

const isDisabled = computed(() => Screen.isXs || !!disabled.value || import.meta.env.SSR);

const component = computed(() => {
	return isDisabled.value ? 'span' : AppPopper;
});

const componentProps = computed(() => {
	return isDisabled.value
		? {}
		: {
				placement: 'top',
				trigger: 'hover',
				showDelay: hoverDelay.value,
				block: true,
		  };
});

const componentOn = computed(() => {
	return isDisabled.value
		? {}
		: {
				show: () => onShow(),
				hide: () => onHide(),
		  };
});

function onUserChange() {
	if (user?.value) {
		isLoaded.value = false;
	}
}

function onShow() {
	emit('show');
	isShowing.value = true;
	if (!isLoaded.value && !noStats.value) {
		fetchCardInfo();
	}
}

function onHide() {
	isShowing.value = false;
	emit('hide');
}

async function fetchCardInfo() {
	if (!user?.value) {
		return;
	}

	const response = await Api.sendRequest('/web/profile/card/' + user.value.id, undefined, {
		detach: true,
	});

	isLoaded.value = true;

	// Assign to the user to make sure the following status is up to date.
	user.value.assign(response.user);
}

watch(() => user?.value?.id, onUserChange);
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
