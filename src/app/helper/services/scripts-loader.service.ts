import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ScriptsLoaderService {
  private loadedScripts: string[] = [];
  constructor() {}

  loadScript(name: string, srcUrl: string) {
    return new Promise((resolve, reject) => {
      var script = document.getElementById(name);
      if (this.loadedScripts.includes(name) && script) {
        resolve({ script: name, loaded: true, status: 'Loaded' });
      } else {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.id = name;
        script.src = srcUrl;
        script.onload = () => {
          this.loadedScripts.push(name);
          resolve({ script: name, loaded: true, status: 'Loaded' });
        };
        script.onerror = (error: any) =>
          resolve({ script: name, loaded: false, status: 'Loaded' });
        document.getElementsByTagName('head')[0].appendChild(script);
      }
    });
  }
}
