import { determine } from 'jstimezonedetect';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../../utils/vue';
import { date } from '../../../../../_common/filters/date';
import { Timezone, TimezoneData } from '../../../../../_common/timezone/timezone.service';

@Component({
	filters: {
		date,
	},
})
export default class AppCommunityCompetitionDate extends Vue {
	@Prop(propRequired(Number)) date!: number;
	@Prop(propOptional(String)) timezone?: string;

	timezones: { [region: string]: (TimezoneData & { label?: string })[] } = null as any;

	get offsetDate() {
		// date is UTC, add the set offset, and remove the local timezone offset.
		// This displays the time with the passed in timezone.
		return this.date + this.offset - this.localOffset;
	}

	get localOffset() {
		if (!this.timezone || !this.timezones) {
			return 0;
		}

		return this._getOffset(determine().name());
	}

	get offset() {
		if (!this.timezone || !this.timezones) {
			return 0;
		}

		return this._getOffset(this.timezone);
	}

	private _getOffset(timezone: string) {
		const tz = this._timezoneByName(timezone);
		if (!tz) {
			console.warn('Could not find timezone offset for: ' + tz);
			return 0;
		} else {
			return tz.o * 1000;
		}
	}

	private _timezoneByName(timezone: string) {
		for (const region in this.timezones) {
			const tz = this.timezones[region].find(_tz => _tz.i === timezone);
			if (tz) {
				return tz;
			}
		}
		return null;
	}

	async mounted() {
		this.timezones = await Timezone.getGroupedTimezones();
	}
}
