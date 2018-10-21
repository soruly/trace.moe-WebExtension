if (!self.browser && self.chrome) {
  browser = chrome;
}

browser.contextMenus.create({
  id: 'search-on-trace.moe',
  title: 'Search on trace.moe',
  contexts: ['image', 'video']
});

var imageDataURL;

var handleMessage = function(request, sender, sendResponse) {
  if (request.type === "getImageDataURL" && imageDataURL) {
    sendResponse({
      imageDataURL: imageDataURL
    });
    imageDataURL = null;
  }
}

browser.runtime.onMessage.addListener(handleMessage);


var search = function(dataURL) {
  imageDataURL = dataURL;
  browser.tabs.create({
    url: 'https://trace.moe'
  })
}

var toDataURL = function(source) {
  try {
    var canvas = document.createElement("canvas");
    canvas.crossOrigin = 'anonymous';
    canvas.height = 720;
    if (source.nodeName === "VIDEO") {
      canvas.width = source.videoWidth / source.videoHeight * canvas.height;
    } else {
      canvas.width = source.width / source.height * canvas.height;
    }
    canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.9);
  } catch (err) {
    return null;
  }
}

var getDataURL = function(target) {
  return new Promise(
    function(resolve, reject) {
      browser.tabs.query({
          'active': true
        },
        function(tabs) {
          browser.tabs.sendMessage(
            tabs[0].id, {
              action: "getDataURL",
              target: target
            },
            function(response) {
              if (response && response.dataURL) {
                resolve(response.dataURL);
              } else {
                reject(Error("CORS Error"));
              }
            }
          );
        });
    }
  );
}

var fetchImage = function(src) {
  var img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = function() {
    search(toDataURL(this));
  };
  img.src = src;
}

var getCurrentTime = function(target) {
  return new Promise(
    function(resolve, reject) {
      browser.tabs.query({
          'active': true
        },
        function(tabs) {
          browser.tabs.sendMessage(
            tabs[0].id, {
              action: "getCurrentTime",
              target: target
            },
            function(response) {
              resolve(response.currentTime);
            }
          );
        }
      );
    }
  );
};

var fetchVideo = function(src, currentTime) {
  var player = document.createElement("video");
  player.crossOrigin = 'anonymous';
  player.src = src;
  player.width = player.videoWidth;
  player.height = player.height;
  player.currentTime = currentTime;
  player.volume = 0;
  player.onloadeddata = function() {
    search(toDataURL(player));
  };
}

browser.contextMenus.onClicked.addListener(function(info, tab) {
  
  if (info.srcUrl) {
    if (info.srcUrl.indexOf('blob:') === 0) {
      // must capture on context script
      // for video it will return capture at currentTime
      getDataURL(info.srcUrl)
        .then(function(dataURL) {
          search(dataURL);
        });

    } else if (info.mediaType === "image" && info.srcUrl.indexOf('data:') === 0) {
      search(info.srcUrl);

    } else if (info.mediaType === "image") {
      getDataURL(info.srcUrl)
        .then(function(dataURL) {
          search(dataURL);
        }, function() {
          fetchImage(info.srcUrl);
        });

    } else if (info.mediaType === "video") {
      getDataURL(info.srcUrl)
        .then(function(dataURL) {
          search(dataURL);
        }, function() {
          getCurrentTime(info.srcUrl)
            .then(function(currentTime) {
              fetchVideo(info.srcUrl, currentTime);
            });
        });
    }
  }
});
