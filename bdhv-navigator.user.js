// ==UserScript==
// @name         Video Question Navigator
// @namespace    https://github.com/thiennd135
// @version      6.4
// @description  Adds a panel to quickly navigate to questions within the course videos.
// @author       thiennd135
// @match        https://binhdanhocvuso.gov.vn/courses/course-v1:MOET+MOET01+2025-1/courseware/*
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';
    const pageWindow = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

    GM_addStyle(`
        #bdhv-question-jumper-panel {
            position: fixed; bottom: 20px; right: 20px; background-color: #002d5c;
            color: white; padding: 15px; border-radius: 10px; z-index: 10000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.4); font-family: Arial, sans-serif;
            border: 2px solid #4d90fe; min-width: 240px; max-height: 80vh; overflow-y: auto;
        }
        #bdhv-question-jumper-panel h4 {
            margin: 0 0 10px 0; padding-bottom: 5px; border-bottom: 1px solid #4d90fe;
            text-align: center; font-size: 16px; color: #FFFFFF;
        }
        #bdhv-question-jumper-panel button {
            display: block; width: 100%; padding: 10px; margin-bottom: 5px; cursor: pointer;
            background-color: #4d90fe; color: white; border: none; border-radius: 5px;
            font-size: 14px; transition: background-color 0.2s; text-align: left;
        }
        #bdhv-question-jumper-panel button:hover { background-color: #007bff; }
        #bdhv-author-credit {
            text-align: center; font-size: 12px; margin-top: 10px;
            border-top: 1px solid #4d90fe; padding-top: 8px;
        }
        #bdhv-author-credit a {
            color: white;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            opacity: 0.7;
            transition: opacity 0.2s;
        }
        #bdhv-author-credit a:hover {
            opacity: 1;
            text-decoration: underline;
        }
        #bdhv-author-credit svg {
            width: 14px;
            height: 14px;
            fill: currentColor;
        }
    `);

    let createdPanels = new Set();

    function scanAndCreatePanels() {
        const activeContent = document.querySelector('.xblock-initialized[data-init="VerticalStudentView"]');
        if (!activeContent) return;

        const quizBlock = activeContent.querySelector('.in-video-quiz-block');
        if (!quizBlock) return;

        const videoId = quizBlock.dataset.videoid;
        if (!videoId || createdPanels.has(videoId)) return;

        const quizConfig = pageWindow.InVideoQuizXBlockV2?.config?.[videoId];

        if (quizConfig && Object.keys(quizConfig).length > 0) {
            const videoContainer = document.getElementById(`video_${videoId}`);
            const videoElement = videoContainer?.querySelector('video');

            if (videoElement) {
                createQuestionJumperPanel(videoElement, quizConfig);
                createdPanels.add(videoId);
            }
        }
    }

    function createQuestionJumperPanel(videoElement, quizConfig) {
        document.querySelectorAll('#bdhv-question-jumper-panel').forEach(p => p.remove());

        const panel = document.createElement('div');
        panel.id = 'bdhv-question-jumper-panel';
        panel.innerHTML = `<h4>Question Control (${document.querySelector(".unit-title").textContent})</h4>`;

        const timestamps = Object.keys(quizConfig).sort((a, b) => parseFloat(a) - parseFloat(b));

        timestamps.forEach((time, index) => {
            const button = document.createElement('button');
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60).toString().padStart(2, '0');
            button.innerText = `▶ Go to Question ${index + 1} (At ${minutes}:${seconds})`;
            button.onclick = () => {
                videoElement.currentTime = parseFloat(time);
                videoElement.play();
                videoElement.closest('div[id^="video_"]').scrollIntoView({ behavior: 'smooth', block: 'center' });
            };
            panel.appendChild(button);
        });

        const authorCredit = document.createElement('div');
        authorCredit.id = 'bdhv-author-credit';

        const link = document.createElement('a');
        link.href = 'https://github.com/thiennd135/bdhv-question-navigator';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';

        const githubIconSVG = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
        `;

        link.innerHTML = `by thiennd135 ${githubIconSVG}`;
        authorCredit.appendChild(link);
        panel.appendChild(authorCredit);

        document.body.appendChild(panel);
    }

    setInterval(scanAndCreatePanels, 1000);

})();
