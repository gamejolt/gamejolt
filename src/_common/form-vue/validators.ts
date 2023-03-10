// // Since they get set as ng-pattern attributes, we have to double backslash.
// const Patterns: { [k: string]: RegExp } = {
// 	// Alphanumeric, hyphens.
// 	urlPath: /^[\w\-]+$/,

import { getImgDimensions } from '../../utils/image';
import { MaybePromise } from '../../utils/utils';
import { Api } from '../api/api.service';
import { ContentDocument } from '../content/content-document';
import { formatNumber } from '../filters/number';

export interface FormValidatorError {
	type: string;
	message: string;
}

export type FormValidator<T = any> = (
	value: T | undefined | null
) => Promise<FormValidatorError | null>;

/**
 * Processes a form validator's message for display. Basically replaces
 * instances of {} with the proper label.
 */
export function processFormValidatorErrorMessage(error: string, label: string) {
	return error.replace(/\{\}/g, label);
}

/** Alphanumeric, underscores, hyphens */
const _usernameRegex = /^[\w-]+$/;

/** Alphanumeric, hyphens. */
const _urlPathRegex = /^[\w-]+$/;

/** Alphanumeric, underscores. */
const _hashtagRegex = /^[\w_]+$/;

/**
 * Semver version strings
 * https://github.com/sindresorhus/semver-regex/blob/master/index.js
 */
const _semverRegex =
	/^v?(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)(?:-[\da-z-]+(?:\.[\da-z-]+)*)?(?:\+[\da-z-]+(?:\.[\da-z-]+)*)?$/i;
const _domainRegex = /^((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}$/;
const _gaTrackingIdRegex = /^UA-[0-9]+-[0-9]+$/;
const _emailRegex =
	/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const _ccRegex =
	/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|(222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11}|62[0-9]{14})$/;

///////////////
// Note: All validator functions should be builder functions that return a
// validator function that will be called. This allows you to curry parameters
// into the validator function.
//////////////

/**
 * Essentially enforces it to have a truthy value.
 */
export const validateRequired = (): FormValidator => async value => {
	if (!value) {
		return {
			type: 'required',
			message: `You must enter a {}.`,
		};
	}
	return null;
};

/**
 * Validates that the given string is in a valid decimal format.
 */
export const validateDecimal =
	(decimals: number): FormValidator<string> =>
	async value => {
		if (!value) {
			return null;
		}

		let regex: RegExp;
		if (Number(decimals) === 0) {
			regex = /^[0-9]*$/;
		} else {
			const regexPart = '{1,' + decimals + '}';
			regex = new RegExp('^[0-9]*(?:\\.[0-9]' + regexPart + ')?$');
		}

		if (!regex.test(value)) {
			return {
				type: 'decimal',
				message: `Please enter a valid amount.`,
			};
		}

		return null;
	};

/**
 * Generic regex pattern validation.
 */
export const validatePattern =
	(regex: RegExp): FormValidator<string> =>
	async value => {
		if (value && !regex.test(value)) {
			return {
				type: 'pattern',
				message: `Please enter a valid {}.`,
			};
		}

		return null;
	};

/**
 * Validates that the string matches our username format (alphanumeric,
 * underscores, hyphens).
 */
export const validateUsername = (): FormValidator<string> => async value => {
	if (value && !_usernameRegex.test(value)) {
		return {
			type: 'username',
			message: `Please use only letters, numbers, hyphens (-), and underscores (_).`,
		};
	}

	return null;
};

/**
 * Validates that the string matches our url path format (alphanumeric,
 * hyphens).
 */
export const validateUrlPath = (): FormValidator<string> => async value => {
	if (value && !_urlPathRegex.test(value)) {
		return {
			type: 'url_path',
			message: `Please use only letters, numbers, and hyphens (-).`,
		};
	}

	return null;
};

/**
 * Validates that the string matches a domain format.
 */
export const validateDomain = (): FormValidator<string> => async value => {
	if (value && !_domainRegex.test(value)) {
		return {
			type: 'domain',
			message: `Please enter a valid {}.`,
		};
	}

	return null;
};

/**
 * Validates that the string matches our hashtag format (alphanumeric,
 * underscores).
 */
export const validateHashtag = (): FormValidator<string> => async value => {
	if (value && !_hashtagRegex.test(value)) {
		return {
			type: 'hashtag',
			message: `Please use only letters, numbers, and underscores (_).`,
		};
	}

	return null;
};

/**
 * Validates that the string matches a Google Analytics tracking ID format.
 */
export const validateGaTrackingId = (): FormValidator<string> => async value => {
	if (value && !_gaTrackingIdRegex.test(value)) {
		return {
			type: 'ga_tracking_id',
			message: `Please enter a valid {}.`,
		};
	}

	return null;
};

/**
 * Validates that the string matches a semver format.
 */
export const validateSemver = (): FormValidator<string> => async value => {
	if (value && !_semverRegex.test(value)) {
		return {
			type: 'semver',
			message: `Please enter a valid {}.`,
		};
	}

	return null;
};

function _stringToNumber(value: string | number | null | undefined) {
	if (!value) {
		return null;
	}

	const number = Number(value);
	if (isNaN(number)) {
		return null;
	}

	return number;
}

/**
 * Validates that the number is greater than or equal to a given min value.
 */
export const validateMinValue =
	(min: number): FormValidator<string> =>
	async value => {
		const number = _stringToNumber(value);
		if (number === null) {
			return null;
		}

		if (number < min) {
			return {
				type: 'min_value',
				message: `The {} entered is too low.`,
			};
		}

		return null;
	};

/**
 * Validates that the number is less than or equal to a given max value.
 */
export const validateMaxValue =
	(max: number): FormValidator<number> =>
	async value => {
		const number = _stringToNumber(value);
		if (number === null) {
			return null;
		}

		if (number > max) {
			return {
				type: 'max_value',
				message: `The {} entered is too high.`,
			};
		}

		return null;
	};

/**
 * Validates that the string is longer or equal to the given min length.
 */
export const validateMinLength =
	(length: number): FormValidator<string> =>
	async value => {
		if (value && value.length < length) {
			return {
				type: 'min_length',
				message: `Please enter a {} longer than or equal to ${formatNumber(
					length
				)} characters.`,
			};
		}

		return null;
	};

/**
 * Validates that the string is shorter or equal to the given max length.
 */
export const validateMaxLength =
	(length: number): FormValidator<string> =>
	async value => {
		if (value && value.length > length) {
			return {
				type: 'max_length',
				message: `Please enter a {} shorter than or equal to ${formatNumber(
					length
				)} characters.`,
			};
		}

		return null;
	};

async function _validateFiles(
	files: File | File[] | null | undefined,
	cb: (file: File) => MaybePromise<boolean>
) {
	if (!files) {
		return true;
	}

	files = Array.isArray(files) ? files : [files];

	for (const file of files) {
		if (!(await cb(file))) {
			return false;
		}
	}

	return true;
}

/**
 * Validates that each file's type matches the given accept string.
 *
 * Example accept string: '.jpg,.png'
 */
export const validateFileAccept =
	(acceptString: string): FormValidator<File | File[]> =>
	async files => {
		const acceptTypes = acceptString.split(',');
		const result = await _validateFiles(files, file => {
			const pieces = file.name.toLowerCase().split('.');

			if (pieces.length < 2) {
				return false;
			}

			const ext = '.' + pieces.pop();
			if (ext && acceptTypes.indexOf(ext) === -1) {
				return false;
			}

			return true;
		});

		if (!result) {
			return {
				type: 'accept',
				message: `The chosen {} is the wrong type of file.`,
			};
		}

		return null;
	};

/**
 * Validates that each file has a filesize less than or equal to the given
 * filesize in bytes.
 */
export const validateFilesize =
	(maxFilesize: number): FormValidator<File | File[]> =>
	async files => {
		const result = await _validateFiles(files, i => i.size > 0 && i.size <= maxFilesize);
		if (!result) {
			return {
				type: 'filesize',
				message: `The chosen {} exceeds the maximum file size of ${formatNumber(
					maxFilesize / 1024 / 1024
				)}MB.`,
			};
		}

		return null;
	};

/**
 * Validates that each file has dimensions that fit within a given min
 * width/height.
 */
export const validateImageMinDimensions =
	({ width, height }: { width?: number; height?: number }): FormValidator<File | File[]> =>
	async files => {
		if (!width && !height) {
			throw new Error(`Must have either a width or a height passed in to validate.`);
		}

		const result = await _validateFiles(files, async file => {
			const dimensions = await getImgDimensions(file);
			return (!width || dimensions[0] >= width) && (!height || dimensions[1] >= height);
		});

		if (!result) {
			let message = '';
			if (width && height) {
				message = `BIG OOF! The dimensions of your {} must be at least ${formatNumber(
					width
				)}x${formatNumber(height)}px.`;
			} else if (width) {
				message = `BIG OOF! The width of your {} must be at least ${formatNumber(
					width
				)}px.`;
			} else if (height) {
				message = `BIG OOF! The height of your {} must be at least ${formatNumber(
					height
				)}px.`;
			}

			return {
				type: 'min_img_dimensions',
				message,
			};
		}

		return null;
	};

/**
 * Validates that each file has dimensions that fit within a given max
 * width/height.
 */
export const validateImageMaxDimensions =
	({ width, height }: { width?: number; height?: number }): FormValidator<File | File[]> =>
	async files => {
		if (!width && !height) {
			throw new Error(`Must have either a width or a height passed in to validate.`);
		}

		const result = await _validateFiles(files, async file => {
			const dimensions = await getImgDimensions(file);
			return (!width || dimensions[0] <= width) && (!height || dimensions[1] <= height);
		});

		if (!result) {
			let message = '';
			if (width && height) {
				message = `BIG OOF! The dimensions of your {} must be no greater than ${formatNumber(
					width
				)}x${formatNumber(height)}px.`;
			} else if (width) {
				message = `BIG OOF! The width of your {} must be no greater than ${formatNumber(
					width
				)}px.`;
			} else if (height) {
				message = `BIG OOF! The height of your {} must be no greater than ${formatNumber(
					height
				)}px.`;
			}

			return {
				type: 'max_img_dimensions',
				message,
			};
		}

		return null;
	};

export const validateImageAspectRatio =
	({ ratio }: { ratio: number }): FormValidator<File | File[]> =>
	async files => {
		if (!ratio) {
			throw new Error(`Aspect ratio must be greater than 0.`);
		}

		const result = await _validateFiles(files, async file => {
			const dimensions = await getImgDimensions(file);
			const [width, height] = dimensions;
			return width / height === ratio;
		});

		if (!result) {
			return {
				type: 'img_ratio',
				message: `Uh oh, L + Ratio! The aspect ratio of your {} must be ${ratio}.`,
			};
		}

		return null;
	};

/**
 * Validates that a timestamp is later than or equal to the given min timestamp.
 */
export const validateMinDate =
	(min: number): FormValidator<number> =>
	async value => {
		if (value && value < min) {
			return {
				type: 'min_date',
				message: `The time you selected is too early.`,
			};
		}

		return null;
	};

/**
 * Validates that a timestamp is ealier or equal to the given timestamp.
 */
export const validateMaxDate =
	(max: number): FormValidator<number> =>
	async value => {
		if (value && value > max) {
			return {
				type: 'max_date',
				message: `The time you selected is too late.`,
			};
		}

		return null;
	};

function _parseCreditCardExp(val: string) {
	const sanitized = val.replace(/[^\d]+/, '');
	const m = parseInt(sanitized.substring(0, 2), 10);

	const ySub = sanitized.substring(2, 4);
	const y = ySub && ySub.length === 2 ? parseInt('20' + sanitized.substring(2, 4), 10) : 0;

	return { m: m, y: y };
}

function _isValidCreditCardExp(val: string) {
	const parsed = _parseCreditCardExp(val);
	return !!parsed.y && parsed.m < 13 && parsed.m > 0;
}

function _checkLuhn(val: string) {
	let s = 0;
	let doubleDigit = false;
	for (let i = val.length - 1; i >= 0; i--) {
		let digit = +val[i];
		if (doubleDigit) {
			digit *= 2;
			if (digit > 9) digit -= 9;
		}
		s += digit;
		doubleDigit = !doubleDigit;
	}
	return s % 10 == 0;
}

/**
 * Validates that the expiration date is a valid date and not expired.
 */
export const validateCreditCardExpiration = (): FormValidator<string> => async value => {
	if (value) {
		if (!_isValidCreditCardExp(value)) {
			return {
				type: 'cc_exp_date',
				message: `Please enter a valid expiration date.`,
			};
		}

		const parsed = _parseCreditCardExp(value);

		// Months are 0-based. This means it will correctly push into the next
		// month with their input so that it invalidates at the beginning of the
		// next month.
		if (Date.now() >= new Date(parsed.y, parsed.m).getTime()) {
			return {
				type: 'cc_expired',
				message: `This card has expired.`,
			};
		}
	}

	return null;
};

/**
 * Validates the credit cards passed in. Basically just checks that the format
 * matches common CC formats, doesn't go too crazy and will probably not match
 * all CCs.
 */
export const validateCreditCard = (): FormValidator<string> => async value => {
	if (value) {
		const sanitized = value.replace(/[- ]+/g, '');
		if (!_ccRegex.test(sanitized) || !_checkLuhn(sanitized)) {
			return {
				type: 'credit_card',
				message: `Please enter a valid credit card.`,
			};
		}
	}

	return null;
};

/**
 * Enforces that the serialized content document has actual content in it.
 */
export const validateContentRequired = (): FormValidator<string> => async value => {
	let hasContent = true;
	if (!value) {
		hasContent = false;
	} else {
		const doc = ContentDocument.fromJson(value);
		hasContent = doc.hasContent;
	}

	if (!hasContent) {
		return {
			type: 'required',
			message: `You must enter a {}.`,
		};
	}

	return null;
};

/**
 * Validates that the serialized content document is no longer than the given
 * content length.
 */
export const validateContentMaxLength =
	(length: number): FormValidator<string> =>
	async value => {
		if (value) {
			const doc = ContentDocument.fromJson(value);
			if (doc.getLength() > length) {
				return {
					type: 'required',
					message: `The {} is too long.`,
				};
			}
		}

		return null;
	};

/**
 * Validates that the serialized content has no active media uploads in
 * progress.
 */
export const validateContentNoActiveUploads = (): FormValidator<string> => async value => {
	if (value) {
		// This works because json always escapes the " character. If a user
		// were to put `"type":"mediaUpload"` in their content, it would come
		// out as `\"type\":\"mediaUpload\"`.
		if (value.includes('"type":"mediaUpload"')) {
			return {
				type: 'content_no_active_uploads',
				message: `We are uploading your images...`,
			};
		}
	}

	return null;
};

interface _AvailabilityOptions {
	/**
	 * We will call this URL with the current value as a POST request. If it
	 * returns a failure response, we fail the validation.
	 */
	url: string;

	/**
	 * If passed, this should be equal to the value that this field was when it
	 * was first initialized. We always allow this value through.
	 */
	initVal?: string;
}

/**
 * Validates with the server that this value is not taken yet.
 */
export const validateAvailability =
	({ url, initVal }: _AvailabilityOptions): FormValidator<string> =>
	async value => {
		if (value) {
			// Skip if the initial value is the same as the current value right
			// now.
			if (initVal === value) {
				return null;
			}

			try {
				await Api.sendRequest(url, { value }, { detach: true, processPayload: false });
			} catch (_e) {
				return {
					type: 'availability',
					message: `This {} is already in use.`,
				};
			}
		}

		return null;
	};

/**
 * Validates the value is a valid email address (regex based).
 */
export const validateEmail = (): FormValidator<string> => async value => {
	if (value && !_emailRegex.test(value)) {
		return {
			type: 'email',
			message: `Please enter a valid email address.`,
		};
	}

	return null;
};

export const validateMatch =
	(toMatch: unknown): FormValidator<string> =>
	async value => {
		if (value && toMatch !== value) {
			return {
				type: 'match',
				message: `Does not match.`,
			};
		}

		return null;
	};
