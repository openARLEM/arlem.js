mocha.setup("bdd");

require.config({
  baseUrl: ".",
  paths: {
    "esm": [ "node_modules/require-babel/esm", "https://cdn.jsdelivr.net/npm/require-babel@1/esm" ],
    "jsx": [ "node_modules/require-babel/jsx", "https://cdn.jsdelivr.net/npm/require-babel@1/jsx" ],
    "json": [ "node_modules/require-babel/json", "https://cdn.jsdelivr.net/npm/require-babel@1/json" ],
    "require-babel": [ "node_modules/require-babel/babel", "https://cdn.jsdelivr.net/npm/require-babel@1/babel" ],
    "babel-standalone": [ "node_modules/@babel/standalone/babel", "https://cdn.jsdelivr.net/npm/@babel/standalone@7/babel" ],
    "react": [ "node_modules/react/umd/react.development", "https://cdn.jsdelivr.net/npm/react@16/umd/react.development" ],
    "react-dom": [ "node_modules/react-dom/umd/react-dom.development", "https://cdn.jsdelivr.net/npm/react-dom@16/umd/react-dom.development" ],
    "react-bootstrap": [ "node_modules/react-bootstrap/dist/react-bootstrap", "https://cdn.jsdelivr.net/npm/react-bootstrap@1/dist/react-bootstrap" ],
    "jsoneditor": [ "node_modules/jsoneditor/dist/jsoneditor", "https://cdn.jsdelivr.net/npm/jsoneditor@9/dist/jsoneditor" ],
    "chai": [ "node_modules/chai/chai", "https://cdn.jsdelivr.net/npm/chai@4/chai" ],
    "react-dom/test-utils": [ "node_modules/react-dom/umd/react-dom-test-utils.development", "https://cdn.jsdelivr.net/npm/react-dom@16/umd/react-dom-test-utils.development" ]
  },
  config: {
    "esm": { extensions: { ".js": "esm!", ".jsx": "jsx!", ".json": "json!" } },
    "jsx": { extensions: { ".js": "esm!", ".jsx": "jsx!", ".json": "json!" } }
  }
});
require.exec = function(text) {
  // Do no eval (the default)
  var node = require.createNode({});
  node.text = text;
  document.head.appendChild(node);
};

require(["esm!./src/test"], function() {
  function launch() {
    mocha.run();
  }

  function loaded() {
    if (typeof APP_LAUNCH_DELAY === "undefined" || APP_LAUNCH_DELAY === 0) {
      launch();
    } else {
      console.log("Delaying app launch by " + APP_LAUNCH_DELAY + " ms");
      window.setTimeout(function() {
        launch();
      }, APP_LAUNCH_DELAY);
    }
  }

  if (document.readyState === "complete") {
    loaded();
  } else {
    document.addEventListener("DOMContentLoaded", function() {
      loaded();
    });
  }
});
