<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { useRouter } from 'vue-router';
import { AuthModal } from '../../../../_common/auth/auth-modal.service';
import { Community } from '../../../../_common/community/community.model';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { FiresideAddModal } from '../add-modal/add-modal.service';
import AppFiresideAvatarBase from './AppFiresideAvatarBase.vue';

const props = defineProps({
	community: {
		type: Object as PropType<Community>,
		default: undefined,
	},
});

const { community } = toRefs(props);
const { user } = useCommonStore();
const router = useRouter();

const isDisabled = computed(() => {
	if (!user.value) {
		return false;
	}
	return !!community?.value && !community?.value.is_member;
});

async function onClick() {
	if (!user.value) {
		AuthModal.show();
		return;
	}

	if (isDisabled.value) {
		return;
	}

	const fireside = await FiresideAddModal.show({ community: community?.value });
	if (fireside instanceof Fireside) {
		router.push(fireside.routeLocation);
	}
}
</script>

<template>
	<AppFiresideAvatarBase :class="{ '-disabled': isDisabled }" border-highlight border-dashed>
		<template #avatar>
			<AppJolticon class="-icon" icon="add" />
		</template>

		<template #title>
			<AppTranslate>Start a Fireside</AppTranslate>
		</template>

		<template #link>
			<a
				v-app-tooltip.touchable="
					isDisabled
						? $gettext(`Only members of this community can create a fireside in it.`)
						: null
				"
				@click="onClick"
			/>
		</template>
	</AppFiresideAvatarBase>
</template>

<style lang="stylus" scoped>
.-disabled
	filter: brightness(0.4)

	&
	a
		cursor: not-allowed

@media $media-sm-up
	.-icon
		font-size: $jolticon-size * 1.5
</style>
