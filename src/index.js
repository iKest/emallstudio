import {render} from "preact";
import {Suspense, lazy} from "preact/compat";
import {html} from "htm/preact";
import scrollLock from "scroll-lock";
import Logger from "js-logger";
import "./styles/style.scss";
import Loader from "./components/loader";



scrollLock.disablePageScroll();

if (process.env.NODE_ENV === "development") {
  // react devtools
  // eslint-disable-next-line global-require
  require("preact/debug");
  Logger.useDefaults();
}
const log = Logger.get("index");
const loader = html`<${Loader} />`;
log.info("start");

const root = document.body.firstElementChild;
// render a root component in <body>
const game = lazy(() => import("./components/game"));
render(html`<${Suspense} fallback=${loader}><${game} /></${Suspense}>`,
document.body,
root);
