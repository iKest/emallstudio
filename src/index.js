import {h, render} from "preact";
import htm from "htm";
import App from "./components/app";

if (process.env.NODE_ENV === "development") {
  // react devtools
  // eslint-disable-next-line global-require
  require("preact/debug");
}
const html = htm.bind(h);

let root = document.body.firstElementChild;
// render a root component in <body>
const rendering = Component => {
  root = render(
    html`<${Component} />`,
    document.body,
    root
  );
};

// preact hmr
if (module.hot) {
  module.hot.accept("./components/app", () => rendering(App));
}

rendering(App);
