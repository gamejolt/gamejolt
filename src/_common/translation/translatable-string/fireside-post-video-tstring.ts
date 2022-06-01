import { $gettext } from '../../translate/translate.service';
import type { TranslatableString } from '../translatable-string';
import { TranslatableStringSubtype1, TranslatableStringType } from './enums';

export default function (tstring: TranslatableString): void {
	if (tstring.type != TranslatableStringType.FIRESIDE_POST_VIDEO) {
		return;
	}

	switch (tstring.subtype1) {
		case TranslatableStringSubtype1.FIRESIDE_POST_VIDEO_PROCESSING_EXCEPTION:
			return resolveVideoProcessingException(tstring);
	}
}

type VideoProcessingExceptionContext = {
	code: VideoProcessingExceptionCode;
};

enum VideoProcessingExceptionCode {
	// Some generic failure.
	REASON_GENERIC = 0,
	// Detecting file properties failed.
	REASON_DETECT = 1,
	// Transcode to mp4 failed because the video track had too big of a
	// hole in it (dropped video frames)
	REASON_TRANSCODE_MP4_SPARSE_VIDEO = 2,
	// Same as above only for sparse audio frames.
	REASON_TRANSCODE_MP4_SPARSE_AUDIO = 3,
	// Same as above but not for the main video/audio streams.
	REASON_TRANSCODE_MP4_SPARSE_UNKNOWN = 4,
	// Dimensions are invalid. usually means not divisible by 2 either after
	// rescaling or rescaling is impossible.
	REASON_TRANSCODE_MP4_INVALID_DIMENSIONS = 5,
	// Some unknown error happened during mp4 transcoding.
	REASON_TRANSCODE_MP4_GENERIC = 6,
}

function resolveVideoProcessingException(tstring: TranslatableString): void {
	const ctx = tstring.context as VideoProcessingExceptionContext;

	tstring._resolved = ((): string => {
		switch (ctx.code) {
			case VideoProcessingExceptionCode.REASON_DETECT:
				return $gettext(
					'Video format is unsupported or is corrupt. Try saving it as a different format.'
				);

			case VideoProcessingExceptionCode.REASON_TRANSCODE_MP4_SPARSE_VIDEO:
				return $gettext(
					'Video is dropping way too many video frames. ' +
						'This usually happens when the computer was too stressed while capturing the video. ' +
						'Try reencoding the video or saving it as a different format.'
				);

			case VideoProcessingExceptionCode.REASON_TRANSCODE_MP4_SPARSE_AUDIO:
				return $gettext(
					'Video is dropping way too many audio frames. ' +
						'Try reencoding the video or saving it as a different format.'
				);

			case VideoProcessingExceptionCode.REASON_TRANSCODE_MP4_INVALID_DIMENSIONS:
				return $gettext(
					'Video failed to crop/resize on our end. Try cropping the video yourself to a reasonable aspect ratio. 16:9 is recommended.'
				);

			case VideoProcessingExceptionCode.REASON_TRANSCODE_MP4_SPARSE_UNKNOWN:
			case VideoProcessingExceptionCode.REASON_TRANSCODE_MP4_GENERIC:
				return $gettext(
					'Video encoding failed on our end for some reason. Try saving it as a different format.'
				);

			case VideoProcessingExceptionCode.REASON_GENERIC:
			default:
				return $gettext('Temporary server issues, try uploading the video later.');
		}
	})();
}
