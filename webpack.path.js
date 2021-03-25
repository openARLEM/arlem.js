// Set the webpack path for resolving chunks
let currentScript = document.currentScript || (function (list) { return list[list.length - 1]; })(document.querySelectorAll('div script'));
let scriptSrc = currentScript.src;
scriptSrc = scriptSrc.substring(0, scriptSrc.lastIndexOf('/') + 1);
__webpack_public_path__ = scriptSrc;
