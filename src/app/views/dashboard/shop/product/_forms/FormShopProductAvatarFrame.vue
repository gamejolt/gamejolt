<script lang="ts" setup>
import { toRefs } from 'vue';
import { AvatarFrameModel } from '../../../../../../_common/avatar/frame.model';
import { defineFormProps } from '../../../../../../_common/form-vue/AppForm.vue';
import { useShopManagerStore } from '../../shop.store';
import FormShopProductBase, { createShopProductBaseForm } from './FormShopProductBase.vue';

const props = defineProps({
	...defineFormProps<AvatarFrameModel>(),
});

const { model } = toRefs(props);

const shopStore = useShopManagerStore()!;

const data = createShopProductBaseForm({
	shopStore,
	typename: 'Avatar_Frame',
	baseModel: model?.value,
});
</script>

<template>
	<FormShopProductBase :data="data" />
</template>
