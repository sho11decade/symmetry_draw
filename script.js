const canvas = document.getElementById('paintCanvas');
const downloadButton = document.getElementById('download');
const uploadButton = document.getElementById('upload');
const gradientCheckbox = document.getElementById('gradient');
let hue = 0;

var hslToRgb10 = function(hue, saturation, lightness) {
	var result = false;

	if (((hue || hue === 0) && hue <= 360) && ((saturation || saturation === 0) && saturation <= 100) && ((lightness || lightness === 0) && lightness <= 100)) {
		var red   = 0,
		    green = 0,
		    blue  = 0,
		    q     = 0,
		    p     = 0;

		hue        = Number(hue)        / 360;
		saturation = Number(saturation) / 100;
		lightness  = Number(lightness)  / 100;

		if (saturation === 0) {
			red   = lightness;
			green = lightness;
			blue  = lightness;
		} else {
			var hueToRgb = function(p, q, t) {
				if (t < 0) t += 1;
				if (t > 1) t -= 1;

				if (t < 1 / 6) {
					p = p + (q - p) * 6 * t;
				} else if (t < 1 / 2) {
					p = q;
				} else if (t < 2 / 3) {
					p = p + (q - p) * (2 / 3 - t) * 6;
				}

				return p;
			};

			if (lightness < 0.5) {
				q = lightness * (1 + saturation);
			} else {
				q = lightness + saturation - lightness * saturation;
			}
			p = 2 * lightness - q;

			red   = hueToRgb(p, q, hue + 1 / 3);
			green = hueToRgb(p, q, hue);
			blue  = hueToRgb(p, q, hue - 1 / 3);
		}

		result = {
			red   : Math.round(red   * 255),
			green : Math.round(green * 255),
			blue  : Math.round(blue  * 255)
		};
	}

	return result;
};

const rulerCheckbox = document.getElementById('ruler');

rulerCheckbox.addEventListener('change', () => {
    if (rulerCheckbox.checked) {
        canvas.removeEventListener('mousemove', draw);
        canvas.addEventListener('mousemove', drawStraightLine);
    } else {
        canvas.removeEventListener('mousemove', drawStraightLine);
        canvas.addEventListener('mousemove', draw);
    }
});
function drawStraightLine(e) {
    if (!drawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (undoStack.length > 0) {
        const img = new Image();
        img.src = undoStack[undoStack.length - 1];
        img.onload = () => {
            ctx.drawImage(img, 0, 0);
            ctx.lineWidth = penSize;
            ctx.lineCap = 'round';
            ctx.strokeStyle = currentColor;
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.closePath();
        };
    }
}
const eraserCheckbox = document.getElementById('eraser');

eraserCheckbox.addEventListener('change', () => {
    if (eraserCheckbox.checked) {
        currentColor = '#FFFFFF'; // Assuming white background for eraser
    } else {
        currentColor = colorPicker.value; // Revert to selected color
    }
});
function updateColor() {
    if (gradientCheckbox.checked) {
        currentColor = `hsl(${hue}, 100%, 50%)`;
        hue = (hue + 1) % 360;
        console.log(hue, currentColor);
        //rgb = hslToRgb10(hue, 100, 50);
        //cosole.log(rgb);
    }
}

canvas.addEventListener('mousemove', () => {
    if (drawing) {
        updateColor();
    }
});
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
