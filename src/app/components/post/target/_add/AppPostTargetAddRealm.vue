<script lang="ts" setup>
import { PropType } from 'vue';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import { Realm } from '../../../../../_common/realm/realm-model';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import AppFormsPillSelectorRealms from '../../../forms/pill-selector/realms/AppFormsPillSelectorRealms.vue';
import AppPostTarget from '../AppPostTarget.vue';

defineProps({
	realms: {
		type: Array as PropType<Realm[]>,
		required: true,
	},
	isLoading: {
		type: Boolean,
	},
});

const emit = defineEmits({
	select: (_realm: Realm) => true,
	show: () => true,
});

function onSelectRealm(realm: Realm) {
	emit('select', realm);
}
</script>

<template>
	<AppFormsPillSelectorRealms
		:realms="realms"
		:is-loading="isLoading"
		@show="emit('show')"
		@select="onSelectRealm"
	>
		<template #default>
			<AppPostTarget class="-add">
				<template #img>
					<AppJolticon icon="add" />
				</template>

				<AppTranslate>Add realm</AppTranslate>
			</AppPostTarget>
		</template>
	</AppFormsPillSelectorRealms>
</template>
