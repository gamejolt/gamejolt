import { determine } from 'jstimezonedetect';
import { nextTick } from 'vue';
import { Timezone, TimezoneData } from '../../../timezone/timezone.service';
import { BaseForm } from '../../form.service';

type Model = {
	timezone?: string | null;
};

/**
 * Class that handles timezone management for a form.
 */
export class FormTimezoneService<T extends Model> {
	timezones: { [region: string]: (TimezoneData & { label?: string })[] } = null as any;
	private hasLoadedTimezones = false;
	private form: BaseForm<T>;
	// Stores the "now" when this class gets constructed to be used by Date/Time controls as min value.
	private initNow: number;

	get loaded() {
		return this.hasLoadedTimezones;
	}

	get now() {
		return this.initNow;
	}

	/**
	 * Active timezone offset in ms from UTC.
	 */
	get activeTimezoneOffset() {
		if (!this.activeTimezone) {
			return 0;
		}

		const tz = this._timezoneByName(this.activeTimezone!);
		if (!tz) {
			console.warn('Could not find timezone offset for: ' + tz);
			return 0;
		} else {
			return tz.o * 1000;
		}
	}

	get activeTimezone() {
		return this.form.formModel.timezone;
	}

	set activeTimezone(timezone: string | null | undefined) {
		this.form.setField('timezone', timezone);
	}

	/**
	 * Returns the display name for the active timezone.
	 */
	get activeTimezoneName() {
		if (!this.activeTimezone) {
			return '';
		}
		return this._timezoneByName(this.activeTimezone!)?.label;
	}

	constructor(form: BaseForm<T>) {
		this.form = form;
		this.initNow = Date.now();
	}

	private _determineCurrentTimezone() {
		return determine().name();
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

	/**
	 * Loads timezone information.
	 * @param setToForm When `true`, determines the active timezone for the device and sets it to the form.
	 * 					(Only when the form's timezone is not set already)
	 */
	public async load(setToForm = false) {
		if (this.hasLoadedTimezones) {
			this.hasLoadedTimezones = false;
			// Unload if previously loaded.
			this.timezones = null as any;
		}

		// Get timezones list.
		this.timezones = await Timezone.getGroupedTimezones();
		for (const region in this.timezones) {
			for (const tz of this.timezones[region]) {
				let offset = '';
				if (tz.o > 0) {
					offset = `+${tz.o / 3600}:00`;
				} else if (tz.o < 0) {
					offset = `-${-tz.o / 3600}:00`;
				}
				tz.label = `(UTC${offset}) ${tz.i}`;
			}
		}

		// Determine active timezone and set.
		if (setToForm && !this.activeTimezone) {
			const resetFormChanged = !this.form.changed;

			this.activeTimezone = this._determineCurrentTimezone();

			// Only reset "changed" when it wasn't set before and is now.
			if (resetFormChanged && this.form.changed) {
				// Wait for form to update, then set changed back to initial, to prevent
				// confirm modal from showing up without any changes by the user.
				await nextTick();
				this.form.changed = false;
			}
		}

		this.hasLoadedTimezones = true;
	}
}
