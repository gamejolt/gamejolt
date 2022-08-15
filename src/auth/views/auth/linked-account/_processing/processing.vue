<script lang="ts">
import { Options, Vue } from 'vue-property-decorator';
import AppLoading from '../../../../../_common/loading/AppLoading.vue';

@Options({
	components: {
		AppLoading,
	},
})
export default class AuthLinkedAccountProcessing extends Vue {}
</script>

<template>
	<AppLoading :label="$gettext('Processing. Please wait...')" centered big />
</template>
