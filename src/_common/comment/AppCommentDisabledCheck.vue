<script lang="ts" setup>
import { PropType, toRefs } from 'vue';
import AppAlertBox from '../alert/AppAlertBox.vue';
import AppTranslate from '../translate/AppTranslate.vue';
import { CommentableModel } from './comment-model';

const props = defineProps({
	model: {
		type: Object as PropType<CommentableModel>,
		required: true,
	},
});

const { model } = toRefs(props);
</script>

<template>
	<template v-if="!model.canViewComments">
		<AppAlertBox icon="notice">
			<AppTranslate>Comments are disabled.</AppTranslate>
		</AppAlertBox>
	</template>
	<template v-else>
		<slot />
	</template>
</template>
