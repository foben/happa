'use strict';
import validate from 'validate.js';

export function dedent(strings, ...values) {
  let raw;
  if (typeof strings === 'string') {
    // dedent can be used as a plain function
    raw = [strings];
  } else {
    raw = strings.raw;
  }

  // first, perform interpolation
  let result = '';
  for (let i = 0; i < raw.length; i++) {
    result += raw[i].


      // handle escaped backticks
      replace(/\\`/g, '`');

    if (i < values.length) {
      result += values[i];
    }
  }

  // now strip indentation
  const lines = result.split('\n');
  let mindent = null;
  lines.forEach(l => {
    let m = l.match(/^(\s+)\S+/);
    if (m) {
      let indent = m[1].length;
      if (!mindent) {
        // this is the first indented line
        mindent = indent;
      } else {
        mindent = Math.min(mindent, indent);
      }
    }
  });

  if (mindent !== null) {
    result = lines.map(l => l[0] === ' ' ? l.slice(mindent) : l).join('\n');
  }

  // dedent eats leading and trailing whitespace too
  result = result.trim();

  // handle escaped newlines at the end to ensure they don't get stripped too
  return result.replace(/\\n/g, '\n');
};

export function humanFileSize(bytes, si) {
    // http://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable
    var thresh = si ? 1000 : 1024;

    if(Math.abs(bytes) < thresh) {
      return {
        value: bytes.toFixed(1),
        unit: 'B'
      };
    }

    var units = si
        ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
        : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];

    var u = -1;

    do {
        bytes /= thresh;
        ++u;
    } while(Math.abs(bytes) >= thresh && u < units.length - 1);

    return {
      value: bytes.toFixed(1),
      unit: units[u]
    };
};

// validateOrRaise
// ----------------
// Helper method that validates an object based on constraints.
// Raises a TypeError with helpful message if the validation fails.
//
export function validateOrRaise(validatable, constraints) {
  var validationErrors = validate(validatable, constraints, {fullMessages: false});

  if(validationErrors){
    // If there are validation errors, throw a TypeError that has readable
    // information about what went wrong.
    var messages = _.map(validationErrors, (errorMessages, field) => {
      return field + ': ' + errorMessages.join(', ');
    });
    throw(new TypeError(messages.join('\n')));
  }
};