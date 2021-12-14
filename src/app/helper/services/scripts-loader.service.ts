import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ScriptsLoaderService {
  constructor() {}

  loadScript(name: string, srcUrl: string) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = srcUrl;
      script.onload = () => {
        resolve({ script: name, loaded: true, status: 'Loaded' });
      };
      script.onerror = (error: any) =>
        resolve({ script: name, loaded: false, status: 'Loaded' });
      document.getElementsByTagName('head')[0].appendChild(script);
    });
  }
}
