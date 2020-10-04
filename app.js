import main from './src/main.js';

function launch(context) {
  // Fill out the launch context
  context.domContainer = context.scriptElement.parentElement;
  context.options = context.scriptElement.dataset;
  console.log("Launch context:", context);

  // Hand over to main
  main(context);
}

function loaded(context) {
  if (typeof APP_LAUNCH_DELAY === 'undefined' || APP_LAUNCH_DELAY === 0) {
    launch(context);
  } else {
    console.log("Delaying app launch by " + APP_LAUNCH_DELAY + " ms");
    window.setTimeout(function () {
      launch(context);
    }, APP_LAUNCH_DELAY);
  }
}

export default function (context) {
  if (document.readyState === 'complete') {
    loaded(context);
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      loaded(context);
    });
  }
}
