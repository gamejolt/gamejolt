<script lang="ts" setup>
import { PropType, toRefs } from 'vue';
import AppLoading from '../../../../../_common/loading/AppLoading.vue';
import { Popper } from '../../../../../_common/popper/popper.service';
import AppRealmThumbnail from '../../../../../_common/realm/AppRealmThumbnail.vue';
import { Realm } from '../../../../../_common/realm/realm-model';
import AppFormsPillSelector from '../AppFormsPillSelector.vue';
import AppFormsPillSelectorItem from '../_item/AppFormsPillSelectorItem.vue';

const props = defineProps({
	realms: {
		type: Array as PropType<Realm[]>,
		required: true,
	},
	isLoading: {
		type: Boolean,
	},
});

const { realms } = toRefs(props);

const emit = defineEmits({
	show: () => true,
	select: (_realm: Realm) => true,
});

function selectRealm(realm: Realm) {
	emit('select', realm);

	Popper.hideAll();
}
</script>

<template>
	<AppFormsPillSelector @show="emit('show')">
		<slot />

		<template #popover>
			<AppLoading v-if="isLoading" centered hide-label stationary />
			<template v-else>
				<AppFormsPillSelectorItem
					v-for="realm of realms"
					:key="realm.id"
					@click="selectRealm(realm)"
				>
					<template #img>
						<AppRealmThumbnail :realm="realm" />
					</template>

					<template #default>
						{{ realm.name }}
					</template>
				</AppFormsPillSelectorItem>
			</template>
		</template>
	</AppFormsPillSelector>
</template>
