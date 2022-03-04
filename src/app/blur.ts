import * as tf from '@tensorflow/tfjs';
import * as bodyPix from '@tensorflow-models/body-pix';

export const init=()=>{
  console.log('Using TensorFlow backend: ', tf.getBackend());
  const videoElement:any = document.getElementById('video');
  const canvas:any = document.getElementById('canvas');

  const startBtn:any = document.getElementById('start-btn');
  const stopBtn:any = document.getElementById('stop-btn');
  const blurBtn:any = document.getElementById('blur-btn');
  const unblurBtn:any = document.getElementById('unblur-btn');

  const ctx = canvas.getContext('2d');

  startBtn.addEventListener('click', (e: any) => {
    startBtn.disabled = true;
    stopBtn.disabled = false;

    unblurBtn.disabled = false;
    blurBtn.disabled = false;

    startVideoStream();
  });

  stopBtn.addEventListener('click', (e: any) => {
    startBtn.disabled = false;
    stopBtn.disabled = true;

    unblurBtn.disabled = true;
    blurBtn.disabled = true;

    unblurBtn.hidden = true;
    blurBtn.hidden = false;

    videoElement.hidden = false;
    canvas.hidden = true;

    stopVideoStream();
  });

  blurBtn.addEventListener('click', (e: any) => {
    blurBtn.hidden = true;
    unblurBtn.hidden = false;

    videoElement.hidden = true;
    canvas.hidden = false;

    loadBodyPix();
  });

  unblurBtn.addEventListener('click', (e: any) => {
    blurBtn.hidden = false;
    unblurBtn.hidden = true;

    videoElement.hidden = false;
    canvas.hidden = true;
  });

  videoElement.onplaying = () => {
    canvas.height = videoElement.videoHeight;
    canvas.width = videoElement.videoWidth;
  };

  function startVideoStream() {
    navigator.mediaDevices.getUserMedia({video: true, audio: false})
      .then(stream => {
        videoElement.srcObject = stream;
        videoElement.play();
      })
      .catch(err => {
        startBtn.disabled = false;
        blurBtn.disabled = true;
        stopBtn.disabled = true;
        alert(`Following error occured: ${err}`);
      });
  }

  function stopVideoStream() {
    const stream = videoElement.srcObject;

    stream.getTracks().forEach((track: any) => track.stop());
    videoElement.srcObject = null;
  }

   function loadBodyPix() {
    const options = {
      multiplier: 0.75,
      stride: 32,
      quantBytes: 4
    }

     bodyPix.load( )
      .then(net => performBlur(net))
      .catch(err => console.log(err))
  }

  async function performBlur(net: any) {

    while (startBtn.disabled && blurBtn.hidden) {
      const segmentation = await net.segmentPerson(videoElement);

      const backgroundBlurAmount = 6;
      const edgeBlurAmount = 2;
      const flipHorizontal = true;

      bodyPix.drawBokehEffect(
        canvas, videoElement, segmentation, backgroundBlurAmount,
        edgeBlurAmount, flipHorizontal);
    }
  }
}
