import {useRef} from "react";
import {html} from "htm/preact";
import styles from "../styles/loader.scss";

/**
 *
 * @param {Oject} props
 * @return {HTMLElement}
 */
export default function Loader(props) {
  const ref = useRef(null);
    return html`<div id="loader" ref=${ref} className=${styles["lds-roller"]}><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>`;
}
