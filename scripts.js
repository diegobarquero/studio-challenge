const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const errorMessage = document.getElementById("error-message");
const appContent = document.getElementById("app-content");
const takePictureBtn = document.getElementById("take-picture-btn");
const toolBar = document.getElementById("toolbar")

let backgroundImage = null;
let elements = [];
let selectedElement = null;
let resizing = false;
let offsetX = 0;
let offsetY = 0;

navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
    appContent.style.display = "block";
  })
  .catch((err) => {
    console.error("Error accessing webcam: ", err);
    errorMessage.style.display = "block";
  });

function takePicture() {
  backgroundImage = document.createElement("canvas");
  backgroundImage.width = canvas.width;
  backgroundImage.height = canvas.height;
  backgroundImage
    .getContext("2d")
    .drawImage(video, 0, 0, canvas.width, canvas.height);
  drawElements();

  takePictureBtn.classList.add("hide-elem");
  video.classList.add("hide-elem");
  canvas.classList.remove("hide-elem");
  toolBar.classList.remove("hide-elem");
}

function drag(event) {
  event.dataTransfer.setData("text", event.target.id);
}

canvas.ondragover = (event) => event.preventDefault();

canvas.ondrop = (event) => {
  event.preventDefault();
  const id = event.dataTransfer.getData("text");
  const img = document.getElementById(id);
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const element = {
    img,
    x: x - img.width / 2,
    y: y - img.height / 2,
    width: img.width,
    height: img.height,
  };
  elements.push(element);
  drawElements();
};

function drawElements() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (backgroundImage) {
    ctx.drawImage(backgroundImage, 0, 0);
  }

  elements.forEach((el) => {
    ctx.drawImage(el.img, el.x, el.y, el.width, el.height);

    if (el === selectedElement) {
      drawBordersAndCorners(el);
    }
  });
}

function drawBordersAndCorners(el) {
  ctx.strokeStyle = "rgba(0, 0, 0, 0.6)";
  ctx.lineWidth = 1;
  ctx.strokeRect(el.x, el.y, el.width, el.height);

  ctx.fillStyle = "rgba(255, 0, 0, 0.7)";
  ctx.fillRect(el.x + el.width - 12, el.y + el.height - 12, 12, 12);
}

canvas.addEventListener("mousedown", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  selectedElement = elements.find(
    (el) =>
      x >= el.x &&
      x <= el.x + el.width &&
      y >= el.y &&
      y <= el.y + el.height
  );

  if (selectedElement) {
    const cornerX = selectedElement.x + selectedElement.width - 12;
    const cornerY = selectedElement.y + selectedElement.height - 12;
    resizing =
      x >= cornerX &&
      x <= cornerX + 12 &&
      y >= cornerY &&
      y <= cornerY + 12;

    offsetX = x - selectedElement.x;
    offsetY = y - selectedElement.y;
  }

  drawElements();
});

canvas.addEventListener("mousemove", (event) => {
  if (selectedElement) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (resizing) {
      selectedElement.width = Math.max(10, x - selectedElement.x);
      selectedElement.height = Math.max(10, y - selectedElement.y);
    } else {
      selectedElement.x = x - offsetX;
      selectedElement.y = y - offsetY;
    }
    drawElements();
  }
});

canvas.addEventListener("mouseup", () => {
  resizing = false;
  selectedElement = null;
});

canvas.addEventListener("dblclick", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const indexToRemove = elements.findIndex(
    (el) =>
      x >= el.x &&
      x <= el.x + el.width &&
      y >= el.y &&
      y <= el.y + el.height
  );

  if (indexToRemove !== -1) {
    elements.splice(indexToRemove, 1);
    drawElements();
  }
});

function saveImage() {
  const dataURL = canvas.toDataURL();

  const link = document.createElement("a");
  link.download = "pet_yourself.png";
  link.href = dataURL;

  link.click();
}

function resetCanvas() {
  elements = [];
  backgroundImage = null;
  selectedElement = null;
  drawElements();
  takePictureBtn.classList.remove("hide-elem");
  video.classList.remove("hide-elem");
  canvas.classList.add("hide-elem");
  toolBar.classList.add("hide-elem");
}
