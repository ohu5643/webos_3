import './style.css';
import WindowManager from './kernel/WindowManager.js';
import { auth } from './firebase/firebase.js';

import {
    signInAnonymously,
    onAuthStateChanged
}
from "firebase/auth";

import FileSystem from './kernel/FileSystem.js';

document.querySelector('#app').innerHTML = `
<div id="desktop">
    <div id="taskbar">
        <div id="start-button">WebOS</div>
    </div>

    <div id="desktop-icons">
        <div class="icon" id="explorer-icon">
            📁
            <span>Explorer</span>
        </div>

        <div class="icon" id="notepad-icon">
            📝
            <span>Notepad</span>
        </div>
    </div>
</div>
`;

console.log("WebOS Boot Complete");

const wm = new WindowManager();

document
    .getElementById('explorer-icon')
    .addEventListener('dblclick', async () => {

        const user = auth.currentUser;

        if (!user) return;

        const nodes =
            await fs.getNodes(
                user.uid
            );

        const html =
            nodes.map(
                node => `
                    <div class="file-item">
                        📁 ${node.name}
                    </div>
                `
            ).join('');

        const win =
            wm.createWindow(
                'Explorer',
                `
                <button id="new-folder-btn">
                    새 폴더
                </button>

                <div class="explorer-list">
                    ${html}
                </div>
                `
            );

        const btn =
            win.querySelector(
                '#new-folder-btn'
            );

        btn.addEventListener(
            'click',
            async () => {

                const folderName =
                    prompt(
                        '폴더 이름'
                    );

                if (!folderName) return;

                await fs.createFolder(
                    user.uid,
                    folderName
                );

                win.remove();

                document
                    .getElementById(
                        'explorer-icon'
                    )
                    .dispatchEvent(
                        new Event(
                            'dblclick'
                        )
                    );

            }
        );

    });

document
    .getElementById('notepad-icon')
    .addEventListener('dblclick', () => {

        wm.createWindow(
            'Notepad',
            `
            <textarea
                style="
                width:100%;
                height:300px;
                "
            ></textarea>
            `
        );

    });

const fs = new FileSystem();

signInAnonymously(auth);

onAuthStateChanged(
    auth,
    async user => {

        console.log("User:", user);

        if (!user) return;

        try {

            await fs.initialize(
                user.uid
            );

            console.log(
                "Filesystem initialized"
            );

        } catch(error) {

            console.error(
                "FS ERROR:",
                error
            );

        }

        console.log(
            "Logged In",
            user.uid
        );

    }
);