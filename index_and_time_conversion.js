function findTimeInBlock(block, index) {
  // Calculate the total duration of the block
  const duration = block.end_time - block.start_time;

  // Calculate the time offset of the given index within the block
  const offset = index / block.text.length * duration;

  // Limit the returned result to be within the block times.
  if (offset < 0) {
    return block.start_time;
  } else if (offset > duration) {
    return block.end_time;
  }

  // Calculate and return the time by adding the offset to the start time
  return block.start_time + offset;
}


// Kep track of the last index we looked up, since many times we will deal with sequences of similar lookups and we can make the binary search much more efficient.
let findBlockIndex__global__prevBlockIndex = null;

function findBlockIndex(transcript, time) {
  const n = transcript.length;

  let left = (findBlockIndex__global__prevBlockIndex === null) ?
    0 :
    findBlockIndex__global__prevBlockIndex;
  let right = (findBlockIndex__global__prevBlockIndex === null) ?
    n - 1 :
    findBlockIndex__global__prevBlockIndex;

  while (time < transcript[left].start_time || time > transcript[right].end_time) {
    let dist = right - left + 1;

    if (time < transcript[left].start_time) {
      if (left <= 0) {
        break;
      }
      left = Math.max(left - dist, 0);
    }
    if (time > transcript[right].end_time) {
      if (right >= n - 1) {
        break;
      }
      right = Math.min(right + dist, n - 1);
    }
  }

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const block = transcript[mid];

    if (time >= block.start_time && time < block.end_time) {
      findBlockIndex__global__prevBlockIndex = mid;
      return mid;
    }

    if (time < block.start_time) {
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }

  // Note: Don't bother setting prevBlockIndex.
  return null;
}


function findSubBlockIndex(block, time) {
  const blockStartTime = block.start_time;
  const blockEndTime = block.end_time;
  const text = block.text;
  const textDuration = blockEndTime - blockStartTime;
  const subIndex = Math.floor((time - blockStartTime) / textDuration * text.length);
  return Math.max(0, Math.min(text.length - 1, subIndex));
}

function findBlockAndIndex(transcript, time) {
  const blockIndex = findBlockIndex(transcript, time);

  if (blockIndex === null) {
    // The time is before the start of the transcript
    return null;
  }

  const block = transcript[blockIndex];
  const characterIndex = findSubBlockIndex(block, time);

  return {
    blockIndex,
    characterIndex
  };
}

const transcript = [{
    start_time: 0,
    end_time: 2,
    text: 'Hello '
  },
  {
    start_time: 2,
    end_time: 4,
    text: 'world!'
  },
  {
    start_time: 4,
    end_time: 6,
    text: 'How are you?'
  },
  {
    start_time: 6,
    end_time: 8,
    text: 'I am doing well.'
  },
  {
    start_time: 8,
    end_time: 10,
    text: 'Thank you for asking.'
  }
];


// Test with some example times
console.log("EXP 0", findBlockIndex(transcript, 1.5)); // Output: { blockIndex: 0, characterIndex: 5 }
console.log("EXP 0", findBlockIndex(transcript, 1.6)); // Output: { blockIndex: 0, characterIndex: 5 }
console.log("EXP 1", findBlockIndex(transcript, 2.5)); // Output: { blockIndex: 1, characterIndex: 0 }
console.log("EXP 3", findBlockIndex(transcript, 5.5)); // Output: { blockIndex: 3, characterIndex: 4 }
console.log("EXP 4", findBlockIndex(transcript, 8.5)); // Output: { blockIndex: 4, characterIndex: 11 }
console.log("EXP null", findBlockIndex(transcript, 11)); // Output: { blockIndex: -1, characterIndex: -1 }

// Test with some example times
console.log(findBlockAndIndex(transcript, 1.5)); // Output: { blockIndex: 0, characterIndex: 5 }
console.log(findBlockAndIndex(transcript, 2.5)); // Output: { blockIndex: 1, characterIndex: 0 }
console.log(findBlockAndIndex(transcript, 5.5)); // Output: { blockIndex: 3, characterIndex: 4 }
console.log(findBlockAndIndex(transcript, 8.5)); // Output: { blockIndex: 4, characterIndex: 11 }
console.log(findBlockAndIndex(transcript, 11)); // Output: { blockIndex: -1, characterIndex: -1 }

console.log(findTimeInBlock(transcript[4], 0), " within block pos 0");
console.log(findTimeInBlock(transcript[4], 1), " within block pos 1");
console.log(findTimeInBlock(transcript[4], 2), " within block pos 2");
console.log(findTimeInBlock(transcript[4], 3), " within block pos 3");
console.log(findTimeInBlock(transcript[4], 4), " within block pos 4");
console.log(findTimeInBlock(transcript[4], 5), " within block pos 5");
console.log(findTimeInBlock(transcript[4], 6), " within block pos 6");
console.log(findTimeInBlock(transcript[4], 7), " within block pos 7");
console.log(findTimeInBlock(transcript[4], 8), " within block pos 8");
console.log(findTimeInBlock(transcript[4], 9), " within block pos 9");
console.log(findTimeInBlock(transcript[4], 10), " within block pos 10");
console.log(findTimeInBlock(transcript[4], 11), " within block pos 11");
console.log(findTimeInBlock(transcript[4], 12), " within block pos 12");
console.log(findTimeInBlock(transcript[4], 13), " within block pos 13");
console.log(findTimeInBlock(transcript[4], 14), " within block pos 14");
console.log(findTimeInBlock(transcript[4], 15), " within block pos 15");
console.log(findTimeInBlock(transcript[4], 16), " within block pos 16");
console.log(findTimeInBlock(transcript[4], 17), " within block pos 17");
console.log(findTimeInBlock(transcript[4], 18), " within block pos 18");
console.log(findTimeInBlock(transcript[4], 19), " within block pos 19");
console.log(findTimeInBlock(transcript[4], 20), " within block pos 20");
console.log(findTimeInBlock(transcript[4], 21), " within block pos 21");
console.log(findTimeInBlock(transcript[4], 22), " within block pos 22");
