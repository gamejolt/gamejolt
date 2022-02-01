<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { getAbsoluteLink } from '../../../../utils/router';
import { shallowSetup } from '../../../../utils/vue';
import AppCard from '../../../../_common/card/AppCard.vue';
import AppShareCard from '../../../../_common/share/card/card.vue';
import { useFiresideController } from '../../../components/fireside/controller/controller';

@Options({
	components: {
		AppShareCard,
		AppCard,
	},
})
export default class AppFiresideShare extends Vue {
	@Prop({ type: Boolean, required: false, default: false })
	hideHeading!: boolean;

	c = shallowSetup(() => useFiresideController()!);

	get fireside() {
		return this.c.fireside;
	}

	get shareUrl() {
		if (!this.fireside) {
			return null;
		}
		return getAbsoluteLink(this.$router, this.fireside.location);
	}
}
</script>

<template>
	<AppShareCard
		class="-share-card"
		resource="fireside"
		:url="shareUrl"
		:hide-heading="hideHeading"
		offset-color
	/>
</template>

<style lang="stylus" scoped>
.-share-card
	margin-bottom: 0px
	margin-top: 20px
</style>
