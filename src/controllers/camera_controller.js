import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [ "error", "photoContainer", "video", "select" ]
  static classes = [ "supported" ]
  static photoArray = []

  connect() {
    console.log('Camera Controller connected');
    this.loadCameras();
  }

  async loadCameras() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');

      this.selectTarget.textContent = '';

      cameras.sort((a, b) => {
        // Сначала проверяем наличие 'back' в label или facingMode
        const aIsBack = a.label.includes('back') || a.label.includes('Back') || (a.facingMode && a.facingMode.toLowerCase() === 'back');
        const bIsBack = b.label.includes('back') || b.label.includes('Back') || (b.facingMode && b.facingMode.toLowerCase() === 'back');
      
        if (aIsBack && !bIsBack) {
          return -1; // Передаем 'a' перед 'b', если 'a' - задняя камера
        } else if (!aIsBack && bIsBack) {
          return 1; // Передаем 'b' перед 'a', если 'b' - задняя камера
        } else {
          return 0; // Не меняем порядок, если оба или ни один из них не является задней камерой
        }
      });

      cameras.forEach(camera => {
        const option = document.createElement('option');
        option.value = camera.deviceId;
        option.text = camera.label || `Camera ${this.selectTarget.length + 1}`;
        this.selectTarget.add(option);
      });

      console.log('Camera devices loaded');

      // Trigger the change event to load the selected camera
      this.selectTarget.dispatchEvent(new Event('change'));
    } catch (error) {
      console.error('Error loading cameras:', error);
    }
  }

  changeCamera(event) {
    const cameraId = event.target.value
    console.log('Camera device changed to', cameraId);
    this.setCamera(cameraId)
  }

  setCamera(cameraId = null) {
    // Access the camera when the controller is connected
    let conf = {
      video: {
        facingMode: 'environment'
      }
    }

    if(cameraId !== null) {
      conf.video.deviceId = {
        exact: cameraId
      }
    }

    navigator.mediaDevices.getUserMedia(conf).then(stream => {
      this.element.classList.add(this.supportedClass);
      this.videoTarget.srcObject = stream
    }).catch(error => {
      console.error('Error accessing camera:', error)
      this.errorTarget.textContent = `Error accessing camera. ${error}.`
    });
  }
  
  capture() {
    const videoElement = this.element.querySelector('video');
    const canvas = this.element.querySelector('canvas');
    const context = canvas.getContext('2d');

    // Ensure that the canvas has the same dimensions as the video
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    // Draw the current frame from the video onto the canvas
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // Retrieve the image data from the canvas
    const imageData = canvas.toDataURL('image/png');

    this.constructor.photoArray.push(imageData);
    const imgElement = document.createElement('img');
    imgElement.src = imageData;
    imgElement.classList.add('camera-photo');
    this.photoContainerTarget.appendChild(imgElement);

    // You can now use the 'imageData' variable to send the captured image data wherever you need
    console.log('Captured image data:', imageData);
  }

  remove(event) {
    const index = event.target.dataset.index;

    if (index !== undefined) {
      // Remove the photo at the specified index from the photo array
      this.constructor.photoArray.splice(index, 1);
      // You can update your UI to reflect the changes in the photo array
      console.log('Photo Array after deletion:', this.constructor.photoArray);
    }
  }
}
