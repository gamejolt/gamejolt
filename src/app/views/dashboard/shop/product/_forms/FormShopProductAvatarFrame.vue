<script lang="ts" setup>
import { toRefs } from 'vue';
import { AvatarFrameModel } from '../../../../../../_common/avatar/frame.model';
import { defineFormProps } from '../../../../../../_common/form-vue/AppForm.vue';
import FormShopProductBase, { createShopProductBaseForm } from './FormShopProductBase.vue';

const props = defineProps({
	...defineFormProps<AvatarFrameModel>(),
});

const { model } = toRefs(props);

const data = createShopProductBaseForm({
	typename: 'Avatar_Frame',
	baseModel: model?.value,
	fields: {},
});
</script>

<template>
	<FormShopProductBase :data="data" />
</template>
