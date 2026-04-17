<script lang="ts" setup>
import AppAlertBox from '~common/alert/AppAlertBox.vue';
import { CommentableModel } from '~common/comment/comment-model';
import AppTranslate from '~common/translate/AppTranslate.vue';

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
