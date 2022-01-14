<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';

@Options({})
export default class AppActivityFeedPostBlocked extends Vue {
	@Prop({ type: String, required: true })
	username!: string;

	@Emit('show') show() {}
}
</script>

<template>
	<div class="alert">
		<span v-translate="{ username }"> Hidden post by blocked user <b>@%{ username }</b>. </span>
		<app-button trans @click="show">
			<translate>Show</translate>
		</app-button>
	</div>
</template>

<style lang="stylus" scoped>
@import '../../variables'

.alert
	-activity-feed-item()
	display: flex
	justify-content: space-between
	align-items: center
	padding-top: 10px !important
	padding-bottom: 10px !important
	margin: 0

	button
		margin: 0

	&:hover
		cursor: default
</style>
