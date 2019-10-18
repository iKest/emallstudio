import {render} from "preact";
import {Suspense, lazy} from "preact/compat";
import {html} from "htm/preact";
import scrollLock from "scroll-lock";
import Logger from "js-logger";
import styles from "./styles/style.scss";



scrollLock.disablePageScroll();

if (process.env.NODE_ENV === "development") {
  // react devtools
  // eslint-disable-next-line global-require
  require("preact/debug");
  Logger.useDefaults();
}
const log = Logger.get("index");
log.info("start");

const root = document.body.firstElementChild;
// render a root component in <body>
const app = lazy(() => import("./components/app"));
render(html`<${Suspense} fallback=${html`<div className=${styles["lds-roller"]}><div /><div /><div /><div /><div /><div /><div /><div /></div>`}>
<${app} /></${Suspense}>`,
document.body,
root);
