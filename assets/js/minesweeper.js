/**
 * Minesweeper - Windows 98 Easter Egg
 */
(function() {
    'use strict';

    const DIFFICULTIES = {
        beginner:     { rows: 9,  cols: 9,  mines: 10 },
        intermediate: { rows: 16, cols: 16, mines: 40 },
        expert:       { rows: 16, cols: 30, mines: 99 }
    };

    let grid = [];
    let rows = 9, cols = 9, totalMines = 10;
    let minesLeft = 10;
    let revealed = 0;
    let gameOver = false;
    let gameStarted = false;
    let timerInterval = null;
    let seconds = 0;
    let flagMode = false;

    const gridEl = document.getElementById('minesweeper-grid');
    const mineCountEl = document.getElementById('mine-count');
    const timerEl = document.getElementById('ms-timer');
    const faceBtn = document.getElementById('ms-face');
    const statusEl = document.querySelector('#window-minesweeper .status-bar-field');

    if (!gridEl) return;

    // Difficulty menu items
    document.querySelectorAll('[data-difficulty]').forEach(item => {
        item.addEventListener('click', () => {
            const d = item.dataset.difficulty;
            if (DIFFICULTIES[d]) {
                const diff = DIFFICULTIES[d];
                rows = diff.rows;
                cols = diff.cols;
                totalMines = diff.mines;
                newGame();
            }
        });
    });

    // Face button resets game
    faceBtn.addEventListener('click', newGame);

    // Flag mode toggle for mobile
    const flagToggle = document.getElementById('ms-flag-toggle');
    if (flagToggle) {
        flagToggle.addEventListener('click', () => {
            flagMode = !flagMode;
            flagToggle.classList.toggle('active', flagMode);
            flagToggle.textContent = flagMode ? '\u{1F6A9}' : '\u{1F6A9}';
            flagToggle.title = flagMode ? 'Flag mode ON' : 'Flag mode OFF';
        });
    }

    newGame();

    function newGame() {
        grid = [];
        minesLeft = totalMines;
        revealed = 0;
        gameOver = false;
        gameStarted = false;
        seconds = 0;
        flagMode = false;
        if (flagToggle) flagToggle.classList.remove('active');
        clearInterval(timerInterval);
        timerInterval = null;

        updateCounter(mineCountEl, minesLeft);
        updateCounter(timerEl, 0);
        faceBtn.textContent = '\u{1F642}';
        if (statusEl) statusEl.textContent = 'Ready';

        // Build grid data
        for (let r = 0; r < rows; r++) {
            grid[r] = [];
            for (let c = 0; c < cols; c++) {
                grid[r][c] = { mine: false, revealed: false, flagged: false, adjacent: 0 };
            }
        }

        renderGrid();
    }

    function placeMines(safeRow, safeCol) {
        let placed = 0;
        while (placed < totalMines) {
            const r = Math.floor(Math.random() * rows);
            const c = Math.floor(Math.random() * cols);
            if (grid[r][c].mine) continue;
            if (Math.abs(r - safeRow) <= 1 && Math.abs(c - safeCol) <= 1) continue;
            grid[r][c].mine = true;
            placed++;
        }
        // Calculate adjacency
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (grid[r][c].mine) continue;
                let count = 0;
                forNeighbors(r, c, (nr, nc) => {
                    if (grid[nr][nc].mine) count++;
                });
                grid[r][c].adjacent = count;
            }
        }
    }

    function renderGrid() {
        gridEl.innerHTML = '';
        gridEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = document.createElement('button');
                cell.className = 'ms-cell ms-hidden';
                cell.dataset.row = r;
                cell.dataset.col = c;

                cell.addEventListener('click', (e) => {
                    if (flagMode) {
                        toggleFlag(r, c);
                    } else {
                        revealCell(r, c);
                    }
                });

                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    toggleFlag(r, c);
                });

                // Long press for flag on touch
                let longPressTimer = null;
                cell.addEventListener('touchstart', (e) => {
                    if (flagMode) return;
                    longPressTimer = setTimeout(() => {
                        e.preventDefault();
                        toggleFlag(r, c);
                        longPressTimer = null;
                    }, 500);
                }, { passive: false });
                cell.addEventListener('touchend', () => {
                    if (longPressTimer) clearTimeout(longPressTimer);
                });
                cell.addEventListener('touchmove', () => {
                    if (longPressTimer) clearTimeout(longPressTimer);
                });

                // Face goes nervous on mousedown
                cell.addEventListener('mousedown', () => {
                    if (!gameOver) faceBtn.textContent = '\u{1F62E}';
                });
                cell.addEventListener('mouseup', () => {
                    if (!gameOver) faceBtn.textContent = '\u{1F642}';
                });

                gridEl.appendChild(cell);
            }
        }
    }

    function revealCell(r, c) {
        if (gameOver) return;
        const cell = grid[r][c];
        if (cell.revealed || cell.flagged) return;

        // First click: place mines ensuring safe start
        if (!gameStarted) {
            gameStarted = true;
            placeMines(r, c);
            startTimer();
        }

        cell.revealed = true;
        revealed++;

        const el = getCellEl(r, c);
        el.classList.remove('ms-hidden');
        el.classList.add('ms-revealed');

        if (cell.mine) {
            el.classList.add('ms-mine-hit');
            el.textContent = '\u{1F4A3}';
            endGame(false);
            return;
        }

        if (cell.adjacent > 0) {
            el.textContent = cell.adjacent;
            el.dataset.num = cell.adjacent;
        } else {
            // Flood fill for empty cells
            forNeighbors(r, c, (nr, nc) => {
                if (!grid[nr][nc].revealed && !grid[nr][nc].flagged) {
                    revealCell(nr, nc);
                }
            });
        }

        checkWin();
    }

    function toggleFlag(r, c) {
        if (gameOver) return;
        const cell = grid[r][c];
        if (cell.revealed) return;

        cell.flagged = !cell.flagged;
        const el = getCellEl(r, c);

        if (cell.flagged) {
            el.textContent = '\u{1F6A9}';
            el.classList.add('ms-flagged');
            minesLeft--;
        } else {
            el.textContent = '';
            el.classList.remove('ms-flagged');
            minesLeft++;
        }
        updateCounter(mineCountEl, minesLeft);
    }

    function checkWin() {
        const totalSafe = rows * cols - totalMines;
        if (revealed === totalSafe) {
            endGame(true);
        }
    }

    function endGame(won) {
        gameOver = true;
        clearInterval(timerInterval);

        if (won) {
            faceBtn.textContent = '\u{1F60E}';
            if (statusEl) statusEl.textContent = 'You win!';
            // Flag all remaining mines
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    if (grid[r][c].mine && !grid[r][c].flagged) {
                        const el = getCellEl(r, c);
                        el.textContent = '\u{1F6A9}';
                        el.classList.add('ms-flagged');
                    }
                }
            }
        } else {
            faceBtn.textContent = '\u{1F635}';
            if (statusEl) statusEl.textContent = 'Game over!';
            // Reveal all mines
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    if (grid[r][c].mine && !grid[r][c].flagged) {
                        const el = getCellEl(r, c);
                        el.classList.remove('ms-hidden');
                        el.classList.add('ms-revealed');
                        el.textContent = '\u{1F4A3}';
                    }
                    // Show wrong flags
                    if (grid[r][c].flagged && !grid[r][c].mine) {
                        const el = getCellEl(r, c);
                        el.classList.add('ms-wrong-flag');
                        el.textContent = '\u{274C}';
                    }
                }
            }
        }
    }

    function startTimer() {
        timerInterval = setInterval(() => {
            seconds++;
            if (seconds > 999) seconds = 999;
            updateCounter(timerEl, seconds);
        }, 1000);
    }

    function updateCounter(el, val) {
        if (!el) return;
        const str = Math.max(0, Math.min(999, Math.abs(val))).toString().padStart(3, '0');
        el.textContent = (val < 0 ? '-' : '') + str;
    }

    function getCellEl(r, c) {
        return gridEl.children[r * cols + c];
    }

    function forNeighbors(r, c, fn) {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                    fn(nr, nc);
                }
            }
        }
    }

})();
