import { ScriptsLoaderService } from '../services/scripts-loader.service';

declare let Tesseract: any;

export async function OCR(
  x: number[],
  y: number[],
  z: number[],
  scriptsLoaderService: ScriptsLoaderService
): Promise<string> {
  var maxX = Math.max(...x);
  var maxY = Math.max(...y);

  var canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d');
  let image = document.getElementById('source');
  const magnifier = 5;
  canvas.width = magnifier * (maxX + 3);
  canvas.height = magnifier * (maxY + 3);
  for (let i = 0; i < x.length; i++) {
    if (z[i] > 0) {
      ctx?.fillRect(
        (x[i] + 1) * magnifier,
        (y[i] + 1) * magnifier,
        magnifier,
        magnifier
      );
    }
  }
  const data = canvas.toDataURL();
  return scriptsLoaderService
    .loadScript(
      'Tesseract',
      'https://unpkg.com/tesseract.js@v2.1.0/dist/tesseract.min.js'
    )
    .then((res) => {
      return Tesseract.recognize(data, 'eng', {}).then((data: any) => {
        return data.data.text;
      });
    });
}
