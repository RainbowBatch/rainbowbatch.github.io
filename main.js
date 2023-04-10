function debounce(func, wait, immediate) {
  var timeout;

  return function executedFunction() {
    var context = this;
    var args = arguments;

    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    var callNow = immediate && !timeout;

    clearTimeout(timeout);

    timeout = setTimeout(later, wait);

    if (callNow) func.apply(context, args);
  };
}

const lerp = (x, y, a) => x * (1 - a) + y * a;

const hashCode = (s) =>
  s.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

function uuid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return (
    s4() +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    s4() +
    s4()
  );
}

function initials(name) {
  let rgx = new RegExp(/(\p{L}{1})\p{L}+/, "gu");

  let initials = [...name.matchAll(rgx)] || [];

  initials = (
    (initials.shift()?.[1] || "") + (initials.pop()?.[1] || "")
  ).toUpperCase();

  return initials;
}

function parse_timestamp(timestamp) {
  var p = timestamp.split(":"),
    s = 0,
    m = 1;

  while (p.length > 0) {
    s += m * parseFloat(p.pop(), 10);
    m *= 60;
  }

  return s;
}

function format_timestamp(s) {
  return new Date(s * 1000).toISOString().substring(11, 22);
}

function downloadJsonFile(filename, data) {
  // Convert the JSON object to a string
  const jsonString = JSON.stringify(data, null, "\t");

  // Create a Blob object containing the JSON string
  const blob = new Blob([jsonString], { type: "application/json" });

  // Create a link element to use for the download
  const link = document.createElement("a");

  // Set the link element's href and download attributes
  // Also set the link's style to "display: none"
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.style.display = "none";

  // Append the link to the DOM
  document.body.appendChild(link);

  // Click the link to initiate the download
  link.click();

  // Remove the link from the DOM
  document.body.removeChild(link);
}

function uploadJsonFile() {
  // Create an input element for the file upload
  const input = document.createElement("input");

  // Set the input element's style to "display: none"
  input.style.display = "none";

  // Set the input element's type to "file"
  input.type = "file";

  // Create a promise that will be resolved with the JSON data
  const loadPromise = new Promise((resolve, reject) => {
    // Add an event listener for the "change" event
    input.addEventListener("change", () => {
      // Check if the selected file is a JSON file
      if (input.files[0].type === "application/json") {
        // Create a FileReader object to read the file
        const reader = new FileReader();

        // Add an event listener for the "load" event
        reader.addEventListener("load", () => {
          // Parse the JSON data from the file
          const json = JSON.parse(reader.result);

          // Resolve the promise with the JSON data
          resolve(json);
        });

        // Start reading the file
        reader.readAsText(input.files[0]);
      } else {
        // Reject the promise if the selected file is not a JSON file
        reject(new Error("The selected file is not a JSON file"));
      }

      // Remove the input element from the DOM
      document.body.removeChild(input);
    });
  });

  // Append the input element to the DOM
  document.body.appendChild(input);

  // Click the input element to open the file selector
  input.click();

  // Return the promise
  return loadPromise;
}

function trim_textarea(element) {
  // Handle leading spaces.
  if (element.value != element.value.trimStart()) {
    // Refocus on the start.
    if (element.selectionStart < element.value.length / 1.5) {
      element.value = element.value.trim();
      element.setSelectionRange(0, 0);
    } else {
      element.value = element.value.trim();
    }
  }

  let endTrim = element.value.trimEnd();
  if (element.value != endTrim) {
    if (endTrim.length > element.selectionEnd) {
      element.value = element.value.trimEnd();
    } else {
      element.value = element.value.slice(0, element.selectionEnd);
    }
  }
}

function resize_textarea(element) {
  element.style.height = "1px";
  element.style.height = element.scrollHeight + "px";
}

function resize_and_trim_textarea(element) {
  trim_textarea(element);
  resize_textarea(element);
}

var loading_overlay = document.getElementById("loading_overlay");
var play_button = document.getElementById("play_button");
var audio = document.getElementById("audio_sample");
var slider = document.getElementById("audio_position");
var output = document.getElementById("audio_timestamp");
var speaker_name_input = document.getElementById("speaker-name-input");
var speaker_select_list = document.getElementById("speaker-select-list");

var popup_target = null;

var segmentStart;
var segmentEnd;

// A human readable identifier for the audio file.
var audio_identifier = "UNKNOWN";

audio.addEventListener(
  "timeupdate",
  function () {
    slider.value = (100 * audio.currentTime) / audio.duration;
    output.innerHTML = new Date(audio.currentTime * 1000)
      .toISOString()
      .substring(11, 22);

    move_overlay_marker_to_audio_position();

    if (segmentEnd !== null && audio.currentTime >= segmentEnd) {
      audio.pause();
      if (loop && segmentStart !== null) {
        audio.currentTime = segmentStart;
        audio.play();
      }
    }
  },
  false
);

function play() {
  if (audio.paused) {
    audio.currentTime = (slider.value * audio.duration) / 100.0;
    audio.play();
    play_button.setAttribute("name", "pause-outline");
  } else {
    audio.pause();
    play_button.setAttribute("name", "play-outline");
  }
}

function playSegment(startTime, endTime) {
  audio.load();
  segmentStart = startTime;
  segmentEnd = endTime;
  audio.currentTime = startTime;
  audio.play();
}

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function () {
  audio.pause();
  audio.currentTime = (slider.value * audio.duration) / 100.0;

  segmentStart = null;
  segementEnd = null;
};

const get_textarea_cursor_xy = (input, selectionPoint) => {
  const {
    offsetLeft,
    offsetTop,
    offsetHeight,
    offsetWidth,
    scrollLeft,
    scrollTop,
    selectionEnd
  } = input;
  // create a dummy element that will be a clone of our input
  const div = document.createElement("div");
  // get the computed style of the input and clone it onto the dummy element
  const copyStyle = getComputedStyle(input);
  const { lineHeight, paddingRight } = copyStyle;

  for (const prop of copyStyle) {
    div.style[prop] = copyStyle[prop];
  }
  // we need a character that will replace whitespace when filling our dummy element if it's a single line <input/>
  const swap = ".";
  const inputValue =
    input.tagName === "INPUT" ? input.value.replace(/ /g, swap) : input.value;
  // set the div content to that of the textarea up until selection
  const textContent = inputValue.substr(0, selectionPoint);
  // set the text content of the dummy element div
  div.textContent = textContent;
  if (input.tagName === "TEXTAREA") div.style.height = "auto";
  // if a single line input then the div needs to be single line and not break out like a text area
  if (input.tagName === "INPUT") div.style.width = "auto";
  // create a marker element to obtain caret position
  const span = document.createElement("span");
  // give the span the textContent of remaining content so that the recreated dummy element is as close as possible
  span.textContent = inputValue.substr(selectionPoint) || ".";
  // append the span marker to the div
  div.appendChild(span);
  // append the dummy element to the body
  document.body.appendChild(div);
  // get the marker position, this is the caret position top and left relative to the input
  const { offsetLeft: spanX, offsetTop: spanY } = span;
  // lastly, remove that dummy element
  // NOTE:: can comment this out for debugging purposes if you want to see where that span is rendered
  document.body.removeChild(div);
  // return an object with the x and y of the caret. account for input positioning so that you don't need to wrap the input
  const x = offsetLeft + spanX;
  const y = offsetTop + spanY;

  const lineHeightPx = parseInt(lineHeight, 10);
  const paddingRightPx = parseInt(paddingRight, 10);

  // set the marker positioning
  // for the left positioning we ensure that the maximum left position is the width of the input minus the right padding using Math.min
  // we also account for current scroll position of the input
  const newLeft = Math.min(
    x - scrollLeft,
    offsetLeft + offsetWidth - paddingRightPx
  );

  // for the top positioning we ensure that the maximum top position is the height of the input minus line height
  // we also account for current scroll position of the input
  const newTop =
    Math.min(y - scrollTop, offsetTop + offsetHeight - lineHeightPx) +
    lineHeightPx / 2;

  return {
    x: newLeft,
    y: newTop
  };
};

function findTimeInBlock(block, index) {
  // Calculate the total duration of the block
  const duration = block.end_timestamp - block.start_timestamp;

  // Calculate the time offset of the given index within the block
  const offset = (index / block.text.length) * duration;

  // Limit the returned result to be within the block times.
  if (offset < 0) {
    return block.start_timestamp;
  } else if (offset > duration) {
    return block.end_timestamp;
  }

  // Calculate and return the time by adding the offset to the start time
  return block.start_timestamp + offset;
}

// Keep track of the last index we looked up, since many times we will deal with sequences of similar lookups and we can make the binary search much more efficient.
let findBlockIndex__global__prevBlockIndex = null;

function findTranscriptBlockIndex(transcript, time) {
  const n = transcript.length;

  let left =
    findBlockIndex__global__prevBlockIndex === null
      ? 0
      : findBlockIndex__global__prevBlockIndex;
  let right =
    findBlockIndex__global__prevBlockIndex === null
      ? n - 1
      : findBlockIndex__global__prevBlockIndex;

  while (
    time < transcript[left].start_timestamp ||
    time > transcript[right].end_timestamp
  ) {
    let dist = right - left + 1;

    if (time < transcript[left].start_timestamp) {
      if (left <= 0) {
        break;
      }
      left = Math.max(left - dist, 0);
    }
    if (time > transcript[right].end_timestamp) {
      if (right >= n - 1) {
        break;
      }
      right = Math.min(right + dist, n - 1);
    }
  }

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const block = transcript[mid];

    if (time >= block.start_timestamp && time < block.end_timestamp) {
      findBlockIndex__global__prevBlockIndex = mid;
      return mid;
    }

    if (time < block.start_timestamp) {
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }

  // Note: Don't bother setting prevBlockIndex.
  return null;
}

function findTranscriptBlockSubindex(block, time) {
  const blockStartTime = block.start_timestamp;
  const blockEndTime = block.end_timestamp;
  const text = block.text;
  const textDuration = blockEndTime - blockStartTime;
  const subIndex = Math.floor(
    ((time - blockStartTime) / textDuration) * text.length
  );
  return Math.max(0, Math.min(text.length - 1, subIndex));
}

function findTranscriptPositionFromTime(transcript, time) {
  const blockIndex = findTranscriptBlockIndex(transcript, time);

  if (blockIndex === null) {
    // The time is before the start of the transcript
    return null;
  }

  const block = transcript[blockIndex];
  const characterIndex = findTranscriptBlockSubindex(block, time);

  return {
    blockIndex,
    characterIndex
  };
}

function set_audio_time_to_cursor(input) {
  const block_node = locate_transcript_block(input);
  const block_data = extract_transcript_block_data(block_node);
  const cursor_time = findTimeInBlock(block_data, input.selectionEnd);

  if (audio.paused) {
    audio.currentTime = cursor_time;
  } else if (Math.abs(audio.currentTime - cursor_time) > 10) {
    audio.pause();
    audio.currentTime = cursor_time;
    audio.play();
  }
}

// A cached copy of the transcript for things that need to poll it very quickly
// but don't want to incur the cost of reading it from DOM.
let cached_transcript = null;
window.setInterval(function () {
  console.log("WOULD RELOAD NOW");
}, 5000);

function move_overlay_marker_to_audio_position() {
  if (cached_transcript === null) {
    cached_transcript = extract_transcript_data();
  }

  const audio_marker_idx = findTranscriptPositionFromTime(
    cached_transcript,
    audio.currentTime
  );

  if (audio_marker_idx === null) {
    return;
  }

  const audio_marker_block = document.getElementById(
    cached_transcript[audio_marker_idx.blockIndex].id
  );
  const audio_marker_input = locate_transcript_input(audio_marker_block);

  const { x, y } = get_textarea_cursor_xy(
    audio_marker_input,
    audio_marker_idx.characterIndex
  );

  document
    .querySelector(".overlay-marker")
    .setAttribute("style", `left: ${x}px; top: ${y}px`);
}

function process_transcript_block_event(e) {
  const this_block = locate_transcript_block(e.target);
  const this_input = locate_transcript_input(this_block);
  resize_and_trim_textarea(this_input);
  const { selectionStart, selectionEnd } = this_input;

  const prev_block = this_block.previousElementSibling;
  const prev_input = locate_transcript_input(prev_block);

  const next_block = this_block.nextElementSibling;
  const next_input = locate_transcript_input(next_block);

  set_audio_time_to_cursor(this_input);

  if (e.type == "keydown") {
    if (e.key === "Enter" || e.keyCode === 13) {
      // Modify metadata
      let pre_split_data = extract_transcript_block_data(this_block);

      // TODO(woursler): This doesn't really do the right thing at the end of strings...
      let lhs_len = selectionStart;
      let rhs_len = this_input.value.length - selectionEnd;
      let alpha = lhs_len + rhs_len == 0 ? 0.5 : lhs_len / (lhs_len + rhs_len);
      let split_timestamp = lerp(
        pre_split_data.start_timestamp,
        pre_split_data.end_timestamp,
        alpha
      );

      let this_block_data = {
        id: pre_split_data.id,
        speaker: pre_split_data.speaker,
        start_timestamp: pre_split_data.start_timestamp,
        end_timestamp: split_timestamp,
        text: this_input.value.slice(0, selectionStart).trim()
      };

      let new_block_data = {
        speaker: pre_split_data.speaker,
        start_timestamp: split_timestamp,
        end_timestamp: pre_split_data.end_timestamp,
        text: this_input.value.slice(selectionEnd).trim()
      };

      set_transcript_block_data(this_block, this_block_data);
      resize_and_trim_textarea(this_input);

      let new_block = create_transcript_block_with_data(new_block_data);
      this_block.after(new_block);

      // Focus post-split content
      let new_input = locate_transcript_input(new_block);
      resize_and_trim_textarea(new_input);
      new_input.focus();
      new_input.select();
      new_input.setSelectionRange(0, 0);
      set_audio_time_to_cursor(new_input);
    }
    if ((e.key === "Backspace" || e.keyCode === 8) && selectionEnd == 0) {
      if (
        prev_block !== null &&
        prev_block.classList.contains("transcript-block")
      ) {
        let previous_len = prev_input.value.length;
        let merged_data = merge_transcript_block_data(
          extract_transcript_block_data(prev_block),
          extract_transcript_block_data(this_block)
        );
        merged_data.text = (prev_input.value + this_input.value).trim();

        set_transcript_block_data(prev_block, merged_data);
        resize_and_trim_textarea(prev_input);

        this_block.remove();
        prev_input.focus();
        prev_input.setSelectionRange(previous_len, previous_len);
        set_audio_time_to_cursor(prev_input);
      }
    }

    let input_len = e.target.value.length;
    if (
      (e.key === "Delete" || e.keyCode === 46) &&
      selectionStart == input_len
    ) {
      if (
        next_block !== null &&
        next_block.classList.contains("transcript-block")
      ) {
        let merged_data = merge_transcript_block_data(
          extract_transcript_block_data(this_block),
          extract_transcript_block_data(next_block)
        );
        merged_data.text = (this_input.value + next_input.value).trim();

        set_transcript_block_data(next_block, merged_data);
        resize_and_trim_textarea(next_input);

        this_block.remove();
        next_input.focus();
        next_input.setSelectionRange(input_len, input_len);
        set_audio_time_to_cursor(next_input);
      }
    }
  }
}

function start_loading() {
  loading_overlay.style.visibility = "visible";
  loading_overlay.style.opacity = 1;
}

function finish_loading() {
  loading_overlay.style.visibility = "hidden";
  loading_overlay.style.opacity = 0;
}

function open_refine_timing_popup(origin) {
  const block_node = locate_transcript_block(origin);
  const block_data = extract_transcript_block_data(block_node);
  const refine_timing_content = document.getElementById(
    "refine-timing-content"
  );

  var block_text = refine_timing_content.querySelector(".block-text");
  var timestamp_start = refine_timing_content.querySelector(".timestamp-start");
  var timestamp_end = refine_timing_content.querySelector(".timestamp-end");
  var name_icon = refine_timing_content.querySelector(".name-icon");
  var name = refine_timing_content.querySelector(".name");

  if (block_data.speaker) {
    name.textContent = block_data.speaker;
    name_icon.textContent = initials(block_data.speaker);
  } else {
    name.textContent = "Unknown Speaker";
    name_icon.textContent = "?";
  }
  name_icon.style.backgroundColor = speaker_color_for(block_data.speaker);

  block_text.textContent = block_data.text;

  timestamp_start.value = format_timestamp(block_data.start_timestamp);
  timestamp_end.value = format_timestamp(block_data.end_timestamp);
}

function open_popup(popup_id, origin) {
  popup_target = origin;
  window.location.hash = null;
  window.location.hash = popup_id;

  // TODO: Use a map instead so we can have handlers for each? Put it on the element?
  if (popup_id === "refine_timing") {
    open_refine_timing_popup(origin);
  }
}

function close_popup() {
  popup_target = null;
  window.location.hash = null;
}

function selectSpeaker(event) {
  const block = locate_transcript_block(popup_target);
  const speaker_node =
    event.target.querySelector(".name") ||
    event.target.closest(".name") ||
    event.target;
  const speaker = speaker_node.innerText;

  if (speaker == "Unknown Speaker") {
    set_transcript_block_speaker(block, null);
  } else {
    set_transcript_block_speaker(block, speaker);
  }
  close_popup();
}

function updateSpeakerFilter() {
  console.log("UpdateSpeakerFilter, NOT YET IMPLEMENTED");
}

function createSpeakerSelectorIfNew(speaker) {
  if (speaker === null || SPEAKER_COLORS.has(speaker)) {
    return;
  }

  var new_speaker_li = document
    .getElementById("speaker-select-item-template")
    .firstElementChild.cloneNode(true);

  var name_icon = new_speaker_li.querySelector(".name-icon");
  var name = new_speaker_li.querySelector(".name");

  name.textContent = speaker;
  name_icon.textContent = initials(speaker);
  name_icon.style.backgroundColor = speaker_color_for(speaker);

  speaker_select_list.appendChild(new_speaker_li);
}

function addSpeaker() {
  var new_speaker = speaker_name_input.value.trim();
  if (new_speaker.length == 0) {
    return; // Nothing to do.
  }
  speaker_name_input.value = "";
  createSpeakerSelectorIfNew(new_speaker);

  const block = locate_transcript_block(popup_target);
  set_transcript_block_speaker(block, new_speaker);
  close_popup();
}

function save() {
  const data = {
    audio_identifier: audio_identifier,
    audio_url: audio.src,
    blocks: extract_transcript_data()
  };
  downloadJsonFile(`${audio_identifier}_transcript.json`, data);
}

function load_transcript_json(json) {
  start_loading();

  // All of these promises must resolve to end the loading state.
  var loadingPromises = [];

  audio_identifier = json.audio_identifier;

  create_transcript(json.blocks);

  if (audio.src != json.audio_url) {
    audio.src = json.audio_url;
    // Promise is resolved when the canplay event is triggered.
    var audioLoadedPromise = new Promise(function (resolve, reject) {
      audio.addEventListener("canplaythrough", function () {
        resolve();
      });
    });
    loadingPromises.push(audioLoadedPromise);
  }

  // Wait for all promises to be completed
  Promise.all(loadingPromises).then((values) => {
    finish_loading();
  });
}

function refine_timing() {
  close_popup();
}

function upload_transcript_json() {
  uploadJsonFile().then((json) => {
    close_popup();
    load_transcript_json(json);
  });
}

function locate_transcript_block(element) {
  return element.closest(".transcript-block");
}

function locate_transcript_input(transcript_block) {
  if (transcript_block == null) {
    return null;
  }
  return transcript_block.querySelector(".transcript-block-input ");
}

function merge_transcript_block_data(data_1, data_2) {
  let first_longer = data_1.text.length > data_2.text.length;
  return {
    id:
      (first_longer ? data_1.id : data_2.id) ||
      data_1.id ||
      data_2.id ||
      uuid(),
    speaker: first_longer ? data_1.speaker : data_2.speaker,
    start_timestamp: Math.min(data_1.start_timestamp, data_2.start_timestamp),
    end_timestamp: Math.max(data_1.end_timestamp, data_2.end_timestamp)
  };
}

function extract_transcript_block_data(transcript_block) {
  return {
    id: transcript_block.id,
    speaker: transcript_block.querySelector(".name").textContent,
    start_timestamp: parse_timestamp(
      transcript_block.querySelector(".timestamp-start").textContent
    ),
    end_timestamp: parse_timestamp(
      transcript_block.querySelector(".timestamp-end").textContent
    ),
    text: transcript_block
      .querySelector(".transcript-block-input ")
      .value.trim()
  };
}

function extract_transcript_data() {
  return [
    ...document
      .getElementById("transcript-blocks")
      .querySelectorAll(".transcript-block")
  ].map(extract_transcript_block_data);
}

function interpolate_timestamp(block_node, subblock_index) {
  const block_data = extract_transcript_block_data(block_node);
  return lerp(
    block_data.start_timestamp,
    block_data.end_timestamp,
    subblock_index / block_data.text.length
  );
}

function locate_timestamp(timestamp) {
  for (const block of extract_transcript_data()) {
    if (
      block.start_timestamp <= timestamp &&
      block.end_timestamp >= timestamp
    ) {
      return {
        block: block.id,
        subblock_index: Math.round(
          lerp(
            0,
            block.text.length,
            (timestamp - block.start_timestamp) /
              (block.end_timestamp - block.start_timestamp)
          )
        )
      };
    }
  }
}

// TODO(woursler): Do something more clever to ensure consistency.
// 500 lightness colors from https://materialui.co/colors/
const POSSIBLE_SPEAKER_COLORS = [
  "#F44336",
  "#E91E63",
  "#9C27B0",
  "#673AB7",
  "#3F51B5",
  "#2196F3",
  "#03A9F4",
  "#00BCD4",
  "#009688",
  "#4CAF50",
  "#8BC34A",
  "#CDDC39",
  "#FFEB3B",
  "#FFC107",
  "#FF9800",
  "#FF5722"
];
const SPEAKER_COLORS = new Map();

function speaker_color_for(speaker) {
  if (speaker) {
    if (!SPEAKER_COLORS.has(speaker)) {
      if (POSSIBLE_SPEAKER_COLORS.length > 0) {
        const index = hashCode(speaker) % POSSIBLE_SPEAKER_COLORS.length;
        SPEAKER_COLORS.set(speaker, POSSIBLE_SPEAKER_COLORS.splice(index, 1));
      } else {
        SPEAKER_COLORS.set(speaker, "#9C27B0");
      }
    }
    return SPEAKER_COLORS.get(speaker);
  }
  return null;
}

function set_transcript_block_speaker(block, speaker) {
  createSpeakerSelectorIfNew(speaker);

  var name_icon = block.querySelector(".name-icon");
  var name = block.querySelector(".name");

  if (speaker) {
    name.textContent = speaker;
    name_icon.textContent = initials(speaker);
  } else {
    name.textContent = "Unknown Speaker";
    name_icon.textContent = "?";
  }
  name_icon.style.backgroundColor = speaker_color_for(speaker);
}

function set_transcript_block_data(block, data) {
  var input = locate_transcript_input(block);
  var timestamp_start = block.querySelector(".timestamp-start");
  var timestamp_end = block.querySelector(".timestamp-end");

  block.id = data.id || block.id || uuid();

  set_transcript_block_speaker(block, data.speaker);

  timestamp_start.textContent = format_timestamp(data.start_timestamp);
  timestamp_end.textContent = format_timestamp(data.end_timestamp);

  input.value = data.text;
}

function create_transcript_block_with_data(data) {
  var new_block = document
    .getElementById("transcript-block-template")
    .firstElementChild.cloneNode(true);
  var new_input = locate_transcript_input(new_block);

  // Add all the event listeners.
  [
    "input",
    "propertychange",
    "paste",
    "click",
    "keydown",
    "keyup",
    "focus"
  ].forEach((event_type) => {
    new_input.addEventListener(event_type, process_transcript_block_event);
  });

  set_transcript_block_data(new_block, data);

  return new_block;
}

function create_transcript(blocks) {
  var transcript_blocks = document.getElementById("transcript-blocks");

  // Remove all existing transcript blocks.
  while (transcript_blocks.firstChild) {
    transcript_blocks.removeChild(transcript_blocks.firstChild);
  }

  for (const block_data of blocks) {
    var block = create_transcript_block_with_data(block_data);
    transcript_blocks.append(block);
    var input = locate_transcript_input(block);
    resize_and_trim_textarea(input);
  }
}

window.onload = () => {
  start_loading();
  const url =
    "https://gist.githubusercontent.com/RainbowBatch/643d05f9bebdb47e82c9d92db9081133/raw/ed897e5701489d50b198f8ece88882a6aeab27ab/data.json";

  fetch(url)
    .then((response) => response.json())
    .then((json) => {
      start_loading();
      load_transcript_json(json);
      finish_loading();
    });
};


// When the window is resized, we need to recompute the size of the text areas.
// But we don't want to do it on every event to avoid lagging things out.
window.addEventListener(
  "resize",
  debounce(function () {
    for (const transcript_block of document
      .getElementById("transcript-blocks")
      .querySelectorAll(".transcript-block")) {
      const transcript_input = locate_transcript_input(transcript_block);
      resize_and_trim_textarea(transcript_input);
    }
  }, 250)
);

// Shortcut for play / pause;
// TODO(woursler): Ideally jump to the location associated with the click.
document.ondblclick = play;
