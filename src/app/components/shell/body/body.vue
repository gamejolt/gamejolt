<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Vue } from 'vue-property-decorator';
import { useAppStore } from '../../../store';
import AppShellFooter from '../footer/footer.vue';

@Options({
	components: {
		AppShellFooter,
	},
})
export default class AppShellBody extends Vue {
	store = setup(() => useAppStore());

	get hasContentSidebar() {
		return this.store.hasContentSidebar;
	}
	get hasFooter() {
		return this.store.hasFooter;
	}
}
</script>

<template>
	<div id="shell-body" :class="{ 'has-content-sidebar': hasContentSidebar }">
		<div class="shell-body-main">
			<slot />
		</div>
		<AppShellFooter v-if="hasFooter" />
	</div>
</template>

<style lang="stylus" src="./body.styl"></style>
