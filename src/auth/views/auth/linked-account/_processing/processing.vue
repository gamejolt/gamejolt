<script lang="ts">
import { Options, Vue } from 'vue-property-decorator';
import AppLoading from '../../../../../_common/loading/loading.vue';

@Options({
	components: {
		AppLoading,
	},
})
export default class AuthLinkedAccountProcessing extends Vue {}
</script>

<template>
	<app-loading :label="$gettext('auth.linked_account.loading_message')" centered big />
</template>
