// FROM: https://gist.github.com/sco974/9c72ded8fe3e2e32ad2c2e41804ce642

declare namespace shaka {
	namespace media {
		class InitSegmentReference {
			/**
			 * Creates an InitSegmentReference, which provides the location to an initialization segment.
			 * @param uris A function that creates the URIs of the resource containing the segment.
			 * @param startByte The offset from the start of the resource to the start of the segment.
			 * @param endByte The offset from the start of the resource to the end of the segment, inclusive.
			 * null indicates that the segment extends to the end of the resource.
			 */
			constructor(uris: any, startByte: any, endByte: any);
			/**
			 * Creates the URIs of the resource containing the segment.
			 */
			createUris(): any;
			/**
			 * Returns the offset from the start of the resource to the start of the segment.
			 */
			getStartByte(): any;
			/**
			 * Returns the offset from the start of the resource to the end of the segment, inclusive.
			 * null indicates that the segment extends to the end of the resource.
			 */
			getEndByte(): any;
		}
		class SegmentReference {
			/**
		 * Creates a SegmentReference, which provides the start time, end time, and
  location to a media segment.
		 * @param position The segment's position within a particular Period.
	The following should hold true between any two SegmentReferences from the
	same Period, r1 and r2:
	IF r2.position > r1.position THEN
	  [ (r2.startTime > r1.startTime) OR
		(r2.startTime == r1.startTime AND r2.endTime >= r1.endTime) ]
		 * @param startTime The segment's start time in seconds, relative to
	the start of a particular Period.
		 * @param endTime The segment's end time in seconds, relative to
	the start of a particular Period. The segment ends the instant before
	this time, so |endTime| must be strictly greater than |startTime|.
		 * @param uris A function that creates the URIs of the resource containing the segment.
		 * @param startByte The offset from the start of the resource to the
	start of the segment.
		 * @param endByte The offset from the start of the resource to the
	end of the segment, inclusive. null indicates that the segment extends
	to the end of the resource.
		 */
			constructor(
				position: any,
				startTime: any,
				endTime: any,
				uris: any,
				startByte: any,
				endByte: any
			);
			/**
			 * Returns the segment's position within a particular Period.
			 * @returnType The segment's position.
			 */
			getPosition(): any;
			/**
		 * Returns the segment's start time in seconds, relative to
  the start of a particular Period.
		 */
			getStartTime(): any;
			/**
		 * Returns the segment's end time in seconds, relative to
  the start of a particular Period.
		 */
			getEndTime(): any;
			/**
			 * Creates the URIs of the resource containing the segment.
			 */
			createUris(): any;
			/**
		 * Returns the offset from the start of the resource to the
  start of the segment.
		 */
			getStartByte(): any;
			/**
		 * Returns the offset from the start of the resource to the
  end of the segment, inclusive. null indicates that the segment extends
  to the end of the resource.
		 */
			getEndByte(): any;
		}
		namespace ManifestParser {
			/**
		 * Registers a manifest parser by file extension.
		 * @param extension The file extension of the manifest.
		 * @param parserFactory The factory
	used to create parser instances.
		 */
			function registerParserByExtension(extension: any, parserFactory: any): void;
			/**
		 * Registers a manifest parser by MIME type.
		 * @param mimeType The MIME type of the manifest.
		 * @param parserFactory The factory
	used to create parser instances.
		 */
			function registerParserByMime(mimeType: any, parserFactory: any): void;
		}
		class SegmentIndex {
			/**
		 * Creates a SegmentIndex.
		 * @param references The list of
	SegmentReferences, which must be sorted first by their start times
	(ascending) and second by their end times (ascending), and have
	continuous, increasing positions.
		 */
			constructor(references: any);
			destroy(): void;
			/**
		 * Finds the position of the segment for the given time, in seconds, relative
  to the start of a particular Period. Returns the position of the segment
  with the largest end time if more than one segment is known for the given
  time.
		 * @returnType The position of the segment, or null
	if the position of the segment could not be determined.
		 */
			find(time: any): any;
			/**
		 * Gets the SegmentReference for the segment at the given position.
		 * @param position The position of the segment.
		 * @returnType The SegmentReference, or null if
	no such SegmentReference exists.
		 */
			get(position: any): any;
			/**
		 * Offset all segment references by a fixed amount.
		 * @param offset The amount to add to each segment's start and end
	times.
		 */
			offset(offset: any): void;
			/**
		 * Merges the given SegmentReferences.  Supports extending the original
  references only.  Will not replace old references or interleave new ones.
		 * @param references The list of
	SegmentReferences, which must be sorted first by their start times
	(ascending) and second by their end times (ascending), and have
	continuous, increasing positions.
		 */
			merge(references: any): void;
			/**
			 * Removes all SegmentReferences that end before the given time.
			 * @param time The time in seconds.
			 */
			evict(time: any): void;
		}
		class PresentationTimeline {
			/**
		 * Creates a PresentationTimeline.
		 * @param presentationStartTime The wall-clock time, in seconds,
	when the presentation started or will start. Only required for live.
		 * @param presentationDelay The delay to give the presentation, in
	seconds.  Only required for live.
		 */
			constructor(presentationStartTime: any, presentationDelay: any);
			/**
		 * @returnType The presentation's duration in seconds.
	Infinity indicates that the presentation continues indefinitely.
		 */
			getDuration(): any;
			/**
		 * Sets the presentation's duration.
		 * @param duration The presentation's duration in seconds.
	Infinity indicates that the presentation continues indefinitely.
		 */
			setDuration(duration: any): void;
			/**
			 * @returnType The presentation's start time in seconds.
			 */
			getPresentationStartTime(): any;
			/**
		 * Sets the clock offset, which is the the difference between the client's clock
  and the server's clock, in milliseconds (i.e., serverTime = Date.now() +
  clockOffset).
		 * @param offset The clock offset, in ms.
		 */
			setClockOffset(offset: any): void;
			/**
		 * Sets the presentation's static flag.
		 * @param isStatic If true, the presentation is static, meaning all
	segments are available at once.
		 */
			setStatic(isStatic: any): void;
			/**
		 * Gets the presentation's segment availability duration, which is the amount
  of time, in seconds, that the start of a segment remains available after the
  live-edge moves past the end of that segment. Infinity indicates that
  segments remain available indefinitely. For example, if your live
  presentation has a 5 minute DVR window and your segments are 10 seconds long
  then the segment availability duration should be 4 minutes and 50 seconds.
		 * @returnType The presentation's segment availability duration.
		 */
			getSegmentAvailabilityDuration(): any;
			/**
		 * Sets the presentation's segment availability duration. The segment
  availability duration should only be set for live.
		 * @param segmentAvailabilityDuration The presentation's new segment
	availability duration in seconds.
		 */
			setSegmentAvailabilityDuration(segmentAvailabilityDuration: any): void;
			/**
			 * Sets the presentation delay.
			 */
			setDelay(delay: any): void;
			/**
		 * Gives PresentationTimeline a Stream's segments so it can size and position
  the segment availability window, and account for missing segment
  information. This function should be called once for each Stream (no more,
  no less).
		 */
			notifySegments(periodStartTime: any, references: any): void;
			/**
		 * Gives PresentationTimeline a Stream's maximum segment duration so it can
  size and position the segment availability window. This function should be
  called once for each Stream (no more, no less), but does not have to be
  called if notifySegments() is called instead for a particular stream.
		 * @param maxSegmentDuration The maximum segment duration for a
	particular stream.
		 */
			notifyMaxSegmentDuration(maxSegmentDuration: any): void;
			/**
		 * @returnType True if the presentation is live; otherwise, return
	false.
		 */
			isLive(): any;
			/**
		 * @returnType True if the presentation is in progress (meaning not live,
	but also not completely available); otherwise, return false.
		 */
			isInProgress(): any;
			/**
		 * Gets the presentation's current segment availability start time. Segments
  ending at or before this time should be assumed to be unavailable.
		 * @returnType The current segment availability start time, in seconds,
	relative to the start of the presentation.
		 */
			getSegmentAvailabilityStart(): any;
			/**
		 * Gets the presentation's current segment availability start time, offset by
  the given amount.  This is used to ensure that we don't "fall" back out of
  the availability window while we are buffering.
		 * @param offset The offset to add to the start time.
		 * @returnType The current segment availability start time, in seconds,
	relative to the start of the presentation.
		 */
			getSafeAvailabilityStart(offset: any): any;
			/**
			 * Sets the presentation's current segment availability start time.
			 */
			setAvailabilityStart(time: any): void;
			/**
		 * Gets the presentation's current segment availability end time. Segments
  starting after this time should be assumed to be unavailable.
		 * @returnType The current segment availability end time, in seconds,
	relative to the start of the presentation. Always returns the
	presentation's duration for video-on-demand.
		 */
			getSegmentAvailabilityEnd(): any;
			/**
			 * Gets the seek range end.
			 */
			getSeekRangeEnd(): any;
		}
	}
	namespace util {
		class Error {
			severity: any;
			category: any;
			code: any;
			data: any;
			handled: any;
			/**
			 * Creates a new Error.
			 */
			constructor(severity: any, category: any, code: any, var_args: any);
		}
		namespace Error {
			enum Severity {
				RECOVERABLE,
				CRITICAL,
			}
			enum Category {
				NETWORK,
				TEXT,
				MEDIA,
				MANIFEST,
				STREAMING,
				DRM,
				PLAYER,
				CAST,
				STORAGE,
			}
			enum Code {
				UNSUPPORTED_SCHEME,
				BAD_HTTP_STATUS,
				HTTP_ERROR,
				TIMEOUT,
				MALFORMED_DATA_URI,
				UNKNOWN_DATA_URI_ENCODING,
				REQUEST_FILTER_ERROR,
				RESPONSE_FILTER_ERROR,
				MALFORMED_TEST_URI,
				UNEXPECTED_TEST_REQUEST,
				INVALID_TEXT_HEADER,
				INVALID_TEXT_CUE,
				UNABLE_TO_DETECT_ENCODING,
				BAD_ENCODING,
				INVALID_XML,
				INVALID_MP4_TTML,
				INVALID_MP4_VTT,
				UNABLE_TO_EXTRACT_CUE_START_TIME,
				BUFFER_READ_OUT_OF_BOUNDS,
				JS_INTEGER_OVERFLOW,
				EBML_OVERFLOW,
				EBML_BAD_FLOATING_POINT_SIZE,
				MP4_SIDX_WRONG_BOX_TYPE,
				MP4_SIDX_INVALID_TIMESCALE,
				MP4_SIDX_TYPE_NOT_SUPPORTED,
				WEBM_CUES_ELEMENT_MISSING,
				WEBM_EBML_HEADER_ELEMENT_MISSING,
				WEBM_SEGMENT_ELEMENT_MISSING,
				WEBM_INFO_ELEMENT_MISSING,
				WEBM_DURATION_ELEMENT_MISSING,
				WEBM_CUE_TRACK_POSITIONS_ELEMENT_MISSING,
				WEBM_CUE_TIME_ELEMENT_MISSING,
				MEDIA_SOURCE_OPERATION_FAILED,
				MEDIA_SOURCE_OPERATION_THREW,
				VIDEO_ERROR,
				QUOTA_EXCEEDED_ERROR,
				UNABLE_TO_GUESS_MANIFEST_TYPE,
				DASH_INVALID_XML,
				DASH_NO_SEGMENT_INFO,
				DASH_EMPTY_ADAPTATION_SET,
				DASH_EMPTY_PERIOD,
				DASH_WEBM_MISSING_INIT,
				DASH_UNSUPPORTED_CONTAINER,
				DASH_PSSH_BAD_ENCODING,
				DASH_NO_COMMON_KEY_SYSTEM,
				DASH_MULTIPLE_KEY_IDS_NOT_SUPPORTED,
				DASH_CONFLICTING_KEY_IDS,
				UNPLAYABLE_PERIOD,
				RESTRICTIONS_CANNOT_BE_MET,
				NO_PERIODS,
				HLS_PLAYLIST_HEADER_MISSING,
				INVALID_HLS_TAG,
				HLS_INVALID_PLAYLIST_HIERARCHY,
				DASH_DUPLICATE_REPRESENTATION_ID,
				HLS_MULTIPLE_MEDIA_INIT_SECTIONS_FOUND,
				HLS_COULD_NOT_GUESS_MIME_TYPE,
				HLS_MASTER_PLAYLIST_NOT_PROVIDED,
				HLS_REQUIRED_ATTRIBUTE_MISSING,
				HLS_REQUIRED_TAG_MISSING,
				HLS_COULD_NOT_GUESS_CODECS,
				HLS_KEYFORMATS_NOT_SUPPORTED,
				DASH_UNSUPPORTED_XLINK_ACTUATE,
				DASH_XLINK_DEPTH_LIMIT,
				HLS_COULD_NOT_PARSE_SEGMENT_START_TIME,
				INVALID_STREAMS_CHOSEN,
				NO_RECOGNIZED_KEY_SYSTEMS,
				REQUESTED_KEY_SYSTEM_CONFIG_UNAVAILABLE,
				FAILED_TO_CREATE_CDM,
				FAILED_TO_ATTACH_TO_VIDEO,
				INVALID_SERVER_CERTIFICATE,
				FAILED_TO_CREATE_SESSION,
				FAILED_TO_GENERATE_LICENSE_REQUEST,
				LICENSE_REQUEST_FAILED,
				LICENSE_RESPONSE_REJECTED,
				ENCRYPTED_CONTENT_WITHOUT_DRM_INFO,
				NO_LICENSE_SERVER_GIVEN,
				OFFLINE_SESSION_REMOVED,
				EXPIRED,
				LOAD_INTERRUPTED,
				OPERATION_ABORTED,
				CAST_API_UNAVAILABLE,
				NO_CAST_RECEIVERS,
				ALREADY_CASTING,
				UNEXPECTED_CAST_ERROR,
				CAST_CANCELED_BY_USER,
				CAST_CONNECTION_TIMED_OUT,
				CAST_RECEIVER_APP_UNAVAILABLE,
				STORAGE_NOT_SUPPORTED,
				INDEXED_DB_ERROR,
				DEPRECATED_OPERATION_ABORTED,
				REQUESTED_ITEM_NOT_FOUND,
				MALFORMED_OFFLINE_URI,
				CANNOT_STORE_LIVE_OFFLINE,
				STORE_ALREADY_IN_PROGRESS,
				NO_INIT_DATA_FOR_OFFLINE,
				LOCAL_PLAYER_INSTANCE_REQUIRED,
				CONTENT_UNSUPPORTED_BY_BROWSER,
				UNSUPPORTED_UPGRADE_REQUEST,
			}
		}
		namespace StringUtils {
			/**
			 * Creates a string from the given buffer as UTF-8 encoding.
			 */
			function fromUTF8(data: any): any;
			/**
		 * Creates a string from the given buffer as UTF-16 encoding.
		 * @param littleEndian true to read little endian, false to read big.
		 * @param opt_noThrow true to avoid throwing in cases where we may
	  expect invalid input.  If noThrow is true and the data has an odd length,
	  it will be truncated.
		 */
			function fromUTF16(data: any, littleEndian: any, opt_noThrow?: any): any;
			/**
		 * Creates a string from the given buffer, auto-detecting the encoding that is
  being used.  If it cannot detect the encoding, it will throw an exception.
		 */
			function fromBytesAutoDetect(data: any): any;
			/**
			 * Creates a ArrayBuffer from the given string, converting to UTF-8 encoding.
			 */
			function toUTF8(str: any): any;
		}
		class DataViewReader {
			/**
			 * Creates a DataViewReader, which abstracts a DataView object.
			 * @param dataView The DataView.
			 * @param endianness The endianness.
			 */
			constructor(dataView: any, endianness: any);
			/**
			 * @returnType True if the reader has more data, false otherwise.
			 */
			hasMoreData(): any;
			/**
			 * Gets the current byte position.
			 */
			getPosition(): any;
			/**
			 * Gets the byte length of the DataView.
			 */
			getLength(): any;
			/**
			 * Reads an unsigned 8 bit integer, and advances the reader.
			 * @returnType The integer.
			 */
			readUint8(): any;
			/**
			 * Reads an unsigned 16 bit integer, and advances the reader.
			 * @returnType The integer.
			 */
			readUint16(): any;
			/**
			 * Reads an unsigned 32 bit integer, and advances the reader.
			 * @returnType The integer.
			 */
			readUint32(): any;
			/**
			 * Reads a signed 32 bit integer, and advances the reader.
			 * @returnType The integer.
			 */
			readInt32(): any;
			/**
			 * Reads an unsigned 64 bit integer, and advances the reader.
			 * @returnType The integer.
			 */
			readUint64(): any;
			/**
			 * Reads the specified number of raw bytes.
			 * @param bytes The number of bytes to read.
			 */
			readBytes(bytes: any): any;
			/**
			 * Skips the specified number of bytes.
			 * @param bytes The number of bytes to skip.
			 */
			skip(bytes: any): void;
			/**
			 * Rewinds the specified number of bytes.
			 * @param bytes The number of bytes to rewind.
			 */
			rewind(bytes: any): void;
			/**
			 * Seeks to a specified position.
			 * @param position The desired byte position within the DataView.
			 */
			seek(position: any): void;
			/**
		 * Keeps reading until it reaches a byte that equals to zero.  The text is
  assumed to be UTF-8.
		 */
			readTerminatedString(): any;
		}
		namespace DataViewReader {
			/**
			 * Endianness.
			 */
			enum Endianness {
				BIG_ENDIAN,
				LITTLE_ENDIAN,
			}
		}
		class Mp4Parser {
			static ParsedBox: any;
			static CallbackType: any;
			/**
		 * A callback that tells the Mp4 parser to treat the body of a box as a series
  of boxes. The number of boxes is limited by the size of the parent box.
		 */
			static children(box: any): void;
			/**
		 * A callback that tells the Mp4 parser to treat the body of a box as a sample
  description. A sample description box has a fixed number of children. The
  number of children is represented by a 4 byte unsigned integer. Each child
  is a box.
		 */
			static sampleDescription(box: any): void;
			/**
		 * Create a callback that tells the Mp4 parser to treat the body of a box as a
  binary blob and how to handle it.
		 */
			static allData(callback: any): any;
			/**
			 * Create a new MP4 Parser
			 */
			constructor();
			/**
			 * Delcare a box type as a Box.
			 */
			box(type: any, definition: any): any;
			/**
			 * Declare a box type as a Full Box.
			 */
			fullBox(type: any, definition: any): any;
			/**
		 * Stop parsing.  Useful for extracting information from partial segments and
  avoiding an out-of-bounds error once you find what you are looking for.
		 */
			stop(): void;
			/**
		 * Parse the given data using the added callbacks.
		 * @param opt_partialOkay If true, allow partial payload for some
	boxes. If the goal is a child box, we can sometimes find it without enough
	data to find all child boxes.
		 */
			parse(data: any, opt_partialOkay?: any): void;
			/**
		 * Parse the next box on the current level.
		 * @param absStart The absolute start position in the original
	byte array.
		 * @param opt_partialOkay If true, allow partial payload for some
	boxes. If the goal is a child box, we can sometimes find it without enough
	data to find all child boxes.
		 */
			parseNext(absStart: any, reader: any, opt_partialOkay?: any): void;
		}
		/**
		 * An interface to standardize how objects are destroyed.
		 */
		interface IDestroyable {}

		/**
		 * @description an interface defining events sent by shaka
		 * @interface ShakaEvent
		 */
		export interface ShakaEvent {
			type: string;
		}

		class FakeEventTarget {
			static ListenerType: any;
			/**
		 * A work-alike for EventTarget.  Only DOM elements may be true EventTargets,
  but this can be used as a base class to provide event dispatch to non-DOM
  classes.  Only FakeEvents should be dispatched.
		 */
			constructor();
			/**
		 * Add an event listener to this object.
		 * @param type The event type to listen for.
		 * @param listener The callback or
	listener object to invoke.
		 * @param opt_options Ignored.
		 */
			addEventListener(type: string, listener: any, opt_options?: any): void;
			/**
		 * Remove an event listener from this object.
		 * @param type The event type for which you wish to remove a listener.
		 * @param listener The callback or
	listener object to remove.
		 * @param opt_options Ignored.
		 */
			removeEventListener(type: string, listener: any, opt_options?: any): void;
			/**
			 * Dispatch an event from this object.
			 * @param event The event to be dispatched from this object.
			 * @returnType True if the default action was prevented.
			 */
			dispatchEvent(event: any): any;
		}
		namespace Uint8ArrayUtils {
			/**
		 * Convert a Uint8Array to a base64 string.  The output will always use the
  alternate encoding/alphabet also known as "base64url".
		 * @param opt_padding If true, pad the output with equals signs.
	Defaults to true.
		 */
			function toBase64(arr: any, opt_padding?: any): any;
			/**
		 * Convert a base64 string to a Uint8Array.  Accepts either the standard
  alphabet or the alternate "base64url" alphabet.
		 */
			function fromBase64(str: any): any;
			/**
			 * Convert a hex string to a Uint8Array.
			 */
			function fromHex(str: any): any;
			/**
			 * Convert a Uint8Array to a hex string.
			 */
			function toHex(arr: any): any;
			/**
			 * Compare two Uint8Arrays for equality.
			 */
			function equal(arr1: any, arr2: any): any;
			/**
			 * Concatenate Uint8Arrays.
			 */
			function concat(var_args: any): any;
		}
	}
	namespace polyfill {
		/**
		 * Install all polyfills.
		 */
		function installAll(): void;
		/**
		 * Registers a new polyfill to be installed.
		 */
		function register(polyfill: any): void;
	}
	namespace cast {
		class CastProxy extends util.FakeEventTarget {
			/**
		 * A proxy to switch between local and remote playback for Chromecast in a way
  that is transparent to the app's controls.
		 * @param video The local video element associated with the
	local Player instance.
		 * @param player A local Player instance.
		 * @param receiverAppId The ID of the cast receiver application.
		 */
			constructor(video: any, player: any, receiverAppId: any);
			/**
		 * Destroys the proxy and the underlying local Player.
		 * @param opt_forceDisconnect If true, force the receiver app to shut
	down by disconnecting.  Does nothing if not connected.
		 */
			destroy(opt_forceDisconnect?: any): void;
			/**
		 * Get a proxy for the video element that delegates to local and remote video
  elements as appropriate.
		 */
			getVideo(): any;
			/**
		 * Get a proxy for the Player that delegates to local and remote Player objects
  as appropriate.
		 */
			getPlayer(): any;
			/**
			 * @returnType True if the cast API is available and there are receivers.
			 */
			canCast(): any;
			/**
			 * @returnType True if we are currently casting.
			 */
			isCasting(): any;
			/**
			 * @returnType The name of the Cast receiver device, if isCasting().
			 */
			receiverName(): any;
			/**
		 * @returnType Resolved when connected to a receiver.  Rejected if the
	connection fails or is canceled by the user.
		 */
			cast(): any;
			/**
			 * Set application-specific data.
			 * @param appData Application-specific data to relay to the receiver.
			 */
			setAppData(appData: any): void;
			/**
			 * Show a dialog where user can choose to disconnect from the cast connection.
			 */
			suggestDisconnect(): void;
			/**
			 * Force the receiver app to shut down by disconnecting.
			 */
			forceDisconnect(): void;
		}
		class CastReceiver {
			/**
		 * A receiver to communicate between the Chromecast-hosted player and the
  sender application.
		 * @param video The local video element associated with the
	local Player instance.
		 * @param player A local Player instance.
		 * @param opt_appDataCallback A callback to handle
	application-specific data passed from the sender.
		 * @param opt_contentIdCallback A callback to
	retrieve manifest URI from the provided content id.
		 */
			constructor(
				video: any,
				player: any,
				opt_appDataCallback?: any,
				opt_contentIdCallback?: any
			);
			/**
			 * @returnType True if the cast API is available and there are receivers.
			 */
			isConnected(): any;
			/**
		 * @returnType True if the receiver is not currently doing loading or
	playing anything.
		 */
			isIdle(): any;
			/**
			 * Destroys the underlying Player, then terminates the cast receiver app.
			 */
			destroy(): void;
		}
	}
	namespace text {
		namespace TextEngine {
			function registerParser(mimeType: any, plugin: any): void;
			function unregisterParser(mimeType: any): void;
			namespace prototype {
				function setDisplayer(displayer: any): void;
			}
		}
		class Cue {
			startTime: any;
			endTime: any;
			payload: any;
			region: any;
			position: any;
			positionAlign: any;
			size: any;
			textAlign: any;
			writingDirection: any;
			lineInterpretation: any;
			line: any;
			lineHeight: any;
			lineAlign: any;
			displayAlign: any;
			color: any;
			backgroundColor: any;
			fontSize: any;
			fontWeight: any;
			fontStyle: any;
			fontFamily: any;
			textDecoration: any;
			wrapLine: any;
			id: any;
			/**
			 * Creates a Cue object.
			 */
			constructor(startTime: any, endTime: any, payload: any);
		}
		namespace Cue {
			enum positionAlign {
				LEFT,
				RIGHT,
				CENTER,
				AUTO,
			}
			enum textAlign {
				LEFT,
				RIGHT,
				CENTER,
				START,
				END,
			}
			enum displayAlign {
				BEFORE,
				CENTER,
				AFTER,
			}
			enum writingDirection {
				HORIZONTAL_LEFT_TO_RIGHT,
				HORIZONTAL_RIGHT_TO_LEFT,
				VERTICAL_LEFT_TO_RIGHT,
				VERTICAL_RIGHT_TO_LEFT,
			}
			enum lineInterpretation {
				LINE_NUMBER,
				PERCENTAGE,
			}
			enum lineAlign {
				CENTER,
				START,
				END,
			}
			/**
		 * In CSS font weight can be a number, where 400 is normal
  and 700 is bold. Use these values for the enum for consistency.
		 */
			enum fontWeight {
				NORMAL,
				BOLD,
			}
			enum fontStyle {
				NORMAL,
				ITALIC,
				OBLIQUE,
			}
			enum textDecoration {
				UNDERLINE,
				LINE_THROUGH,
				OVERLINE,
			}
		}
		class SimpleTextDisplayer {
			/**
		 * <p>
  This defines the default text displayer plugin. An instance of this
  class is used when no custom displayer is given.
  </p>
  <p>
  This class simply converts shaka.text.Cue objects to
  TextTrackCues and feeds them to the browser.
  </p>
		 */
			constructor(video: any);
			remove(start: any, end: any): void;
			append(cues: any): void;
			destroy(): void;
			isTextVisible(): void;
			setTextVisibility(on: any): void;
		}
	}
	namespace net {
		class NetworkingEngine {
			/**
		 * Registers a scheme plugin.  This plugin will handle all requests with the
  given scheme.  If a plugin with the same scheme already exists, it is
  replaced, unless the existing plugin is of higher priority.
  If no priority is provided, this defaults to the highest priority of
  APPLICATION.
		 */
			static registerScheme(scheme: any, plugin: any, opt_priority?: any): void;
			/**
			 * Removes a scheme plugin.
			 */
			static unregisterScheme(scheme: any): void;
			/**
		 * NetworkingEngine wraps all networking operations.  This accepts plugins that
  handle the actual request.  A plugin is registered using registerScheme.
  Each scheme has at most one plugin to handle the request.
		 * @param opt_onSegmentDownloaded Called
	when a segment is downloaded. Passed the duration, in milliseconds, that
	the request took; and the total number of bytes transferred.
		 */
			constructor(opt_onSegmentDownloaded?: any);
			/**
		 * Registers a new request filter.  All filters are applied in the order they
  are registered.
		 */
			registerRequestFilter(filter: any): void;
			/**
			 * Removes a request filter.
			 */
			unregisterRequestFilter(filter: any): void;
			/**
			 * Clear all request filters.
			 */
			clearAllRequestFilters(): void;
			/**
		 * Registers a new response filter.  All filters are applied in the order they
  are registered.
		 */
			registerResponseFilter(filter: any): void;
			/**
			 * Removes a response filter.
			 */
			unregisterResponseFilter(filter: any): void;
			/**
			 * Clear all response filters.
			 */
			clearAllResponseFilters(): void;
			destroy(): void;
			/**
			 * Makes a network request and returns the resulting data.
			 */
			request(type: any, request: any): any;
		}
		namespace NetworkingEngine {
			/**
			 * Request types.  Allows a filter to decide which requests to read/alter.
			 */
			enum RequestType {
				MANIFEST,
				SEGMENT,
				LICENSE,
				APP,
			}
			/**
		 * Priority level for network scheme plugins.
  If multiple plugins are provided for the same scheme, only the
  highest-priority one is used.
		 */
			enum PluginPriority {
				FALLBACK,
				PREFERRED,
				APPLICATION,
			}
		}
		/**
		 * A networking plugin to handle data URIs.
		 */
		function DataUriPlugin(uri: any, request: any): any;
		/**
		 * A networking plugin to handle http and https URIs via XHR.
		 */
		function HttpPlugin(uri: any, request: any): any;
	}
	namespace abr {
		class SimpleAbrManager {
			/**
		 * <p>
  This defines the default ABR manager for the Player.  An instance of this
  class is used when no ABR manager is given.
  </p>
  <p>
  The behavior of this class is to take throughput samples using
  segmentDownloaded to estimate the current network bandwidth.  Then it will
  use that to choose the streams that best fit the current bandwidth.  It will
  always pick the highest bandwidth variant it thinks can be played.
  </p>
  <p>
  After initial choices are made, this class will call switchCallback() when
  there is a better choice.  switchCallback() will not be called more than once
  per ({@link shaka.abr.SimpleAbrManager.SWITCH_INTERVAL_MS}).
  </p>
		 */
			constructor();
			stop(): void;
			init(switchCallback: any): void;
			chooseVariant(): void;
			enable(): void;
			disable(): void;
			segmentDownloaded(deltaTimeMs: any, numBytes: any): void;
			getBandwidthEstimate(): void;
			setVariants(variants: any): void;
			configure(config: any): void;
		}
	}

	namespace extern {
		/** define the  TimelineRegionInfo from both doc and code */
		interface TimelineRegionInfo {
			schemeIdUri: string;
			value: string | number;
			startTime: number;
			endTime: number;
			id: number | string;
			eventElement?: any;
			messageData?: Uint8Array;
		}
	}

	/** Player events and map */
	namespace PlayerEvents {
		interface ErrorEvent extends util.ShakaEvent {
			type: 'error';
			details: util.Error;
		}

		interface DrmSessionUpdateEvent extends util.ShakaEvent {
			type: 'drmsessionupdate';
		}

		interface TimelineRegionAddedEvent extends util.ShakaEvent {
			type: 'timelineregionadded';
			details: extern.TimelineRegionInfo; // {shaka.extern.TimelineRegionInfo}
		}

		interface TimelineRegionEnterEvent extends util.ShakaEvent {
			type: 'timelineregionenter';
			details: extern.TimelineRegionInfo; // {shaka.extern.TimelineRegionInfo}
		}

		interface TimelineRegionExitEvent extends util.ShakaEvent {
			type: 'timelineregionexit';
			details: extern.TimelineRegionInfo; // {shaka.extern.TimelineRegionInfo}
		}

		interface BufferingEvent extends util.ShakaEvent {
			type: 'buffering';
			buffering: boolean;
		}

		interface LoadingEvent extends util.ShakaEvent {
			type: 'loading';
		}

		interface UnloadingEvent extends util.ShakaEvent {
			type: 'unloading';
		}

		interface TextTrackVisibilityEvent extends util.ShakaEvent {
			type: 'texttrackvisibility';
		}

		interface TracksChangedEvent extends util.ShakaEvent {
			type: 'trackschanged';
		}

		interface AdaptationEvent extends util.ShakaEvent {
			type: 'adaptation';
		}

		interface ExpirationUpdatedEvent extends util.ShakaEvent {
			type: 'expirationupdated';
		}

		interface LargeGapEvent extends util.ShakaEvent {
			type: 'largegap';
			currentTime: number;
			gaSize: number;
		}

		interface StreamingEvent extends util.ShakaEvent {
			type: 'streaming';
		}

		interface PlayerEventMap {
			error: ErrorEvent;
			drmsessionupdate: DrmSessionUpdateEvent;
			timelineregionadded: TimelineRegionAddedEvent;
			timelineregionenter: TimelineRegionEnterEvent;
			timelineregionexit: TimelineRegionExitEvent;
			buffering: BufferingEvent;
			loading: LoadingEvent;
			unloading: UnloadingEvent;
			texttrackvisibility: TextTrackVisibilityEvent;
			trackschanged: TracksChangedEvent;
			adaptation: AdaptationEvent;
			expirationupdated: ExpirationUpdatedEvent;
			largegap: LargeGapEvent;
			streaming: StreamingEvent;
		}
	}

	class Player extends util.FakeEventTarget {
		addEventListener<K extends keyof PlayerEvents.PlayerEventMap>(
			type: K,
			listener: (this: Player, ev: PlayerEvents.PlayerEventMap[K]) => any,
			opt_options?: any
		): void;
		removeEventListener<K extends keyof PlayerEvents.PlayerEventMap>(
			type: K,
			listener: (this: Player, ev: PlayerEvents.PlayerEventMap[K]) => any,
			opt_options?: any
		): void;

		static readonly version: any;
		/**
	   * Registers a plugin callback that will be called with support().  The
  callback will return the value that will be stored in the return value from
  support().
	   */
		static registerSupportPlugin(name: any, callback: any): void;
		/**
	   * Return whether the browser provides basic support. If this returns false,
  Shaka Player cannot be used at all. In this case, do not construct a Player
  instance and do not use the library.
	   */
		static isBrowserSupported(): any;
		/**
	   * Probes the browser to determine what features are supported.  This makes a
  number of requests to EME/MSE/etc which may result in user prompts.  This
  should only be used for diagnostics.
  NOTE: This may show a request to the user for permission.
	   */
		static probeSupport(): any;
		/**
	   * Construct a Player.
	   * @param video Any existing TextTracks attached to this
	element that were not created by Shaka will be disabled.  A new TextTrack
	may be created to display captions or subtitles.
	   * @param opt_dependencyInjector Optional callback
	which is called to inject mocks into the Player. Used for testing.
	   */
		constructor(video: any, opt_dependencyInjector?: any);
		/**
		 * After destruction, a Player object cannot be used again.
		 */
		destroy(): void;
		/**
	   * Load a manifest.
	   * @param opt_startTime Optional start time, in seconds, to begin
	playback.  Defaults to 0 for VOD and to the live edge for live.
	   * @param opt_manifestParserFactory Optional manifest parser factory to override auto-detection or use an
	unregistered parser.
	   * @returnType Resolved when the manifest has been loaded and playback
	has begun; rejected when an error occurs or the call was interrupted by
	destroy(), unload() or another call to load().
	   */
		load(manifestUri: any, opt_startTime?: any, opt_manifestParserFactory?: any): any;
		/**
	   * Configure the Player instance.
  The config object passed in need not be complete.  It will be merged with
  the existing Player configuration.
  Config keys and types will be checked.  If any problems with the config
  object are found, errors will be reported through logs.
	   * @param config This should follow the form of
	{@link shakaExtern.PlayerConfiguration}, but you may omit any field you do
	not wish to change.
	   */
		configure(config: any): void;
		/**
	   * Return a copy of the current configuration.  Modifications of the returned
  value will not affect the Player's active configuration.  You must call
  player.configure() to make changes.
	   */
		getConfiguration(): any;
		/**
		 * Reset configuration to default.
		 */
		resetConfiguration(): void;
		/**
	   * @returnType A reference to the HTML Media Element passed
	  in during initialization.
	   */
		getMediaElement(): any;
		/**
	   * @returnType A reference to the Player's networking
	  engine.  Applications may use this to make requests through Shaka's
	  networking plugins.
	   */
		getNetworkingEngine(): any;
		/**
	   * @returnType If a manifest is loaded, returns the manifest URI given in
	the last call to load().  Otherwise, returns null.
	   */
		getManifestUri(): any;
		/**
		 * @returnType True if the current stream is live.  False otherwise.
		 */
		isLive(): any;
		/**
	   * @returnType True if the current stream is in-progress VOD.
	False otherwise.
	   */
		isInProgress(): any;
		/**
		 * @returnType True for audio-only content.  False otherwise.
		 */
		isAudioOnly(): any;
		/**
		 * Get the seekable range for the current stream.
		 */
		seekRange(): any;
		/**
	   * Get the key system currently being used by EME.  This returns the empty
  string if not using EME.
	   */
		keySystem(): any;
		/**
	   * Get the DrmInfo used to initialize EME.  This returns null when not using
  EME.
	   */
		drmInfo(): any;
		/**
	   * The next known expiration time for any EME session.  If the sessions never
  expire, or there are no EME sessions, this returns Infinity.
	   */
		getExpiration(): any;
		/**
		 * @returnType True if the Player is in a buffering state.
		 */
		isBuffering(): any;
		/**
	   * Unload the current manifest and make the Player available for re-use.
	   * @returnType Resolved when streaming has stopped and the previous
	  content, if any, has been unloaded.
	   */
		unload(): any;
		/**
	   * Gets the current effective playback rate.  If using trick play, it will
  return the current trick play rate; otherwise, it will return the video
  playback rate.
	   */
		getPlaybackRate(): any;
		/**
	   * Skip through the content without playing.  Simulated using repeated seeks.
  Trick play will be canceled automatically if the playhead hits the beginning
  or end of the seekable range for the content.
	   * @param rate The playback rate to simulate.  For example, a rate of
	  2.5 would result in 2.5 seconds of content being skipped every second.
	  To trick-play backward, use a negative rate.
	   */
		trickPlay(rate: any): void;
		/**
		 * Cancel trick-play.
		 */
		cancelTrickPlay(): void;
		/**
	   * Return a list of variant tracks available for the current
  Period.  If there are multiple Periods, then you must seek to the Period
  before being able to switch.
	   */
		getVariantTracks(): any;
		/**
	   * Return a list of text tracks available for the current
  Period.  If there are multiple Periods, then you must seek to the Period
  before being able to switch.
	   */
		getTextTracks(): any;
		/**
	   * Select a specific text track. Note that AdaptationEvents are not
  fired for manual track selections.
	   */
		selectTextTrack(track: any): void;
		/**
	   * Select a specific track. Note that AdaptationEvents are not fired for manual
  track selections.
	   */
		selectVariantTrack(track: any, opt_clearBuffer?: any): void;
		/**
	   * Return a list of audio language-role combinations available for the current
  Period.
	   */
		getAudioLanguagesAndRoles(): any;
		/**
	   * Return a list of text language-role combinations available for the current
  Period.
	   */
		getTextLanguagesAndRoles(): any;
		/**
	   * Return a list of audio languages available for the current
  Period.
	   */
		getAudioLanguages(): any;
		/**
	   * Return a list of text languages available for the current
  Period.
	   */
		getTextLanguages(): any;
		/**
	   * Sets currentAudioLanguage and currentVariantRole to the selected
  language and role, and chooses new variant if need be.
	   */
		selectAudioLanguage(language: any, opt_role?: any): void;
		/**
	   * Sets currentTextLanguage and currentTextRole to the selected
  language and role, and chooses new text stream if need be.
	   */
		selectTextLanguage(language: any, opt_role?: any): void;
		/**
		 * @returnType True if the current text track is visible.
		 */
		isTextTrackVisible(): any;
		/**
		 * Set the visibility of the current text track, if any.
		 */
		setTextTrackVisibility(on: any): void;
		/**
		 * Returns current playhead time as a Date.
		 */
		getPlayheadTimeAsDate(): any;
		/**
		 * Returns the presentation start time as a Date.
		 */
		getPresentationStartTimeAsDate(): any;
		/**
		 * Return the information about the current buffered ranges.
		 */
		getBufferedInfo(): any;
		/**
		 * Return playback and adaptation stats.
		 */
		getStats(): any;
		/**
	   * Adds the given text track to the current Period.  Load() must resolve before
  calling.  The current Period or the presentation must have a duration.  This
  returns a Promise that will resolve when the track can be switched to and
  will resolve with the track that was created.
	   */
		addTextTrack(
			uri: any,
			language: any,
			kind: any,
			mime: any,
			opt_codec?: any,
			opt_label?: any
		): any;
		/**
	   * Set the maximum resolution that the platform's hardware can handle.
  This will be called automatically by shaka.cast.CastReceiver to enforce
  limitations of the Chromecast hardware.
	   */
		setMaxHardwareResolution(width: any, height: any): void;
		/**
		 * Retry streaming after a failure.  Does nothing if not in a failure state.
		 * @returnType False if unable to retry.
		 */
		retryStreaming(): any;
		/**
		 * Return the manifest information if it's loaded. Otherwise, return null.
		 */
		getManifest(): any;
	}
	namespace offline {
		/**
		 * A plugin that handles requests for offline content.
		 */
		function OfflineScheme(uri: any, request: any): any;
		class Storage {
			/**
		 * Gets whether offline storage is supported.  Returns true if offline storage
  is supported for clear content.  Support for offline storage of encrypted
  content will not be determined until storage is attempted.
		 */
			static support(): any;
			/**
		 * Delete the on-disk storage and all content it contains. This should not
  be done regularly, only when storage is rendered unusable.
		 */
			static deleteAll(): any;
			/**
		 * This manages persistent offline data including storage, listing, and deleting
  stored manifests.  Playback of offline manifests are done using Player
  using the special URI (see shaka.offline.OfflineUri).
  First, check support() to see if offline is supported by the platform.
  Second, configure() the storage object with callbacks to your application.
  Third, call store(), remove(), or list() as needed.
  When done, call destroy().
		 * @param player The player instance to pull configuration data from.
		 */
			constructor(player: any);
			destroy(): void;
			/**
		 * Sets configuration values for Storage.  This is not associated with
  Player.configure and will not change Player.
  There are two important callbacks configured here: one for download progress,
  and one to decide which tracks to store.
  The default track selection callback will store the largest SD video track.
  Provide your own callback to choose the tracks you want to store.
		 * @param config This should follow the form of
	{@link shakaExtern.OfflineConfiguration}, but you may omit any field you do
	not wish to change.
		 */
			configure(config: any): void;
			/**
		 * Stores the given manifest.  If the content is encrypted, and encrypted
  content cannot be stored on this platform, the Promise will be rejected with
  error code 6001, REQUESTED_KEY_SYSTEM_CONFIG_UNAVAILABLE.
		 * @param manifestUri The URI of the manifest to store.
		 * @param opt_appMetadata An arbitrary object from the application
	that will be stored along-side the offline content.  Use this for any
	application-specific metadata you need associated with the stored content.
	For details on the data types that can be stored here, please refer to
	{@link https://goo.gl/h62coS}
		 * @returnType A Promise to a structure
	representing what was stored.  The "offlineUri" member is the URI that
	should be given to Player.load() to play this piece of content offline.
	The "appMetadata" member is the appMetadata argument you passed to store().
		 */
			store(manifestUri: any, opt_appMetadata?: any, opt_manifestParserFactory?: any): any;
			/**
			 * Removes the given stored content.
			 */
			remove(contentUri: any): any;
			/**
		 * Lists all the stored content available.
		 * @returnType A Promise to an
	array of structures representing all stored content.  The "offlineUri"
	member of the structure is the URI that should be given to Player.load()
	to play this piece of content offline.  The "appMetadata" member is the
	appMetadata argument you passed to store().
		 */
			list(): any;
		}
	}
	namespace hls {
		class HlsParser {
			/**
			 * Creates a new HLS parser.
			 */
			constructor();
			configure(config: any): void;
			start(uri: any, playerInterface: any): void;
			stop(): void;
			update(): void;
			onExpirationUpdated(sessionId: any, expiration: any): void;
		}
	}
	namespace dash {
		class DashParser {
			/**
			 * Creates a new DASH parser.
			 */
			constructor();
			configure(config: any): void;
			start(uri: any, playerInterface: any): void;
			stop(): void;
			update(): void;
			onExpirationUpdated(sessionId: any, expiration: any): void;
		}
	}
}

//tslint:disable-next-line:no-single-declare-module
declare module 'shaka-player' {
	export = shaka;
}
