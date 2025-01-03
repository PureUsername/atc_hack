// ==UserScript==
// @name         AUTOCASH Invoice Values Copy
// @namespace    https://soonkok.com/
// @version      02 Jan 2025
// @description  Copy the corresponse invoice values to clipboard
// @author       soonkok
// @match        https://erp.autocash.com.my/autocash/invoice/
// @icon         https://autocash.my/favicon.ico
// @downloadURL  https://github.com/PureUsername/atc_hack/raw/main/script.user.js
// @version      1.0.0
// ==/UserScript==

// Function to get a cookie by name
const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
};

// Get the CSRF token and session cookie
const csrfToken = getCookie('csrf_cookie');
const sessionCookie = getCookie('sf_session');

(function() {
    'use strict';

    function constructCopyValue() {

        function logHrefAttributes() {
            const elements = document.getElementsByClassName("btn btn-xs btn-warning");

            if (elements.length > 0) {
                for (let i = 0; i < elements.length; i++) {
                    // Check if the button already exists
                    if (!elements[i].nextSibling || elements[i].nextSibling.textContent !== "Copy") {
                        const copyDataButton = document.createElement("button");
                        copyDataButton.textContent = "Copy";
                        copyDataButton.style.fontSize = "10px";
                        copyDataButton.style.padding = "3px 2px";

                        let currentLineHref = elements[i].getAttribute("href");
                        elements[i].parentNode.insertBefore(copyDataButton, elements[i].nextSibling);

                        copyDataButton.onclick = function() {
                            const segments = currentLineHref.split('/');
                            const lastSegment = segments[segments.length - 1] || segments[segments.length - 2];

                            const completeURL = 'https://erp.autocash.com.my/autocash/invoice/printout/freight/' + lastSegment + '/';
                            fetch(completeURL, {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'text/html; charset=UTF-8',
                                    'Cookie': `csrf_cookie=${csrfToken};sf_session=${sessionCookie}`
                                }
                            })
                            .then(response => response.text())
                            .then(html => {
                                let completeData = "";

                                const trRegex = /<tr class="item_row font_sm"  style="height:14px">([\S\s]*?)<\/tr>/g;
                                const tdRegex = /<td[^>]*>(.*?)<\/td>/g;
                                const trMatches = html.matchAll(trRegex);

                                for (const trMatch of trMatches) {
                                    if (completeData.length > 0) {
                                        completeData = completeData + "\n";
                                    }
                                    const tdMatches = trMatch[1].matchAll(tdRegex);
                                    let eachData = "";
                                    for (const tdMatch of tdMatches) {
                                        if (eachData.length > 0) {
                                            eachData = eachData + "\t";
                                        }
                                        eachData = eachData + tdMatch[1];
                                    }
                                    completeData = completeData + eachData;
                                }

                                alert("Value copied!");
                                navigator.clipboard.writeText(completeData);
                            })
                            .catch(error => console.error('Error:', error));
                        };
                    }
                }
            }
        }
        setTimeout(logHrefAttributes, 1000);
    }

    let previousTbodyContent = document.querySelector('tbody').innerHTML;

    setInterval(() => {
        const currentTbodyContent = document.querySelector('tbody').innerHTML;
        if (currentTbodyContent !== previousTbodyContent) {
            constructCopyValue();
            previousTbodyContent = currentTbodyContent;
        }
    }, 1000);
})();
