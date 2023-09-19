<script lang="ts" setup>
import { PropType, computed, toRefs } from 'vue';
import { useRouter } from 'vue-router';
import AppForm, { createForm } from '../../../../../../_common/form-vue/AppForm.vue';
import { showErrorGrowl } from '../../../../../../_common/growls/growls.service';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import { sleep } from '../../../../../../utils/utils';
import { useShopManagerStore } from '../../RouteDashShop.vue';
import { routeDashShopOverview } from '../../overview/overview.route';
import AppShopProductFields, { createBaseShopProductForm } from '../AppShopProductFields.vue';

const props = defineProps({
	modelId: {
		type: Number as PropType<number | undefined>,
		required: true,
	},
	premium: {
		type: Boolean,
		required: true,
	},
});

const { modelId, premium } = toRefs(props);

const router = useRouter();

const controller = useShopManagerStore()!;

const item = computed(() => {
	return controller.avatarFrames.value.items.find(i => i.id === modelId.value);
});

const data = createBaseShopProductForm({
	id: modelId.value,
	typename: 'Avatar_Frame',
	fields: {
		name: item?.value?.name ?? '',
		// artist: item?.value.artist ?? '',
		description: item?.value?.description ?? '',
		img_url: item?.value?.image_url ?? '',
	},
	toEdit: item?.value,
	isPremium: premium.value,
});

const {
	existingModel,
	model,

	// Restrictions
	// minNameLength,
	// maxNameLength,
	// maxFilesize,
	// minSize,
	// maxSize,
	// aspectRatio,
	canEditFree,
	canEditPremium,

	// Helpers
	loadUrl,
	onLoad,
	// assignNonNull,

	// ...
	changeRequest,
	rejectedChangeRequest,
} = data;

const form = createForm({
	loadUrl,
	model,
	onLoad,
	onSubmit() {
		return sleep(1_000);
	},
	onSubmitError(response) {
		// TODO(creator-shops) errors
		let message: string | null = null;

		showErrorGrowl(message || $gettext(`There was an error saving your product.`));
	},
	onSubmitSuccess() {
		// TODO(creator-shops) best way to go back to the overview?
		router.replace({
			name: routeDashShopOverview.name,
		});
	},
});
</script>

<template>
	<AppForm :controller="form">
		<AppShopProductFields :data="data" />
	</AppForm>
</template>
