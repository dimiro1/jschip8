'use strict';

module.exports = {
  load: function(fileUrl, success, error) {
    var request = new XMLHttpRequest();
    request.open('GET', fileUrl, true);
    request.responseType = 'arraybuffer';
    request.send();

    request.onreadystatechange = function() {
      if (request.readyState === 4) {
        if (request.status === 200) {
          if (typeof success == 'function') {
            success(request.response);
          }
        } else if (typeof error == 'function') {
          error(request.response);
        }
      }
    };
  }
};
