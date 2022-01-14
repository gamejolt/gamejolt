<script lang="ts">
import { Emit, Options, Prop, Vue, Watch } from 'vue-property-decorator';
import AppDatepicker from '../datepicker/datepicker.vue';
import AppTimepicker from '../timepicker/timepicker.vue';

@Options({
	components: {
		AppDatepicker,
		AppTimepicker,
	},
})
export default class AppDatetimePicker extends Vue {
	@Prop(Number) value!: number;
	@Prop(Number) timezoneOffset!: number;
	@Prop(Number) minDate?: number;
	@Prop(Number) maxDate?: number;

	private myTimezoneOffset = new Date().getTimezoneOffset() * 60000;

	@Emit('change')
	emitChange(_date: number) {}

	get tzOffset() {
		return this.timezoneOffset + this.myTimezoneOffset;
	}

	get datetime() {
		return new Date(this.value + this.tzOffset);
	}

	get minDateBounds() {
		return this.minDate ? new Date(this.minDate + this.tzOffset) : null;
	}

	get maxDateBounds() {
		return this.maxDate ? new Date(this.maxDate + this.tzOffset) : null;
	}

	created() {
		if (!this.value) {
			throw new Error('Value must be initialized');
		}
	}

	@Watch('timezoneOffset')
	onTimezoneChanged(oldOffset: number, newOffset: number) {
		this.emitChange(this.value - oldOffset + newOffset);
	}

	select(date: Date) {
		// Get the selected date from the date/time pickers.
		// This date would be local to the timezone that was selected,
		// so it must first be offsetted back to UTC.
		this.emitChange(date.getTime() - this.tzOffset);
	}
}
</script>

<template>
	<div class="datetime-picker">
		<app-datepicker
			required
			:value="datetime"
			:min-date="minDateBounds"
			:max-date="maxDateBounds"
			@change="select($event)"
		/>

		<app-timepicker :value="datetime" :show-meridian="true" @change="select($event)" />
	</div>
</template>

<style lang="stylus" scoped>
.datetime-picker
	clearfix()

	::v-deep(.datepicker-table)
		float: left
		margin-right: ($grid-gutter-width / 2)

		@media $media-xs
			float: none
			margin-right: 0

	::v-deep(.timepicker)
		float: left

		@media $media-xs
			float: none
			margin-top: $line-height-computed
</style>
