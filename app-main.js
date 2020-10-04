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
    "jsoneditor": [ "node_modules/jsoneditor/dist/jsoneditor", "https://cdn.jsdelivr.net/npm/jsoneditor@9/dist/jsoneditor" ]
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

(function() {
  // Get the script element for this script
  // If document.currentScript doesn't work (i.e., we're in IE), query for it instead
  var currentScript = document.currentScript || (function(list) { return list[list.length-1]; })(document.querySelectorAll('#container script'));

  require(['esm!./app'], function(app) {
    app.default({
      scriptElement: currentScript
    });
  });
})();
