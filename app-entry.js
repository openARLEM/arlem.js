import app from './app.js';

{
  // Get the script element for this script
  // If document.currentScript doesn't work (i.e., we're in IE), query for it instead
  let currentScript = document.currentScript || (function(list) { return list[list.length-1]; })(document.querySelectorAll('#container script'));

  app({
    scriptElement: currentScript
  });
}
