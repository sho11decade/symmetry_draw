const canvas = document.getElementById('paintCanvas');
const downloadButton = document.getElementById('download');
const uploadButton = document.getElementById('upload');

uploadButton.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    saveState();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
});

downloadButton.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'canvas_image.png';
    link.href = canvas.toDataURL();
    link.click();
});

const resizeButton = document.getElementById('resize');
const canvasWidthInput = document.getElementById('canvas-width');
const canvasHeightInput = document.getElementById('canvas-height');

canvasWidthInput.addEventListener('input', () => {
    const newWidth = parseInt(canvasWidthInput.value);
    if (!isNaN(newWidth) && newWidth > 0) {
        canvas.width = newWidth;
        clearCanvas();
    }
});

canvasHeightInput.addEventListener('input', () => {
    const newHeight = parseInt(canvasHeightInput.value);
    if (!isNaN(newHeight) && newHeight > 0) {
        canvas.height = newHeight;
        clearCanvas();
    }
});
const ctx = canvas.getContext('2d');

// Default settings
let drawing = false;
let currentColor = '#000000';
let penSize = 5;
let symmetry = 1;
let isLineSymmetry = false;
let isPointSymmetry = false;
let lastX = null;
let lastY = null;
let undoStack = [];
let redoStack = [];

// Resize canvas to fit window
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

// Event listeners for drawing
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);
canvas.addEventListener('mousemove', draw);

// Tools and settings
const colorPicker = document.getElementById('color');
const penSizeInput = document.getElementById('pen-size');
const symmetryInput = document.getElementById('symmetry');
const undoButton = document.getElementById('undo');
const redoButton = document.getElementById('redo');
const clearButton = document.getElementById('clear'); // New clear button
const lineSymmetryButton = document.getElementById('line-symmetry');
const pointSymmetryButton = document.getElementById('point-symmetry');

colorPicker.addEventListener('input', (e) => {
    currentColor = e.target.value;
});

penSizeInput.addEventListener('input', (e) => {
    penSize = e.target.value;
});

symmetryInput.addEventListener('input', (e) => {
    symmetry = e.target.value;
});

undoButton.addEventListener('click', undo);
redoButton.addEventListener('click', redo);
clearButton.addEventListener('click', clearCanvas); // Attach clear function to button

lineSymmetryButton.addEventListener('click', () => {
    isLineSymmetry = !isLineSymmetry;
    isPointSymmetry = false;
});

pointSymmetryButton.addEventListener('click', () => {
    isPointSymmetry = !isPointSymmetry;
    isLineSymmetry = false;
});

function startDrawing(e) {
    drawing = true;
    saveState();
    const rect = canvas.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
}

function stopDrawing() {
    drawing = false;
    lastX = null;
    lastY = null;
    ctx.beginPath();
}

function draw(e) {
    if (!drawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isLineSymmetry) {
        drawLineSymmetry(x, y);
    } else if (isPointSymmetry) {
        drawPointSymmetry(x, y);
    } else {
        drawSymmetry(x, y);
    }

    lastX = x;
    lastY = y;
}

function drawSymmetry(x, y) {
    for (let i = 0; i < symmetry; i++) {
        const angle = (i * 2 * Math.PI) / symmetry;
        const symX = Math.cos(angle) * (x - canvas.width / 2) - Math.sin(angle) * (y - canvas.height / 2) + canvas.width / 2;
        const symY = Math.sin(angle) * (x - canvas.width / 2) + Math.cos(angle) * (y - canvas.height / 2) + canvas.height / 2;

        drawLine(lastX, lastY, symX, symY);
    }
    drawLine(lastX, lastY, x, y);
}

function drawLineSymmetry(x, y) {
    const centerX = canvas.width / 2;
    const symX = 2 * centerX - x;

    drawLine(lastX, lastY, x, y);
    drawLine(2 * centerX - lastX, lastY, symX, y);
}

function drawPointSymmetry(x, y) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const symX = 2 * centerX - x;
    const symY = 2 * centerY - y;

    drawLine(lastX, lastY, x, y);
    drawLine(2 * centerX - lastX, 2 * centerY - lastY, symX, symY);
}

function drawLine(x1, y1, x2, y2) {
    if (x1 === null || y1 === null) return;

    ctx.lineWidth = penSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentColor;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveState();
}

function saveState() {
    undoStack.push(canvas.toDataURL());
    redoStack = []; // Clear redo stack
}

function undo() {
    if (undoStack.length > 0) {
        redoStack.push(canvas.toDataURL());
        const img = new Image();
        img.src = undoStack.pop();
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
    }
}

function redo() {
    if (redoStack.length > 0) {
        undoStack.push(canvas.toDataURL());
        const img = new Image();
        img.src = redoStack.pop();
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
    }
}
