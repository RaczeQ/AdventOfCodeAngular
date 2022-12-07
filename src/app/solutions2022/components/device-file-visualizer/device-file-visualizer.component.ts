import { Component, Input, OnInit } from '@angular/core';
import { BaseResultComponent } from '../../../helper/components/base-result.component';
import { DeviceFile } from '../../day7.service';

@Component({
  selector: 'aoc-device-file-visualizer',
  templateUrl: './device-file-visualizer.component.html',
  styleUrls: ['./device-file-visualizer.component.scss'],
})
export class DeviceFileVisualizerComponent
  extends BaseResultComponent
  implements OnInit
{
  @Input() file!: DeviceFile;
  @Input() selectedDirectories!: DeviceFile[];
  @Input() depth: number = 0;
  @Input() separators: number[] = [];
  @Input() isChild: boolean = false;
  @Input() isLast: boolean = true;

  ngOnInit(): void {
    if (this.data) {
      this.file = this.data.file as DeviceFile;
      this.selectedDirectories = this.data.selectedDirectories as DeviceFile[];
    }
  }

  matchDeviceFile(file: DeviceFile): boolean {
    return this.selectedDirectories.some((dir) => {
      return (
        file.isDirectory &&
        file.fileName === dir.fileName &&
        file.fileSize === dir.fileSize
      );
    });
  }
}
