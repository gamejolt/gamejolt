<script lang="ts" setup>
import AppAlertBox from '../alert/AppAlertBox.vue';
import AppTranslate from '../translate/AppTranslate.vue';
import { CommentableModel } from './comment-model';

type Props = {
	model: CommentableModel;
};
const { model } = defineProps<Props>();
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
