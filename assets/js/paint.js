/**
 * MS Paint - Windows 98 Easter Egg
 */
(function() {
    'use strict';

    const canvas = document.getElementById('paint-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const preview = document.getElementById('paint-preview');
    const previewCtx = preview ? preview.getContext('2d') : null;

    const coordsEl = document.getElementById('paint-coords');
    const toolNameEl = document.getElementById('paint-tool-name');
    const fgColorEl = document.getElementById('paint-fg');
    const bgColorEl = document.getElementById('paint-bg');

    let currentTool = 'pencil';
    let brushSize = 2;
    let fgColor = '#000000';
    let bgColor = '#ffffff';
    let isDrawing = false;
    let lastX = 0, lastY = 0;
    let startX = 0, startY = 0;
    let snapshot = null;

    // Classic Windows 98 color palette
    const COLORS = [
        '#000000', '#808080', '#800000', '#808000',
        '#008000', '#008080', '#000080', '#800080',
        '#808040', '#004040', '#0080ff', '#004080',
        '#4000ff', '#804000', '#ffffff', '#c0c0c0',
        '#ff0000', '#ffff00', '#00ff00', '#00ffff',
        '#0000ff', '#ff00ff', '#ffff80', '#00ff80',
        '#80ffff', '#8080ff', '#ff0080', '#ff8040'
    ];

    init();

    function init() {
        // Set canvas size
        resizeCanvas();

        // Clear to white
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        setupTools();
        setupColorPalette();
        setupBrushSizes();
        setupCanvas();
        setupMenuActions();
        updateToolDisplay();
    }

    function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = Math.max(400, container.clientWidth - 4);
        canvas.height = Math.max(300, container.clientHeight - 4);
        if (preview) {
            preview.width = canvas.width;
            preview.height = canvas.height;
        }
    }

    function setupTools() {
        document.querySelectorAll('.paint-tool').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.paint-tool').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentTool = btn.dataset.tool;
                updateToolDisplay();
                updateCanvasCursor();
            });
        });
    }

    function setupColorPalette() {
        const palette = document.getElementById('paint-palette');
        if (!palette) return;

        COLORS.forEach(color => {
            const swatch = document.createElement('button');
            swatch.className = 'paint-swatch';
            swatch.style.backgroundColor = color;
            swatch.title = color;

            swatch.addEventListener('click', (e) => {
                fgColor = color;
                if (fgColorEl) fgColorEl.style.backgroundColor = fgColor;
            });

            swatch.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                bgColor = color;
                if (bgColorEl) bgColorEl.style.backgroundColor = bgColor;
            });

            palette.appendChild(swatch);
        });

        // Set initial display
        if (fgColorEl) fgColorEl.style.backgroundColor = fgColor;
        if (bgColorEl) bgColorEl.style.backgroundColor = bgColor;
    }

    function setupBrushSizes() {
        document.querySelectorAll('.paint-size').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.paint-size').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                brushSize = parseInt(btn.dataset.size, 10);
            });
        });
    }

    function setupCanvas() {
        // Mouse events
        canvas.addEventListener('mousedown', startDraw);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', endDraw);
        canvas.addEventListener('mouseleave', endDraw);
        canvas.addEventListener('mousemove', updateCoords);

        // Touch events
        canvas.addEventListener('touchstart', handleTouch(startDraw), { passive: false });
        canvas.addEventListener('touchmove', handleTouch(draw), { passive: false });
        canvas.addEventListener('touchend', handleTouch(endDraw));
        canvas.addEventListener('touchcancel', handleTouch(endDraw));

        // Prevent context menu on canvas
        canvas.addEventListener('contextmenu', e => e.preventDefault());

        updateCanvasCursor();
    }

    function handleTouch(handler) {
        return function(e) {
            e.preventDefault();
            const touch = e.touches ? e.touches[0] : e.changedTouches[0];
            if (!touch) { handler(e); return; }
            const rect = canvas.getBoundingClientRect();
            const mouseEvent = {
                clientX: touch.clientX,
                clientY: touch.clientY,
                offsetX: touch.clientX - rect.left,
                offsetY: touch.clientY - rect.top,
                button: 0,
                preventDefault: () => {}
            };
            handler(mouseEvent);
        };
    }

    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: Math.round((e.clientX - rect.left) * (canvas.width / rect.width)),
            y: Math.round((e.clientY - rect.top) * (canvas.height / rect.height))
        };
    }

    function startDraw(e) {
        const pos = getPos(e);
        isDrawing = true;
        lastX = pos.x;
        lastY = pos.y;
        startX = pos.x;
        startY = pos.y;

        const color = (e.button === 2) ? bgColor : fgColor;

        if (currentTool === 'fill') {
            floodFill(pos.x, pos.y, color);
            isDrawing = false;
            return;
        }

        if (currentTool === 'picker') {
            pickColor(pos.x, pos.y);
            isDrawing = false;
            return;
        }

        // Save snapshot for shape tools
        if (['line', 'rectangle', 'ellipse'].includes(currentTool)) {
            snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }

        // For pencil/brush/eraser, draw a dot at start
        if (['pencil', 'brush', 'eraser', 'airbrush'].includes(currentTool)) {
            ctx.beginPath();
            ctx.fillStyle = (currentTool === 'eraser') ? bgColor : color;
            const size = (currentTool === 'pencil') ? 1 : brushSize;
            ctx.arc(pos.x, pos.y, size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function draw(e) {
        if (!isDrawing) return;
        const pos = getPos(e);
        const color = (e.button === 2) ? bgColor : fgColor;

        switch (currentTool) {
            case 'pencil':
                drawLine(ctx, lastX, lastY, pos.x, pos.y, fgColor, 1);
                lastX = pos.x;
                lastY = pos.y;
                break;

            case 'brush':
                drawLine(ctx, lastX, lastY, pos.x, pos.y, fgColor, brushSize);
                lastX = pos.x;
                lastY = pos.y;
                break;

            case 'eraser':
                drawLine(ctx, lastX, lastY, pos.x, pos.y, bgColor, brushSize * 2);
                lastX = pos.x;
                lastY = pos.y;
                break;

            case 'airbrush':
                sprayPaint(pos.x, pos.y, fgColor, brushSize * 3);
                lastX = pos.x;
                lastY = pos.y;
                break;

            case 'line':
                if (snapshot) ctx.putImageData(snapshot, 0, 0);
                drawLine(ctx, startX, startY, pos.x, pos.y, fgColor, brushSize);
                break;

            case 'rectangle':
                if (snapshot) ctx.putImageData(snapshot, 0, 0);
                drawRect(ctx, startX, startY, pos.x, pos.y, fgColor, brushSize);
                break;

            case 'ellipse':
                if (snapshot) ctx.putImageData(snapshot, 0, 0);
                drawEllipse(ctx, startX, startY, pos.x, pos.y, fgColor, brushSize);
                break;
        }
    }

    function endDraw(e) {
        if (!isDrawing) return;
        isDrawing = false;
        snapshot = null;
    }

    function drawLine(context, x1, y1, x2, y2, color, width) {
        context.beginPath();
        context.strokeStyle = color;
        context.lineWidth = width;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
    }

    function drawRect(context, x1, y1, x2, y2, color, width) {
        context.beginPath();
        context.strokeStyle = color;
        context.lineWidth = width;
        context.strokeRect(
            Math.min(x1, x2), Math.min(y1, y2),
            Math.abs(x2 - x1), Math.abs(y2 - y1)
        );
    }

    function drawEllipse(context, x1, y1, x2, y2, color, width) {
        const cx = (x1 + x2) / 2;
        const cy = (y1 + y2) / 2;
        const rx = Math.abs(x2 - x1) / 2;
        const ry = Math.abs(y2 - y1) / 2;
        context.beginPath();
        context.strokeStyle = color;
        context.lineWidth = width;
        context.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        context.stroke();
    }

    function sprayPaint(x, y, color, radius) {
        const density = 30;
        ctx.fillStyle = color;
        for (let i = 0; i < density; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * radius;
            const px = x + Math.cos(angle) * r;
            const py = y + Math.sin(angle) * r;
            ctx.fillRect(px, py, 1, 1);
        }
    }

    function floodFill(startX, startY, fillColor) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const w = canvas.width;
        const h = canvas.height;

        const idx = (startY * w + startX) * 4;
        const targetR = data[idx], targetG = data[idx + 1], targetB = data[idx + 2], targetA = data[idx + 3];

        // Parse fill color
        const temp = document.createElement('canvas').getContext('2d');
        temp.fillStyle = fillColor;
        temp.fillRect(0, 0, 1, 1);
        const fillData = temp.getImageData(0, 0, 1, 1).data;
        const fillR = fillData[0], fillG = fillData[1], fillB = fillData[2];

        // Don't fill if same color
        if (targetR === fillR && targetG === fillG && targetB === fillB && targetA === 255) return;

        const stack = [[startX, startY]];
        const visited = new Uint8Array(w * h);
        const tolerance = 10;

        function matches(i) {
            return Math.abs(data[i] - targetR) <= tolerance &&
                   Math.abs(data[i + 1] - targetG) <= tolerance &&
                   Math.abs(data[i + 2] - targetB) <= tolerance &&
                   Math.abs(data[i + 3] - targetA) <= tolerance;
        }

        while (stack.length > 0) {
            const [x, y] = stack.pop();
            if (x < 0 || x >= w || y < 0 || y >= h) continue;
            const pos = y * w + x;
            if (visited[pos]) continue;
            const i = pos * 4;
            if (!matches(i)) continue;

            visited[pos] = 1;
            data[i] = fillR;
            data[i + 1] = fillG;
            data[i + 2] = fillB;
            data[i + 3] = 255;

            stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
        }

        ctx.putImageData(imageData, 0, 0);
    }

    function pickColor(x, y) {
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const hex = '#' + [pixel[0], pixel[1], pixel[2]].map(v => v.toString(16).padStart(2, '0')).join('');
        fgColor = hex;
        if (fgColorEl) fgColorEl.style.backgroundColor = hex;
        // Switch back to pencil after picking
        document.querySelector('.paint-tool[data-tool="pencil"]')?.click();
    }

    function updateCoords(e) {
        if (!coordsEl) return;
        const pos = getPos(e);
        coordsEl.textContent = `${pos.x}, ${pos.y}px`;
    }

    function updateToolDisplay() {
        if (!toolNameEl) return;
        const names = {
            pencil: 'Pencil', brush: 'Brush', eraser: 'Eraser',
            fill: 'Fill', picker: 'Color Picker', line: 'Line',
            rectangle: 'Rectangle', ellipse: 'Ellipse', airbrush: 'Airbrush'
        };
        toolNameEl.textContent = names[currentTool] || currentTool;
    }

    function updateCanvasCursor() {
        const cursors = {
            pencil: 'crosshair', brush: 'crosshair', eraser: 'cell',
            fill: 'crosshair', picker: 'crosshair', line: 'crosshair',
            rectangle: 'crosshair', ellipse: 'crosshair', airbrush: 'crosshair'
        };
        canvas.style.cursor = cursors[currentTool] || 'crosshair';
    }

    function setupMenuActions() {
        const clearBtn = document.getElementById('paint-clear');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            });
        }
    }

})();
