<script lang="ts" setup>
import { toRefs } from 'vue';
import { BackgroundModel } from '../../../../../../_common/background/background.model';
import { defineFormProps } from '../../../../../../_common/form-vue/AppForm.vue';
import FormShopProductBase, { createShopProductBaseForm } from './FormShopProductBase.vue';

const props = defineProps({
	...defineFormProps<BackgroundModel>(),
});

const { model } = toRefs(props);

const data = createShopProductBaseForm({
	typename: 'Background',
	baseModel: model?.value,
});
</script>

<template>
	<FormShopProductBase :data="data" />
</template>
